import { NWEOSCharacter, Metadata } from '../types/nweos';
import { formatDate } from '../utils/helpers';

export interface CharacterListItemOptions {
  character: NWEOSCharacter;
  onClick: (character: NWEOSCharacter) => void;
  onEdit: (character: NWEOSCharacter) => void;
  onDelete: (character: NWEOSCharacter) => void;
  onCopyJson: (character: NWEOSCharacter) => void;
}

export class CharacterListItem {
  private container: HTMLElement;
  private character: NWEOSCharacter;
  private options: CharacterListItemOptions;

  constructor(container: HTMLElement, options: CharacterListItemOptions) {
    this.container = container;
    this.character = options.character;
    this.options = options;
    this.render();
  }

  private getMetadata(): Metadata {
    return this.character.metadata;
  }

  private getInitials(name: string): string {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  private render(): void {
    const metadata = this.getMetadata();
    const trackTags = this.character.core_position?.track_adapt_tags || [];

    const itemEl = this.container.createDiv('nweos-character-item');
    itemEl.setAttribute('data-character-id', metadata.character_id);

    const avatarEl = itemEl.createDiv('nweos-character-avatar');
    avatarEl.textContent = this.getInitials(metadata.character_name);

    const infoEl = itemEl.createDiv('nweos-character-info');

    const headerEl = infoEl.createDiv('nweos-character-header');
    headerEl.createDiv('nweos-character-name').textContent = metadata.character_name;
    headerEl.createDiv('nweos-character-position').textContent = metadata.character_position || '未设置定位';

    const tagsEl = infoEl.createDiv('nweos-character-tags');
    trackTags.slice(0, 3).forEach(tag => {
      const tagEl = tagsEl.createSpan('nweos-track-tag');
      tagEl.textContent = tag;
    });

    const metaEl = infoEl.createDiv('nwe-character-meta');
    const updateEl = metaEl.createSpan('nweos-update-time');
    updateEl.textContent = `更新于 ${formatDate(metadata.last_updated)}`;

    itemEl.addEventListener('click', () => {
      this.options.onClick(this.character);
    });

    itemEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e as MouseEvent);
    });
  }

  private showContextMenu(e: MouseEvent): void {
    const existingMenu = document.querySelector('.nweos-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    const menuEl = document.createElement('div');
    menuEl.className = 'nweos-context-menu';

    const editItem = menuEl.createDiv('nweos-context-menu-item');
    editItem.textContent = '编辑';
    editItem.addEventListener('click', () => {
      this.options.onEdit(this.character);
      menuEl.remove();
    });

    const deleteItem = menuEl.createDiv('nweos-context-menu-item');
    deleteItem.textContent = '删除';
    deleteItem.addEventListener('click', () => {
      this.options.onDelete(this.character);
      menuEl.remove();
    });

    const copyItem = menuEl.createDiv('nweos-context-menu-item');
    copyItem.textContent = '复制JSON';
    copyItem.addEventListener('click', () => {
      this.options.onCopyJson(this.character);
      menuEl.remove();
    });

    menuEl.style.left = `${e.clientX}px`;
    menuEl.style.top = `${e.clientY}px`;
    document.body.appendChild(menuEl);

    const closeMenu = (evt: MouseEvent) => {
      if (!menuEl.contains(evt.target as Node)) {
        menuEl.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }
}
