import { Setting } from 'obsidian';
import { MotivationArc, Goals, CharacterArcPath } from '../../types/nweos';

export interface MotivationFieldsProps {
  value: MotivationArc;
  onChange: (value: MotivationArc) => void;
}

export function renderMotivationFields(container: HTMLElement, props: MotivationFieldsProps): void {
  const { value, onChange } = props;

  const updateGoals = (goals: Goals) => {
    onChange({ ...value, goals });
  };

  const updateCoreFears = (core_fears: { rational: string[]; irrational: string[] }) => {
    onChange({ ...value, core_fears });
  };

  const updateCharacterArcPath = (character_arc_path: CharacterArcPath) => {
    onChange({ ...value, character_arc_path });
  };

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '核心驱动力';

    new Setting(section)
      .setName('核心驱动力')
      .setDesc('人物行动的根本原因和内心渴望')
      .addTextArea(text => {
        text.setValue(value.core_drive || '').onChange(val => {
          onChange({ ...value, core_drive: val });
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '目标规划';

    new Setting(section)
      .setName('短期目标')
      .setDesc('近期想要达成的目标，用逗号分隔')
      .addText(text => {
        text.setValue(value.goals.short_term.join(', ')).onChange(val => {
          updateGoals({ ...value.goals, short_term: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.goals.short_term.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.goals.short_term.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag nweos-short-term-tag');
        tagEl.textContent = tag;
        tagEl.style.border = '1px solid var(--interactive-accent)';
      });
    }

    new Setting(section)
      .setName('中期目标')
      .setDesc('中期规划目标，用逗号分隔')
      .addText(text => {
        text.setValue(value.goals.medium_term.join(', ')).onChange(val => {
          updateGoals({ ...value.goals, medium_term: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.goals.medium_term.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.goals.medium_term.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag nweos-medium-term-tag');
        tagEl.textContent = tag;
      });
    }

    new Setting(section)
      .setName('长期/终极目标')
      .setDesc('人物的终极追求和梦想')
      .addTextArea(text => {
        text.setValue(value.goals.long_term_ultimate || '').onChange(val => {
          updateGoals({ ...value.goals, long_term_ultimate: val });
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '核心恐惧';

    new Setting(section)
      .setName('理性恐惧')
      .setDesc('基于现实逻辑的恐惧，用逗号分隔')
      .addText(text => {
        text.setValue(value.core_fears.rational.join(', ')).onChange(val => {
          updateCoreFears({ ...value.core_fears, rational: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.core_fears.rational.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.core_fears.rational.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag nweos-fear-tag');
        tagEl.textContent = tag;
      });
    }

    new Setting(section)
      .setName('非理性恐惧')
      .setDesc('内心深处的深层恐惧，用逗号分隔')
      .addText(text => {
        text.setValue(value.core_fears.irrational.join(', ')).onChange(val => {
          updateCoreFears({ ...value.core_fears, irrational: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.core_fears.irrational.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.core_fears.irrational.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag nweos-fear-tag');
        tagEl.textContent = tag;
        tagEl.style.background = 'var(--background-modifier-error)';
        tagEl.style.color = 'var(--text-on-accent)';
      });
    }
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '角色弧光路线';

    new Setting(section)
      .setName('初始状态')
      .setDesc('故事开始时人物的状态')
      .addTextArea(text => {
        text.setValue(value.character_arc_path.opening_state || '').onChange(val => {
          updateCharacterArcPath({ ...value.character_arc_path, opening_state: val });
        });
      });

    new Setting(section)
      .setName('成长节点')
      .setDesc('人物成长的关键节点，用逗号分隔')
      .addText(text => {
        text.setValue(value.character_arc_path.growth_nodes.join(', ')).onChange(val => {
          updateCharacterArcPath({ ...value.character_arc_path, growth_nodes: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.character_arc_path.growth_nodes.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.character_arc_path.growth_nodes.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag nweos-growth-tag');
        tagEl.textContent = tag;
        tagEl.style.border = '1px solid var(--text-success)';
      });
    }

    new Setting(section)
      .setName('高光时刻')
      .setDesc('人物的巅峰/高光时刻')
      .addTextArea(text => {
        text.setValue(value.character_arc_path.highlight_moment || '').onChange(val => {
          updateCharacterArcPath({ ...value.character_arc_path, highlight_moment: val });
        });
      });

    new Setting(section)
      .setName('最终状态')
      .setDesc('故事结局时人物的状态')
      .addTextArea(text => {
        text.setValue(value.character_arc_path.final_state || '').onChange(val => {
          updateCharacterArcPath({ ...value.character_arc_path, final_state: val });
        });
      });

    new Setting(section)
      .setName('角色转变')
      .setDesc('人物从初始到最终的转变过程')
      .addTextArea(text => {
        text.setValue(value.character_arc_path.character_transformation || '').onChange(val => {
          updateCharacterArcPath({ ...value.character_arc_path, character_transformation: val });
        });
      });
  });
}
