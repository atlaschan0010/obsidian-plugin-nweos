import { Setting } from 'obsidian';
import { TrackExtension, XuanhuanXianxia, GuyanGongdou, XianyanDushi, KehuanMoshi, XuanyiXingzhen } from '../../types/nweos';

export interface TrackExtensionFieldsProps {
  value: TrackExtension;
  onChange: (value: TrackExtension) => void;
}

export function renderTrackExtensionFields(container: HTMLElement, props: TrackExtensionFieldsProps): void {
  const { value, onChange } = props;

  const updateXuanhuanXianxia = (data: XuanhuanXianxia) => {
    onChange({ ...value, xuanhuan_xianxia: data });
  };

  const updateGuyanGongdou = (data: GuyanGongdou) => {
    onChange({ ...value, guyan_gongdou: data });
  };

  const updateXianyanDushi = (data: XianyanDushi) => {
    onChange({ ...value, xianyan_dushi: data });
  };

  const updateKehuanMoshi = (data: KehuanMoshi) => {
    onChange({ ...value, kehuan_moshi: data });
  };

  const updateXuanyiXingzhen = (data: XuanyiXingzhen) => {
    onChange({ ...value, xuanyi_xingzhen: data });
  };

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '玄幻仙侠';

    new Setting(section)
      .setName('修为等级')
      .addText(text => {
        text.setValue(value.xuanhuan_xianxia?.cultivation_level || '').onChange(val => {
          updateXuanhuanXianxia({ ...value.xuanhuan_xianxia, cultivation_level: val } as XuanhuanXianxia);
        });
      });

    new Setting(section)
      .setName('灵根/武魂')
      .addText(text => {
        text.setValue(value.xuanhuan_xianxia?.spirit_root_martial_soul || '').onChange(val => {
          updateXuanhuanXianxia({ ...value.xuanhuan_xianxia, spirit_root_martial_soul: val } as XuanhuanXianxia);
        });
      });

    new Setting(section)
      .setName('修炼法门/法宝')
      .addText(text => {
        text.setValue(value.xuanhuan_xianxia?.cultivation_method_magic_treasure || '').onChange(val => {
          updateXuanhuanXianxia({ ...value.xuanhuan_xianxia, cultivation_method_magic_treasure: val } as XuanhuanXianxia);
        });
      });

    new Setting(section)
      .setName('门派')
      .addText(text => {
        text.setValue(value.xuanhuan_xianxia?.sect || '').onChange(val => {
          updateXuanhuanXianxia({ ...value.xuanhuan_xianxia, sect: val } as XuanhuanXianxia);
        });
      });

    new Setting(section)
      .setName('寿命')
      .addText(text => {
        text.setValue(value.xuanhuan_xianxia?.lifespan || '').onChange(val => {
          updateXuanhuanXianxia({ ...value.xuanhuan_xianxia, lifespan: val } as XuanhuanXianxia);
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '古言宫斗';

    new Setting(section)
      .setName('王朝年份')
      .addText(text => {
        text.setValue(value.guyan_gongdou?.dynasty_year || '').onChange(val => {
          updateGuyanGongdou({ ...value.guyan_gongdou, dynasty_year: val } as GuyanGongdou);
        });
      });

    new Setting(section)
      .setName('贵族头衔')
      .addText(text => {
        text.setValue(value.guyan_gongdou?.noble_title || '').onChange(val => {
          updateGuyanGongdou({ ...value.guyan_gongdou, noble_title: val } as GuyanGongdou);
        });
      });

    new Setting(section)
      .setName('家族势力')
      .addText(text => {
        text.setValue(value.guyan_gongdou?.family_power || '').onChange(val => {
          updateGuyanGongdou({ ...value.guyan_gongdou, family_power: val } as GuyanGongdou);
        });
      });

    new Setting(section)
      .setName('府邸宫殿')
      .addText(text => {
        text.setValue(value.guyan_gongdou?.mansion_palace || '').onChange(val => {
          updateGuyanGongdou({ ...value.guyan_gongdou, mansion_palace: val } as GuyanGongdou);
        });
      });

    new Setting(section)
      .setName('阵营')
      .addText(text => {
        text.setValue(value.guyan_gongdou?.court_camp || '').onChange(val => {
          updateGuyanGongdou({ ...value.guyan_gongdou, court_camp: val } as GuyanGongdou);
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '都市现言';

    new Setting(section)
      .setName('职业职位')
      .addText(text => {
        text.setValue(value.xianyan_dushi?.career_position || '').onChange(val => {
          updateXianyanDushi({ ...value.xianyan_dushi, career_position: val } as XianyanDushi);
        });
      });

    new Setting(section)
      .setName('公司行业')
      .addText(text => {
        text.setValue(value.xianyan_dushi?.company_industry || '').onChange(val => {
          updateXianyanDushi({ ...value.xianyan_dushi, company_industry: val } as XianyanDushi);
        });
      });

    new Setting(section)
      .setName('资产')
      .addText(text => {
        text.setValue(value.xianyan_dushi?.assets || '').onChange(val => {
          updateXianyanDushi({ ...value.xianyan_dushi, assets: val } as XianyanDushi);
        });
      });

    new Setting(section)
      .setName('社会资源')
      .addText(text => {
        text.setValue(value.xianyan_dushi?.social_resources || '').onChange(val => {
          updateXianyanDushi({ ...value.xianyan_dushi, social_resources: val } as XianyanDushi);
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '科幻末世';

    new Setting(section)
      .setName('能力等级')
      .addText(text => {
        text.setValue(value.kehuan_moshi?.ability_level || '').onChange(val => {
          updateKehuanMoshi({ ...value.kehuan_moshi, ability_level: val } as KehuanMoshi);
        });
      });

    new Setting(section)
      .setName('机械改造')
      .addText(text => {
        text.setValue(value.kehuan_moshi?.cybernetic_reform || '').onChange(val => {
          updateKehuanMoshi({ ...value.kehuan_moshi, cybernetic_reform: val } as KehuanMoshi);
        });
      });

    new Setting(section)
      .setName('阵营基地')
      .addText(text => {
        text.setValue(value.kehuan_moshi?.camp_base || '').onChange(val => {
          updateKehuanMoshi({ ...value.kehuan_moshi, camp_base: val } as KehuanMoshi);
        });
      });

    new Setting(section)
      .setName('生存能力')
      .addText(text => {
        text.setValue(value.kehuan_moshi?.survival_ability || '').onChange(val => {
          updateKehuanMoshi({ ...value.kehuan_moshi, survival_ability: val } as KehuanMoshi);
        });
      });
  });

  container.createDiv('nweos-form-section', section => {
    section.createDiv('nweos-form-section-title').textContent = '悬疑刑侦';

    new Setting(section)
      .setName('身份权限')
      .addText(text => {
        text.setValue(value.xuanyi_xingzhen?.identity_authority || '').onChange(val => {
          updateXuanyiXingzhen({ ...value.xuanyi_xingzhen, identity_authority: val } as XuanyiXingzhen);
        });
      });

    new Setting(section)
      .setName('破案能力')
      .addText(text => {
        text.setValue(value.xuanyi_xingzhen?.case_solving_ability || '').onChange(val => {
          updateXuanyiXingzhen({ ...value.xuanyi_xingzhen, case_solving_ability: val } as XuanyiXingzhen);
        });
      });

    new Setting(section)
      .setName('核心秘密')
      .addText(text => {
        text.setValue(value.xuanyi_xingzhen?.core_secret || '').onChange(val => {
          updateXuanyiXingzhen({ ...value.xuanyi_xingzhen, core_secret: val } as XuanyiXingzhen);
        });
      });

    new Setting(section)
      .setName('心理画像')
      .addTextArea(text => {
        text.setValue(value.xuanyi_xingzhen?.psychological_profile || '').onChange(val => {
          updateXuanyiXingzhen({ ...value.xuanyi_xingzhen, psychological_profile: val } as XuanyiXingzhen);
        });
      });
  });
}
