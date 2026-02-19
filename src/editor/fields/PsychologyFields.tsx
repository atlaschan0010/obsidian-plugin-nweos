import { Setting } from 'obsidian';
import { Psychology, PersonalityModel, MoralPrinciple, EmotionalProfile } from '../../types/nweos';

export interface PsychologyFieldsProps {
  value: Psychology;
  onChange: (value: Psychology) => void;
}

const ALIGNMENT_OPTIONS = [
  '守序善良', '中立善良', '混乱善良',
  '守序中立', '完全中立', '混乱中立',
  '守序邪恶', '中立邪恶', '混乱邪恶'
];

export function renderPsychologyFields(container: HTMLElement, props: PsychologyFieldsProps): void {
  const { value, onChange } = props;

  const updateCorePersonality = (core_personality: { public_persona: string; private_persona: string; core_traits: string[]; contrast_design: any[] }) => {
    onChange({ ...value, core_personality });
  };

  const updatePersonalityModel = (personality_model: PersonalityModel) => {
    onChange({ ...value, personality_model });
  };

  const updateMoralPrinciple = (moral_principle: MoralPrinciple) => {
    onChange({ ...value, moral_principle });
  };

  const updateEmotionalProfile = (emotional_profile: EmotionalProfile) => {
    onChange({ ...value, emotional_profile });
  };

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '核心人格';

    new Setting(section)
      .setName('公开人设')
      .setDesc('对外展示的形象')
      .addTextArea(text => {
        text.setValue(value.core_personality.public_persona || '').onChange(val => {
          updateCorePersonality({ ...value.core_personality, public_persona: val });
        });
      });

    new Setting(section)
      .setName('私人真实')
      .setDesc('内心真实的一面')
      .addTextArea(text => {
        text.setValue(value.core_personality.private_persona || '').onChange(val => {
          updateCorePersonality({ ...value.core_personality, private_persona: val });
        });
      });

    new Setting(section)
      .setName('核心特质')
      .setDesc('用逗号分隔，如：腹黑、深情、傲娇')
      .addText(text => {
        text.setValue(value.core_personality.core_traits.join(', ')).onChange(val => {
          updateCorePersonality({ ...value.core_personality, core_traits: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.core_personality.core_traits.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.core_personality.core_traits.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag');
        tagEl.textContent = tag;
      });
    }
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '人格模型';

    new Setting(section)
      .setName('开放性')
      .setDesc('新经验/创造力倾向 (0-100)')
      .addSlider(slider => {
        slider.setValue(value.personality_model.ocean.openness)
          .setLimits(0, 100, 1)
          .onChange(val => {
            updatePersonalityModel({
              ...value.personality_model,
              ocean: { ...value.personality_model.ocean, openness: val }
            });
          });
      });

    new Setting(section)
      .setName('尽责性')
      .setDesc('组织/可靠倾向 (0-100)')
      .addSlider(slider => {
        slider.setValue(value.personality_model.ocean.conscientiousness)
          .setLimits(0, 100, 1)
          .onChange(val => {
            updatePersonalityModel({
              ...value.personality_model,
              ocean: { ...value.personality_model.ocean, conscientiousness: val }
            });
          });
      });

    new Setting(section)
      .setName('外向性')
      .setDesc('社交/活力倾向 (0-100)')
      .addSlider(slider => {
        slider.setValue(value.personality_model.ocean.extraversion)
          .setLimits(0, 100, 1)
          .onChange(val => {
            updatePersonalityModel({
              ...value.personality_model,
              ocean: { ...value.personality_model.ocean, extraversion: val }
            });
          });
      });

    new Setting(section)
      .setName('宜人性')
      .setDesc('合作/信任倾向 (0-100)')
      .addSlider(slider => {
        slider.setValue(value.personality_model.ocean.agreeableness)
          .setLimits(0, 100, 1)
          .onChange(val => {
            updatePersonalityModel({
              ...value.personality_model,
              ocean: { ...value.personality_model.ocean, agreeableness: val }
            });
          });
      });

    new Setting(section)
      .setName('神经质')
      .setDesc('情绪不稳定倾向 (0-100)')
      .addSlider(slider => {
        slider.setValue(value.personality_model.ocean.neuroticism)
          .setLimits(0, 100, 1)
          .onChange(val => {
            updatePersonalityModel({
              ...value.personality_model,
              ocean: { ...value.personality_model.ocean, neuroticism: val }
            });
          });
      });

    new Setting(section)
      .setName('MBTI')
      .addText(text => {
        text.setPlaceholder('如：INTJ, ENFP')
          .setValue(value.personality_model.mbti || '')
          .onChange(val => {
            updatePersonalityModel({ ...value.personality_model, mbti: val });
          });
      });

    new Setting(section)
      .setName('气质类型')
      .addText(text => {
        text.setPlaceholder('如：胆汁质、多血质')
          .setValue(value.personality_model.temperament || '')
          .onChange(val => {
            updatePersonalityModel({ ...value.personality_model, temperament: val });
          });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '道德原则';

    new Setting(section)
      .setName('阵营')
      .addDropdown(dropdown => {
        ALIGNMENT_OPTIONS.forEach(option => {
          dropdown.addOption(option, option);
        });
        dropdown.setValue(value.moral_principle.alignment || '');
        dropdown.onChange(val => {
          updateMoralPrinciple({ ...value.moral_principle, alignment: val });
        });
      });

    new Setting(section)
      .setName('核心价值观')
      .setDesc('用逗号分隔')
      .addText(text => {
        text.setValue(value.moral_principle.core_values.join(', ')).onChange(val => {
          updateMoralPrinciple({ ...value.moral_principle, core_values: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    new Setting(section)
      .setName('底线')
      .setDesc('绝对不能触碰的底线，用逗号分隔')
      .addText(text => {
        text.setValue(value.moral_principle.bottom_line.join(', ')).onChange(val => {
          updateMoralPrinciple({ ...value.moral_principle, bottom_line: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    new Setting(section)
      .setName('冲突处理方式')
      .addTextArea(text => {
        text.setValue(value.moral_principle.conflict_handling || '').onChange(val => {
          updateMoralPrinciple({ ...value.moral_principle, conflict_handling: val });
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '情感画像';

    new Setting(section)
      .setName('基础情绪')
      .setDesc('日常默认的情绪状态')
      .addText(text => {
        text.setValue(value.emotional_profile.base_mood || '').onChange(val => {
          updateEmotionalProfile({ ...value.emotional_profile, base_mood: val });
        });
      });

    new Setting(section)
      .setName('情绪波动程度')
      .setDesc('0-100，数值越高情绪越不稳定')
      .addSlider(slider => {
        slider.setValue(value.emotional_profile.emotional_volatility)
          .setLimits(0, 100, 1)
          .onChange(val => {
            updateEmotionalProfile({ ...value.emotional_profile, emotional_volatility: val });
          });
      });

    new Setting(section)
      .setName('开心触发点')
      .setDesc('用逗号分隔')
      .addText(text => {
        text.setValue(value.emotional_profile.joy_triggers.join(', ')).onChange(val => {
          updateEmotionalProfile({ ...value.emotional_profile, joy_triggers: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    new Setting(section)
      .setName('愤怒触发点')
      .setDesc('用逗号分隔')
      .addText(text => {
        text.setValue(value.emotional_profile.anger_triggers.join(', ')).onChange(val => {
          updateEmotionalProfile({ ...value.emotional_profile, anger_triggers: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    new Setting(section)
      .setName('崩溃触发点')
      .setDesc('用逗号分隔')
      .addText(text => {
        text.setValue(value.emotional_profile.breakdown_triggers.join(', ')).onChange(val => {
          updateEmotionalProfile({ ...value.emotional_profile, breakdown_triggers: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    new Setting(section)
      .setName('软化触发点')
      .setDesc('让人放下防备的触发点，用逗号分隔')
      .addText(text => {
        text.setValue(value.emotional_profile.soft_triggers.join(', ')).onChange(val => {
          updateEmotionalProfile({ ...value.emotional_profile, soft_triggers: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '心理创伤与执念';

    new Setting(section)
      .setName('心理创伤')
      .addTextArea(text => {
        text.setValue(value.psychological_trauma || '').onChange(val => {
          onChange({ ...value, psychological_trauma: val });
        });
      });

    new Setting(section)
      .setName('执念')
      .addTextArea(text => {
        text.setValue(value.obsession || '').onChange(val => {
          onChange({ ...value, obsession: val });
        });
      });

    new Setting(section)
      .setName('人格成长线')
      .setDesc('人格变化/成长的轨迹')
      .addTextArea(text => {
        text.setValue(value.personality_growth_line || '').onChange(val => {
          onChange({ ...value, personality_growth_line: val });
        });
      });
  });

  const redLineSection = container.createDiv('nweos-form-section nweos-red-line-section');
  redLineSection.createDiv('nweos-form-section-title nweos-red-line-title').textContent = '🚫 OOC红线（防OOC核心警告）';

  new Setting(redLineSection)
    .setName('OOC底线')
    .setDesc('绝对不能出现的OOC行为，用逗号分隔')
    .addText(text => {
      text.setValue(value.ooc_red_line.join(', ')).onChange(val => {
        onChange({ ...value, ooc_red_line: val.split(',').map(t => t.trim()).filter(t => t) });
      });
    });

  if (value.ooc_red_line.length > 0) {
    const tagContainer = redLineSection.createDiv('nweos-tags');
    value.ooc_red_line.forEach(tag => {
      const tagEl = tagContainer.createDiv('nweos-tag nweos-red-tag');
      tagEl.textContent = tag;
      tagEl.style.background = 'var(--background-modifier-error)';
      tagEl.style.color = 'var(--text-on-accent)';
    });
  } else {
    const emptyHint = redLineSection.createDiv('nweos-empty-hint');
    emptyHint.textContent = '暂无OOC底线设置';
    emptyHint.style.color = 'var(--text-muted)';
    emptyHint.style.fontSize = '0.85rem';
  }
}
