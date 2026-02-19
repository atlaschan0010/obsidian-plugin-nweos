import { App, View, WorkspaceLeaf, Setting, TAbstractFile, TFile } from 'obsidian';
import { NWEOSCharacter } from '../types/nweos';
import { CharacterStore } from '../storage/CharacterStore';
import { CharacterListItem } from './CharacterListItem';
import { EditorModal } from './EditorModal';
import type NWEOSPlugin from '../main';

export const NWEOS_SIDEBAR_VIEW_TYPE = 'nweos-sidebar';

export class SidebarView extends View {
  private characterStore: CharacterStore;
  private plugin: NWEOSPlugin;
  private characters: NWEOSCharacter[] = [];
  private searchQuery: string = '';
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private listContainer: HTMLElement | null = null;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(leaf: WorkspaceLeaf, app: App, characterStore: CharacterStore, plugin: NWEOSPlugin) {
    super(leaf);
    this.characterStore = characterStore;
    this.plugin = plugin;
  }

  getViewType(): string {
    return NWEOS_SIDEBAR_VIEW_TYPE;
  }

  getDisplayText(): string {
    return 'NWEOS角色卡';
  }

  async onOpen(): Promise<void> {
    await this.loadCharacters();
    this.render();

    // 监听文件变动，自动刷新角色列表
    this.registerEvent(this.app.vault.on('create', (file) => this.onFileChange(file)));
    this.registerEvent(this.app.vault.on('delete', (file) => this.onFileChange(file)));
    this.registerEvent(this.app.vault.on('modify', (file) => this.onFileChange(file)));
  }

  private onFileChange(file: TAbstractFile): void {
    const settings = this.plugin.getSettings();
    const charPath = settings.charactersPath || 'characters';
    if (file instanceof TFile && file.extension === 'json' && file.path.startsWith(charPath)) {
      if (this.refreshTimer) clearTimeout(this.refreshTimer);
      this.refreshTimer = setTimeout(async () => {
        await this.loadCharacters();
        this.render();
      }, 500);
    }
  }

  async onClose(): Promise<void> {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  private async loadCharacters(): Promise<void> {
    this.characters = await this.characterStore.loadCharacters();
  }

  private render(): void {
    const container = this.containerEl;
    container.empty();

    container.createDiv('nweos-sidebar', sidebarEl => {
      const headerEl = sidebarEl.createDiv('nweos-sidebar-header');
      headerEl.createDiv('nweos-sidebar-title').textContent = 'NWEOS角色卡';

      new Setting(headerEl)
        .addButton(btn => btn
          .setButtonText('+ 新建角色卡')
          .setCta()
          .onClick(() => this.handleCreateNew()));

      const searchEl = sidebarEl.createDiv('nweos-sidebar-search');
      const searchWrapper = searchEl.createDiv('nweos-search-wrapper');
      const searchInput = searchWrapper.createEl('input', {
        type: 'text',
        placeholder: '搜索角色（按回车搜索）...'
      });
      searchInput.value = this.searchQuery;

      const clearBtn = searchWrapper.createEl('button', { text: '×', cls: 'nweos-search-clear' });
      clearBtn.style.display = this.searchQuery ? 'block' : 'none';

      // 回车搜索
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
          clearBtn.style.display = this.searchQuery ? 'block' : 'none';
          if (this.listContainer) this.renderCharacterList(this.listContainer);
        }
      });

      // 输入防抖 500ms
      searchInput.addEventListener('input', (e) => {
        if (this.searchTimer) clearTimeout(this.searchTimer);
        const value = (e.target as HTMLInputElement).value;
        clearBtn.style.display = value ? 'block' : 'none';
        this.searchTimer = setTimeout(() => {
          this.searchQuery = value.toLowerCase();
          if (this.listContainer) this.renderCharacterList(this.listContainer);
        }, 500);
      });

      // 清空搜索
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        this.searchQuery = '';
        clearBtn.style.display = 'none';
        if (this.listContainer) this.renderCharacterList(this.listContainer);
      });

      this.listContainer = sidebarEl.createDiv('nweos-sidebar-list');
      this.renderCharacterList(this.listContainer);
    });
  }

  private renderCharacterList(container: HTMLElement): void {
    container.empty();

    const filteredCharacters = this.searchQuery
      ? this.characters.filter(char => {
        const name = char.metadata.character_name.toLowerCase();
        const workName = char.metadata.work_name.toLowerCase();
        const position = char.metadata.character_position.toLowerCase();
        const tags = char.core_position?.track_adapt_tags?.join(' ').toLowerCase() || '';
        return name.includes(this.searchQuery) ||
          workName.includes(this.searchQuery) ||
          position.includes(this.searchQuery) ||
          tags.includes(this.searchQuery);
      })
      : this.characters;

    const groupedByWork = this.groupByWork(filteredCharacters);

    if (Object.keys(groupedByWork).length === 0) {
      container.createDiv('nweos-empty-state').textContent = this.characters.length === 0
        ? '暂无角色卡，点击"新建角色卡"开始创建'
        : '没有匹配的角色';
      return;
    }

    Object.entries(groupedByWork).forEach(([workName, characters]) => {
      const groupEl = container.createDiv('nweos-character-group');
      const groupHeaderEl = groupEl.createDiv('nweos-character-group-header');
      groupHeaderEl.textContent = workName || '未命名作品';
      groupHeaderEl.createSpan('nweos-character-count').textContent = `(${characters.length})`;

      const itemsEl = groupEl.createDiv('nweos-character-items');
      characters.forEach(character => {
        new CharacterListItem(itemsEl, {
          character,
          onClick: (char) => this.handleOpenEditor(char),
          onEdit: (char) => this.handleOpenEditor(char),
          onDelete: (char) => this.handleDelete(char),
          onCopyJson: (char) => this.handleCopyJson(char)
        });
      });
    });
  }

  private groupByWork(characters: NWEOSCharacter[]): Record<string, NWEOSCharacter[]> {
    return characters.reduce((groups, character) => {
      const workName = character.metadata.work_name || '未命名作品';
      if (!groups[workName]) {
        groups[workName] = [];
      }
      groups[workName].push(character);
      return groups;
    }, {} as Record<string, NWEOSCharacter[]>);
  }

  private handleCreateNew(): void {
    const settings = this.plugin.getSettings();
    const modal = new EditorModal({
      app: this.app,
      onSave: async (character) => {
        await this.characterStore.saveCharacter(character);
        await this.loadCharacters();
        this.render();
      },
      onExportJson: (character) => this.handleExportJson(character),
      defaults: {
        workName: settings.workName,
        novelTrack: settings.novelTrack,
        author: settings.author,
      }
    });
    modal.open();
  }

  private handleOpenEditor(character: NWEOSCharacter): void {
    const modal = new EditorModal({
      app: this.app,
      character,
      onSave: async (updatedCharacter) => {
        await this.characterStore.saveCharacter(updatedCharacter);
        await this.loadCharacters();
        this.render();
      },
      onExportJson: (char) => this.handleExportJson(char)
    });
    modal.open();
  }

  private async handleDelete(character: NWEOSCharacter): Promise<void> {
    const confirmed = confirm(`确定要删除角色"${character.metadata.character_name}"吗？此操作不可撤销。`);
    if (confirmed) {
      await this.characterStore.deleteCharacter(character.metadata.character_id);
      await this.loadCharacters();
      this.render();
    }
  }

  private handleCopyJson(character: NWEOSCharacter): void {
    const jsonString = JSON.stringify(character, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      new Notice('已复制到剪贴板');
    }).catch(err => {
      console.error('复制失败:', err);
    });
  }

  private handleExportJson(character: NWEOSCharacter): void {
    const jsonString = JSON.stringify(character, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.metadata.character_name || 'character'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public async refresh(): Promise<void> {
    await this.loadCharacters();
    this.render();
  }

  public createNewCharacter(): void {
    this.handleCreateNew();
  }
}

class Notice {
  constructor(message: string) {
    const noticeEl = document.createElement('div');
    noticeEl.className = 'nweos-notice';
    noticeEl.textContent = message;
    document.body.appendChild(noticeEl);
    setTimeout(() => noticeEl.remove(), 3000);
  }
}
