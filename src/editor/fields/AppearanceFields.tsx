import { Setting } from 'obsidian';
import { Appearance, AppearanceBasicAppearance, AppearanceSceneStyle } from '../../types/nweos';

export interface AppearanceFieldsProps {
  value: Appearance;
  onChange: (value: Appearance) => void;
}

export function renderAppearanceFields(container: HTMLElement, props: AppearanceFieldsProps): void {
  const { value, onChange } = props;

  const updateBasicAppearance = (basic_appearance: AppearanceBasicAppearance) => {
    onChange({ ...value, basic_appearance });
  };

  const updateSceneStyle = (scene_style: AppearanceSceneStyle) => {
    onChange({ ...value, scene_style });
  };

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '外貌特征';

    new Setting(section)
      .setName('脸型')
      .addText(text => {
        text.setValue(value.basic_appearance.face_shape || '').onChange(val => {
          updateBasicAppearance({ ...value.basic_appearance, face_shape: val });
        });
      });

    new Setting(section)
      .setName('肤色')
      .addText(text => {
        text.setValue(value.basic_appearance.skin || '').onChange(val => {
          updateBasicAppearance({ ...value.basic_appearance, skin: val });
        });
      });

    new Setting(section)
      .setName('眼睛')
      .addText(text => {
        text.setValue(value.basic_appearance.eyes || '').onChange(val => {
          updateBasicAppearance({ ...value.basic_appearance, eyes: val });
        });
      });

    new Setting(section)
      .setName('发型')
      .addText(text => {
        text.setValue(value.basic_appearance.hair || '').onChange(val => {
          updateBasicAppearance({ ...value.basic_appearance, hair: val });
        });
      });

    new Setting(section)
      .setName('身材')
      .addText(text => {
        text.setValue(value.basic_appearance.body_shape || '').onChange(val => {
          updateBasicAppearance({ ...value.basic_appearance, body_shape: val });
        });
      });

    new Setting(section)
      .setName('身高(cm)')
      .addText(text => {
        text.setValue(String(value.basic_appearance.height_cm || '')).onChange(val => {
          const num = val ? parseInt(val) : undefined;
          updateBasicAppearance({ ...value.basic_appearance, height_cm: isNaN(num as number) ? undefined : num });
        });
      });

    new Setting(section)
      .setName('体重(kg)')
      .addText(text => {
        text.setValue(String(value.basic_appearance.weight_kg || '')).onChange(val => {
          const num = val ? parseInt(val) : undefined;
          updateBasicAppearance({ ...value.basic_appearance, weight_kg: isNaN(num as number) ? undefined : num });
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '标志性特征';

    new Setting(section)
      .setName('标志性记忆点')
      .setDesc('让人一眼记住的特征，用逗号分隔')
      .addText(text => {
        text.setValue(value.iconic_features.join(', ')).onChange(val => {
          onChange({ ...value, iconic_features: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.iconic_features.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.iconic_features.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag');
        tagEl.textContent = tag;
      });
    }
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '场景风格';

    new Setting(section)
      .setName('日常')
      .addText(text => {
        text.setValue(value.scene_style.daily || '').onChange(val => {
          updateSceneStyle({ ...value.scene_style, daily: val });
        });
      });

    new Setting(section)
      .setName('正式场合')
      .addText(text => {
        text.setValue(value.scene_style.formal || '').onChange(val => {
          updateSceneStyle({ ...value.scene_style, formal: val });
        });
      });

    new Setting(section)
      .setName('战斗/危机')
      .addText(text => {
        text.setValue(value.scene_style.fight_crisis || '').onChange(val => {
          updateSceneStyle({ ...value.scene_style, fight_crisis: val });
        });
      });

    new Setting(section)
      .setName('情绪失控')
      .addText(text => {
        text.setValue(value.scene_style.emotional_out_of_control || '').onChange(val => {
          updateSceneStyle({ ...value.scene_style, emotional_out_of_control: val });
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '外貌与剧情绑定';

    new Setting(section)
      .setName('外貌剧情关联')
      .setDesc('外貌特征与剧情的关联设定')
      .addTextArea(text => {
        text.setValue(value.appearance_plot_binding || '').onChange(val => {
          onChange({ ...value, appearance_plot_binding: val });
        });
      });
  });
}
