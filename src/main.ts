import { App, Plugin, PluginSettingTab, Setting, View, WorkspaceLeaf, Notice, TFile, normalizePath } from 'obsidian';
import { CharacterStore } from './storage/CharacterStore';
import { EditorModal } from './ui/EditorModal';
import { SidebarView, NWEOS_SIDEBAR_VIEW_TYPE } from './ui/SidebarView';
import { NWEOSCharacter } from './types/nweos';
import { generateId, getCurrentTimestamp } from './utils/helpers';
import { checkRedLines, getRedLineWarnings } from './redline';

export interface NWEOSSettings {
	workName: string;
	novelTrack: string;
	author: string;
	charactersPath: string;
	autoCheckRedLine: boolean;
}

const DEFAULT_SETTINGS: NWEOSSettings = {
	workName: '',
	novelTrack: '',
	author: '',
	charactersPath: 'characters',
	autoCheckRedLine: true,
};

export default class NWEOSPlugin extends Plugin {
	settings!: NWEOSSettings;
	private characterStore!: CharacterStore;
	private currentSidebarView: SidebarView | null = null;

	async onload() {
		console.log('NWEOS网文角色卡插件已加载');

		await this.loadSettings();

		this.app.workspace.onLayoutReady(() => {
			this.loadStyles();
		});

		this.characterStore = new CharacterStore(this.app, this.settings.charactersPath);

		this.registerView(
			NWEOS_SIDEBAR_VIEW_TYPE,
			(leaf) => {
				const view = new SidebarView(leaf, this.app, this.characterStore, this);
				this.currentSidebarView = view;
				return view;
			}
		);

		this.addCommand({
			id: 'open-nweos-sidebar',
			name: '打开角色卡面板',
			callback: () => {
				this.openSidebar();
			}
		});

		this.addCommand({
			id: 'create-nweos-character',
			name: '创建新角色卡',
			callback: () => {
				this.createNewCharacter();
			}
		});

		this.addCommand({
			id: 'import-nweos-character',
			name: '导入角色JSON',
			callback: () => {
				this.importCharacter();
			}
		});

		this.addCommand({
			id: 'check-nweos-redline',
			name: '检查角色红线',
			callback: () => {
				this.checkCharacterRedLine();
			}
		});

		this.addSettingTab(new NWEOSSettingTab(this.app, this));

		this.openSidebar();
	}

	onunload() {
		console.log('NWEOS网文角色卡插件已卸载');
		this.app.workspace.getLeavesOfType(NWEOS_SIDEBAR_VIEW_TYPE).forEach(leaf => leaf.detach());
	}

	async loadStyles() {
		const stylesPath = normalizePath(`${this.manifest.dir}/styles.css`);
		try {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = stylesPath;
			document.head.appendChild(link);
		} catch (e) {
			console.warn('加载样式文件失败:', e);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getSettings(): NWEOSSettings {
		return this.settings;
	}

	async openSidebar() {
		const leaves = this.app.workspace.getLeavesOfType(NWEOS_SIDEBAR_VIEW_TYPE);
		if (leaves.length > 0) {
			this.app.workspace.revealLeaf(leaves[0]);
			return;
		}

		const leaf = this.app.workspace.getLeaf(true);
		if (leaf) {
			await leaf.setViewState({
				type: NWEOS_SIDEBAR_VIEW_TYPE,
				active: true
			});
		}
	}

	async createNewCharacter() {
		await this.openSidebar();

		setTimeout(() => {
			if (this.currentSidebarView) {
				this.currentSidebarView.createNewCharacter();
			}
		}, 100);
	}

	async importCharacter() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile || activeFile.extension !== 'json') {
			new Notice('请先打开一个JSON文件');
			return;
		}

		try {
			const content = await this.app.vault.read(activeFile);
			const character = JSON.parse(content) as NWEOSCharacter;

			if (!character.standard || character.standard.schema !== 'nweos') {
				new Notice('无效的NWEOS角色卡格式');
				return;
			}

			character.metadata.character_id = generateId();
			character.metadata.created_at = getCurrentTimestamp();
			character.metadata.last_updated = getCurrentTimestamp();

			await this.characterStore.saveCharacter(character);
			new Notice(`角色 "${character.metadata.character_name}" 导入成功`);

			if (this.currentSidebarView) {
				this.currentSidebarView.refresh();
			}
		} catch (error) {
			console.error('导入角色失败:', error);
			new Notice('导入角色失败，请检查JSON格式');
		}
	}

	async checkCharacterRedLine() {
		const characters = await this.characterStore.loadCharacters();

		if (characters.length === 0) {
			new Notice('暂无角色卡');
			return;
		}

		let allWarnings: string[] = [];

		for (const character of characters) {
			const warnings = getRedLineWarnings(character);
			if (warnings.length > 0) {
				allWarnings.push(`【${character.metadata.character_name}】\n${warnings.join('\n')}`);
			}
		}

		if (allWarnings.length === 0) {
			new Notice('所有角色卡都已填写完整！');
		} else {
			const message = allWarnings.slice(0, 3).join('\n\n');
			new Notice(`发现 ${allWarnings.length} 个角色卡存在红线问题`);
			console.log('红线检查结果:\n', message);
		}
	}

	getCharacterStore(): CharacterStore {
		return this.characterStore;
	}
}

class NWEOSSettingTab extends PluginSettingTab {
	plugin: NWEOSPlugin;

	constructor(app: App, plugin: NWEOSPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'NWEOS网文角色卡设置' });

		containerEl.createEl('h3', { text: '作品信息（新建角色时自动填入）' });

		new Setting(containerEl)
			.setName('作品名称')
			.setDesc('当前 Vault 对应的小说名称，新建角色时自动填入')
			.addText(text => text
				.setPlaceholder('例如：斗破苍穹')
				.setValue(this.plugin.settings.workName)
				.onChange(async (value) => {
					this.plugin.settings.workName = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('赛道分类')
			.setDesc('小说所属赛道，新建角色时自动填入')
			.addText(text => text
				.setPlaceholder('例如：都市娱乐、玄幻')
				.setValue(this.plugin.settings.novelTrack)
				.onChange(async (value) => {
					this.plugin.settings.novelTrack = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('作者')
			.setDesc('作者名字，新建角色时自动填入')
			.addText(text => text
				.setPlaceholder('例如：天蚕土豆')
				.setValue(this.plugin.settings.author)
				.onChange(async (value) => {
					this.plugin.settings.author = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: '存储设置' });

		new Setting(containerEl)
			.setName('角色存储路径')
			.setDesc('角色卡文件存储的文件夹路径')
			.addText(text => text
				.setPlaceholder('characters')
				.setValue(this.plugin.settings.charactersPath)
				.onChange(async (value) => {
					this.plugin.settings.charactersPath = value || 'characters';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('自动检查红线')
			.setDesc('保存角色时自动检查必填项是否填写')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoCheckRedLine)
				.onChange(async (value) => {
					this.plugin.settings.autoCheckRedLine = value;
					await this.plugin.saveSettings();
				}));
	}
}

