import { Setting } from 'obsidian';
import { PlotBinding } from '../../types/nweos';

export interface PlotBindingFieldsProps {
  value: PlotBinding;
  onChange: (value: PlotBinding) => void;
}

export function renderPlotBindingFields(container: HTMLElement, props: PlotBindingFieldsProps): void {
  const { value, onChange } = props;

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '出场与高光';

    new Setting(section)
      .setName('出场章节节点')
      .setDesc('首次出场或在重要剧情中出现的章节')
      .addText(text => {
        text.setValue(value.debut_chapter_node || '').onChange(val => {
          onChange({ ...value, debut_chapter_node: val });
        });
      });

    new Setting(section)
      .setName('核心高光节点')
      .setDesc('人物最出彩的章节/场景，用逗号分隔')
      .addText(text => {
        text.setValue(value.core_highlight_nodes.join(', ')).onChange(val => {
          onChange({ ...value, core_highlight_nodes: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.core_highlight_nodes.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.core_highlight_nodes.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag nweos-highlight-tag');
        tagEl.textContent = tag;
        tagEl.style.background = 'var(--interactive-accent)';
        tagEl.style.color = 'var(--text-on-accent)';
      });
    }
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '人格转变与伏笔';

    new Setting(section)
      .setName('人格转变节点')
      .setDesc('人物性格发生重大变化的节点，用逗号分隔')
      .addText(text => {
        text.setValue(value.personality_transformation_nodes.join(', ')).onChange(val => {
          onChange({ ...value, personality_transformation_nodes: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.personality_transformation_nodes.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.personality_transformation_nodes.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag nweos-transformation-tag');
        tagEl.textContent = tag;
        tagEl.style.border = '1px solid var(--text-success)';
      });
    }

    new Setting(section)
      .setName('伏笔回收节点')
      .setDesc('之前埋下的伏笔被回收/揭示的节点，用逗号分隔')
      .addText(text => {
        text.setValue(value.foreshadowing_recycle_nodes.join(', ')).onChange(val => {
          onChange({ ...value, foreshadowing_recycle_nodes: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.foreshadowing_recycle_nodes.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.foreshadowing_recycle_nodes.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag nweos-foreshadowing-tag');
        tagEl.textContent = tag;
      });
    }
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '剧情绑定';

    new Setting(section)
      .setName('主线绑定')
      .setDesc('人物与主线的关联和绑定')
      .addTextArea(text => {
        text.setValue(value.main_line_binding || '').onChange(val => {
          onChange({ ...value, main_line_binding: val });
        });
      });

    new Setting(section)
      .setName('结局设定')
      .setDesc('人物在故事结局中的设定')
      .addTextArea(text => {
        text.setValue(value.ending_setting || '').onChange(val => {
          onChange({ ...value, ending_setting: val });
        });
      });

    new Setting(section)
      .setName('额外内容')
      .setDesc('其他补充的剧情相关设定')
      .addTextArea(text => {
        text.setValue(value.extra_content || '').onChange(val => {
          onChange({ ...value, extra_content: val });
        });
      });
  });
}
