import { Setting } from 'obsidian';
import { Identity, IdentityNames, IdentityBasicInfo, IdentitySystem } from '../../types/nweos';

export interface IdentityFieldsProps {
  value: Identity;
  onChange: (value: Identity) => void;
}

export function renderIdentityFields(container: HTMLElement, props: IdentityFieldsProps): void {
  const { value, onChange } = props;

  const updateNames = (names: IdentityNames) => {
    onChange({ ...value, names });
  };

  const updateBasicInfo = (basic_info: IdentityBasicInfo) => {
    onChange({ ...value, basic_info });
  };

  const updateIdentitySystem = (identity_system: IdentitySystem) => {
    onChange({ ...value, identity_system });
  };

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '姓名信息';

    new Setting(section)
      .setName('姓名')
      .addText(text => {
        text.setValue(value.names.full_name || '').onChange(val => {
          updateNames({ ...value.names, full_name: val });
        });
      });

    new Setting(section)
      .setName('字/号')
      .addText(text => {
        text.setValue(value.names.courtesy_name || '').onChange(val => {
          updateNames({ ...value.names, courtesy_name: val });
        });
      });

    new Setting(section)
      .setName('昵称')
      .setDesc('多个昵称用逗号分隔')
      .addText(text => {
        text.setValue(value.names.nickname.join(', ')).onChange(val => {
          updateNames({ ...value.names, nickname: val.split(',').map(t => t.trim()).filter(t => t) });
        });
      });

    new Setting(section)
      .setName('代号')
      .addText(text => {
        text.setValue(value.names.code_name || '').onChange(val => {
          updateNames({ ...value.names, code_name: val });
        });
      });

    new Setting(section)
      .setName('称号')
      .addText(text => {
        text.setValue(value.names.title || '').onChange(val => {
          updateNames({ ...value.names, title: val });
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '基本信息';

    new Setting(section)
      .setName('年龄')
      .addText(text => {
        text.setPlaceholder('数字')
          .setValue(String(value.basic_info.age || ''))
          .onChange(val => {
            const num = val ? parseInt(val) : undefined;
            updateBasicInfo({ ...value.basic_info, age: isNaN(num as number) ? undefined : num });
          });
      });

    new Setting(section)
      .setName('外貌年龄')
      .addText(text => {
        text.setPlaceholder('看起来的年龄')
          .setValue(String(value.basic_info.age_perceived || ''))
          .onChange(val => {
            const num = val ? parseInt(val) : undefined;
            updateBasicInfo({ ...value.basic_info, age_perceived: isNaN(num as number) ? undefined : num });
          });
      });

    new Setting(section)
      .setName('性别')
      .addText(text => {
        text.setPlaceholder('男/女/其他')
          .setValue(value.basic_info.gender || '')
          .onChange(val => {
            updateBasicInfo({ ...value.basic_info, gender: val });
          });
      });

    new Setting(section)
      .setName('生日')
      .addText(text => {
        text.setPlaceholder('YYYY-MM-DD')
          .setValue(value.basic_info.birthday || '')
          .onChange(val => {
            updateBasicInfo({ ...value.basic_info, birthday: val });
          });
      });

    new Setting(section)
      .setName('出生地')
      .addText(text => {
        text.setValue(value.basic_info.birthplace || '').onChange(val => {
          updateBasicInfo({ ...value.basic_info, birthplace: val });
        });
      });

    new Setting(section)
      .setName('当前居住地')
      .addText(text => {
        text.setValue(value.basic_info.current_residence || '').onChange(val => {
          updateBasicInfo({ ...value.basic_info, current_residence: val });
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '身份体系';

    new Setting(section)
      .setName('公开身份')
      .addText(text => {
        text.setValue(value.identity_system.public_identity || '').onChange(val => {
          updateIdentitySystem({ ...value.identity_system, public_identity: val });
        });
      });

    new Setting(section)
      .setName('隐藏身份')
      .setDesc('不为人知的隐藏身份')
      .addText(text => {
        text.setValue(value.identity_system.hidden_identity || '').onChange(val => {
          updateIdentitySystem({ ...value.identity_system, hidden_identity: val });
        });
      });

    new Setting(section)
      .setName('阵营')
      .addText(text => {
        text.setPlaceholder('正派/中立/反派等')
          .setValue(value.identity_system.camp || '')
          .onChange(val => {
            updateIdentitySystem({ ...value.identity_system, camp: val });
          });
      });

    new Setting(section)
      .setName('家族/门派')
      .addText(text => {
        text.setValue(value.identity_system.family_clan || '').onChange(val => {
          updateIdentitySystem({ ...value.identity_system, family_clan: val });
        });
      });

    new Setting(section)
      .setName('地位等级')
      .addText(text => {
        text.setValue(value.identity_system.status_rank || '').onChange(val => {
          updateIdentitySystem({ ...value.identity_system, status_rank: val });
        });
      });
  });
}
