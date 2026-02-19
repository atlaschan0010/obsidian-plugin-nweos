export interface TabItem {
  id: string;
  label: string;
  icon: string;
}

export const TAB_CONFIG: TabItem[] = [
  { id: 'metadata', label: '核心元数据', icon: '📋' },
  { id: 'core-position', label: '人物核心定位', icon: '🎯' },
  { id: 'identity', label: '基础身份', icon: '👤' },
  { id: 'appearance', label: '外在形象', icon: '🎨' },
  { id: 'abilities', label: '能力体系', icon: '⚡' },
  { id: 'psychology', label: '灵魂人设', icon: '🧠' },
  { id: 'behavior', label: '语言行为', icon: '💬' },
  { id: 'background', label: '过往经历', icon: '📜' },
  { id: 'preferences', label: '喜恶偏好', icon: '❤️' },
  { id: 'motivation', label: '动机弧光', icon: '🔥' },
  { id: 'plot-binding', label: '剧情绑定', icon: '📖' },
  { id: 'relationships', label: '关系网络', icon: '🔗' },
  { id: 'track-extension', label: '赛道扩展', icon: '🏁' },
];

export class TabContainer {
  private container: HTMLElement;
  private tabsEl: HTMLElement;
  private contentContainer: HTMLElement;
  private activeTabId: string = TAB_CONFIG[0].id;
  private onTabChange: (tabId: string) => void;

  constructor(
    container: HTMLElement,
    onTabChange: (tabId: string) => void
  ) {
    this.container = container;
    this.onTabChange = onTabChange;
    this.tabsEl = container.createDiv('nweos-tabs');
    this.contentContainer = container.createDiv('nweos-tab-content');
    this.render();
  }

  private render(): void {
    TAB_CONFIG.forEach(tab => {
      const tabEl = this.tabsEl.createDiv('nweos-tab-item');
      tabEl.setAttribute('data-tab-id', tab.id);

      const iconEl = tabEl.createSpan('nweos-tab-icon');
      iconEl.textContent = tab.icon;

      const labelEl = tabEl.createSpan('nweos-tab-label');
      labelEl.textContent = tab.label;

      if (tab.id === this.activeTabId) {
        tabEl.addClass('active');
      }

      tabEl.addEventListener('click', () => {
        this.setActiveTab(tab.id);
      });
    });
  }

  public setActiveTab(tabId: string): void {
    const prevActive = this.tabsEl.querySelector('.active');
    if (prevActive) {
      prevActive.removeClass('active');
    }

    const newActive = this.tabsEl.querySelector(`[data-tab-id="${tabId}"]`);
    if (newActive) {
      newActive.addClass('active');
    }

    this.activeTabId = tabId;
    this.onTabChange(tabId);
  }

  public getActiveTabId(): string {
    return this.activeTabId;
  }

  public getContentContainer(): HTMLElement {
    return this.contentContainer;
  }

  public clearContent(): void {
    this.contentContainer.empty();
  }
}
