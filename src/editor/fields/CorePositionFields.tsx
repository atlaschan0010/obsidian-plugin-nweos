import { Setting } from 'obsidian';
import { CorePosition } from '../../types/nweos';

export interface CorePositionFieldsProps {
  value: CorePosition;
  onChange: (value: CorePosition) => void;
}

const CORE_TAG_HINTS = ['深情绿茶', '病娇忠犬', '高岭之花', '阳光开朗', '腹黑闷骚', '清冷疏离', '热血赤子'];
const TRACK_ADAPT_TAG_HINTS = ['甜宠', '虐恋', '双向救赎', '追妻火葬场', '强强联合', '相爱相杀'];
const SHINE_POINT_HINTS = ['英雄救美', '高甜互动', '护短', '打脸反转', '深情告白'];
const ANGST_POINT_HINTS = ['失忆', '误会', '身份对立', '生离死别', '黑化', '孤独终老'];
const MEMORY_POINT_HINTS = ['标志性动作', '经典台词', '名场面', '记忆点细节'];

export function renderCorePositionFields(container: HTMLElement, props: CorePositionFieldsProps): void {
  const { value, onChange } = props;

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '人物核心定位（防OOC第一防线）';

    new Setting(section)
      .setName('核心标签')
      .setDesc(`输入3-5个核心标签，如：${CORE_TAG_HINTS.slice(0, 3).join('、')}`)
      .addText(text => {
        text.setValue(value.core_tags.join(', ')).onChange(val => {
          onChange({ ...value, core_tags: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    new Setting(section)
      .setName('赛道适配标签')
      .setDesc(`如：${TRACK_ADAPT_TAG_HINTS.slice(0, 3).join('、')}`)
      .addText(text => {
        text.setValue(value.track_adapt_tags.join(', ')).onChange(val => {
          onChange({ ...value, track_adapt_tags: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    new Setting(section)
      .setName('核心爽点')
      .setDesc(`如：${SHINE_POINT_HINTS.slice(0, 3).join('、')}`)
      .addText(text => {
        text.setValue(value.core_shine_points.join(', ')).onChange(val => {
          onChange({ ...value, core_shine_points: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    new Setting(section)
      .setName('核心虐点')
      .setDesc(`如：${ANGST_POINT_HINTS.slice(0, 3).join('、')}`)
      .addText(text => {
        text.setValue(value.core_angst_points.join(', ')).onChange(val => {
          onChange({ ...value, core_angst_points: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    new Setting(section)
      .setName('读者记忆点')
      .setDesc(`标志性记忆点，如：${MEMORY_POINT_HINTS.slice(0, 2).join('、')}`)
      .addText(text => {
        text.setValue(value.reader_memory_points.join(', ')).onChange(val => {
          onChange({ ...value, reader_memory_points: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    new Setting(section)
      .setName('角色红线 ⚠️')
      .setDesc('绝对不能触碰的底线，OOC警告区域')
      .addText(text => {
        text.setValue(value.character_red_line.join(', ')).onChange(val => {
          onChange({ ...value, character_red_line: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });
  });

  const redLineSection = container.createDiv('nweos-form-section nweos-red-line-section');
  redLineSection.createDiv('nweos-form-section-title nweos-red-line-title').textContent = '🚫 角色红线（红色高亮警告）';

  if (value.character_red_line.length > 0) {
    const tagContainer = redLineSection.createDiv('nweos-tags');
    value.character_red_line.forEach((tag, index) => {
      const tagEl = tagContainer.createDiv('nweos-tag nweos-red-tag');
      tagEl.textContent = tag;
      tagEl.style.background = 'var(--background-modifier-error)';
      tagEl.style.color = 'var(--text-on-accent)';
    });
  } else {
    redLineSection.createDiv('nweos-empty-hint').textContent = '暂无红线设置';
    redLineSection.style.color = 'var(--text-muted)';
    redLineSection.style.fontSize = '0.85rem';
  }
}
