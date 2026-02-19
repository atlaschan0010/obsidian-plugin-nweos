import { Setting } from 'obsidian';
import { BehaviorPattern, SpeechStyle, ActionHabits } from '../../types/nweos';

export interface BehaviorFieldsProps {
  value: BehaviorPattern;
  onChange: (value: BehaviorPattern) => void;
}

export function renderBehaviorFields(container: HTMLElement, props: BehaviorFieldsProps): void {
  const { value, onChange } = props;

  const updateSpeechStyle = (speech_style: SpeechStyle) => {
    onChange({ ...value, speech_style });
  };

  const updateActionHabits = (action_habits: ActionHabits) => {
    onChange({ ...value, action_habits });
  };

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '语言风格';

    new Setting(section)
      .setName('正式程度')
      .setDesc('0-5，0为随意口语，5为极其正式')
      .addSlider(slider => {
        slider.setValue(value.speech_style.formality_level)
          .setLimits(0, 5, 1)
          .onChange(val => {
            updateSpeechStyle({ ...value.speech_style, formality_level: val });
          });
      });

    new Setting(section)
      .setName('话唠程度')
      .setDesc('0-5，0为沉默寡言，5为絮絮叨叨')
      .addSlider(slider => {
        slider.setValue(value.speech_style.verbosity_level)
          .setLimits(0, 5, 1)
          .onChange(val => {
            updateSpeechStyle({ ...value.speech_style, verbosity_level: val });
          });
      });

    new Setting(section)
      .setName('用词习惯')
      .setDesc('特有的用词习惯或语言风格')
      .addText(text => {
        text.setValue(value.speech_style.vocabulary_habit || '').onChange(val => {
          updateSpeechStyle({ ...value.speech_style, vocabulary_habit: val });
        });
      });

    new Setting(section)
      .setName('语气')
      .setDesc('整体说话语气特点')
      .addText(text => {
        text.setValue(value.speech_style.tone || '').onChange(val => {
          updateSpeechStyle({ ...value.speech_style, tone: val });
        });
      });

    new Setting(section)
      .setName('口头禅')
      .setDesc('标志性口头禅，用逗号分隔')
      .addText(text => {
        text.setValue(value.speech_style.catchphrases.join(', ')).onChange(val => {
          updateSpeechStyle({ ...value.speech_style, catchphrases: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.speech_style.catchphrases.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.speech_style.catchphrases.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag nweos-catchphrase-tag');
        tagEl.textContent = `"${tag}"`;
      });
    }

    new Setting(section)
      .setName('禁语')
      .setDesc('绝对不会说的话，用逗号分隔')
      .addText(text => {
        text.setValue(value.speech_style.forbidden_words.join(', ')).onChange(val => {
          updateSpeechStyle({ ...value.speech_style, forbidden_words: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.speech_style.forbidden_words.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.speech_style.forbidden_words.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag nweos-forbidden-tag');
        tagEl.textContent = `🚫 ${tag}`;
        tagEl.style.background = 'var(--background-modifier-error)';
        tagEl.style.color = 'var(--text-on-accent)';
      });
    }

    new Setting(section)
      .setName('场景语音变化')
      .setDesc('不同场景下的语音变化，JSON格式')
      .addTextArea(text => {
        text.setValue(JSON.stringify(value.speech_style.scene_speech_change || {}, null, 2)).onChange(val => {
          try {
            updateSpeechStyle({ ...value.speech_style, scene_speech_change: JSON.parse(val) });
          } catch (e) {}
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '行为习惯';

    new Setting(section)
      .setName('标志性小动作')
      .setDesc('特有的习惯性动作，用逗号分隔')
      .addText(text => {
        text.setValue(value.action_habits.iconic_tics.join(', ')).onChange(val => {
          updateActionHabits({ ...value.action_habits, iconic_tics: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.action_habits.iconic_tics.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.action_habits.iconic_tics.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag');
        tagEl.textContent = tag;
      });
    }

    new Setting(section)
      .setName('危机第一反应')
      .setDesc('遇到危险/危机时的第一反应')
      .addText(text => {
        text.setValue(value.action_habits.crisis_first_reaction || '').onChange(val => {
          updateActionHabits({ ...value.action_habits, crisis_first_reaction: val });
        });
      });

    new Setting(section)
      .setName('决策风格')
      .setDesc('如何做决定：冲动/谨慎/犹豫/果断等')
      .addText(text => {
        text.setValue(value.action_habits.decision_making_style || '').onChange(val => {
          updateActionHabits({ ...value.action_habits, decision_making_style: val });
        });
      });

    new Setting(section)
      .setName('互动习惯')
      .setDesc('与他人互动时的习惯性行为')
      .addTextArea(text => {
        text.setValue(value.action_habits.interaction_habit || '').onChange(val => {
          updateActionHabits({ ...value.action_habits, interaction_habit: val });
        });
      });
  });
}
