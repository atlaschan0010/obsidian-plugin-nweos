import { Setting } from 'obsidian';
import { PreferencesLifestyle, Favorites } from '../../types/nweos';

export interface PreferencesFieldsProps {
  value: PreferencesLifestyle;
  onChange: (value: PreferencesLifestyle) => void;
}

export function renderPreferencesFields(container: HTMLElement, props: PreferencesFieldsProps): void {
  const { value, onChange } = props;

  const updateFavorites = (favorites: Favorites) => {
    onChange({ ...value, favorites });
  };

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '兴趣爱好';

    new Setting(section)
      .setName('兴趣爱好')
      .setDesc('用逗号分隔')
      .addText(text => {
        text.setValue(value.hobbies.join(', ')).onChange(val => {
          onChange({ ...value, hobbies: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.hobbies.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.hobbies.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag');
        tagEl.textContent = tag;
      });
    }
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '偏好喜好';

    new Setting(section)
      .setName('喜欢的食物')
      .addText(text => {
        text.setValue(value.favorites.food || '').onChange(val => {
          updateFavorites({ ...value.favorites, food: val });
        });
      });

    new Setting(section)
      .setName('喜欢的颜色')
      .addText(text => {
        text.setValue(value.favorites.color || '').onChange(val => {
          updateFavorites({ ...value.favorites, color: val });
        });
      });

    new Setting(section)
      .setName('喜欢的事物')
      .addText(text => {
        text.setValue(value.favorites.thing || '').onChange(val => {
          updateFavorites({ ...value.favorites, thing: val });
        });
      });

    new Setting(section)
      .setName('喜欢的季节')
      .addText(text => {
        text.setValue(value.favorites.season || '').onChange(val => {
          updateFavorites({ ...value.favorites, season: val });
        });
      });

    new Setting(section)
      .setName('喜欢的场景')
      .addText(text => {
        text.setValue(value.favorites.scene || '').onChange(val => {
          updateFavorites({ ...value.favorites, scene: val });
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '厌恶';

    new Setting(section)
      .setName('厌恶')
      .setDesc('不喜欢的事物，用逗号分隔')
      .addText(text => {
        text.setValue(value.aversions.join(', ')).onChange(val => {
          onChange({ ...value, aversions: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    if (value.aversions.length > 0) {
      const tagContainer = section.createDiv('nweos-tags');
      value.aversions.forEach(tag => {
        const tagEl = tagContainer.createDiv('nweos-tag nweos-aversion-tag');
        tagEl.textContent = `🚫 ${tag}`;
      });
    }
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '偏好与剧情';

    new Setting(section)
      .setName('偏好剧情关联')
      .setDesc('喜恶偏好与剧情的关联设定')
      .addTextArea(text => {
        text.setValue(value.preference_plot_binding || '').onChange(val => {
          onChange({ ...value, preference_plot_binding: val });
        });
      });

    new Setting(section)
      .setName('生活方式习惯')
      .setDesc('日常生活习惯的细节描写')
      .addTextArea(text => {
        text.setValue(value.lifestyle_habit || '').onChange(val => {
          onChange({ ...value, lifestyle_habit: val });
        });
      });
  });
}
