import { App, Modal, Setting, Notice } from 'obsidian';
import { NWEOSCharacter, Metadata, CorePosition, Identity, Appearance, Abilities, Psychology, BehaviorPattern, BackgroundHistory, PreferencesLifestyle, MotivationArc, PlotBinding, RelationshipNetwork, TrackExtension, StandardInfo } from '../types/nweos';
import { generateId, getCurrentTimestamp } from '../utils/helpers';
import { TabContainer, TAB_CONFIG } from './TabContainer';
import { checkRedLines, getRedLineWarnings } from '../redline';

export interface EditorModalOptions {
  app: App;
  character?: NWEOSCharacter;
  onSave: (character: NWEOSCharacter) => Promise<void>;
  onExportJson?: (character: NWEOSCharacter) => void;
  defaults?: {
    workName?: string;
    novelTrack?: string;
    author?: string;
  };
}

export class EditorModal extends Modal {
  private character: NWEOSCharacter;
  private onSave: (character: NWEOSCharacter) => Promise<void>;
  private onExportJson?: (character: NWEOSCharacter) => void;
  //private onImportJson?: (json: string) => NWEOSCharacter | null;
  private tabContainer!: TabContainer;
  //private formData: Partial<NWEOSCharacter> = {};
  private isNewCharacter: boolean;
  private defaults: EditorModalOptions['defaults'];

  constructor(options: EditorModalOptions) {
    super(options.app);
    this.onSave = options.onSave;
    this.onExportJson = options.onExportJson;
    this.isNewCharacter = !options.character;
    this.defaults = options.defaults;

    this.character = options.character || this.createEmptyCharacter();
  }

  private createEmptyCharacter(): NWEOSCharacter {
    const id = generateId();
    const timestamp = getCurrentTimestamp();

    return {
      standard: {
        version: '1.0.0',
        schema: 'nweos',
        format: 'character-card'
      },
      metadata: {
        character_id: id,
        character_name: '',
        work_name: this.defaults?.workName || '',
        novel_track: this.defaults?.novelTrack || '',
        character_position: '',
        character_version: '1.0',
        author: this.defaults?.author || '',
        created_at: timestamp,
        last_updated: timestamp
      },
      core_position: {
        core_tags: [],
        track_adapt_tags: [],
        core_shine_points: [],
        core_angst_points: [],
        reader_memory_points: [],
        character_red_line: []
      },
      identity: {
        names: {
          full_name: '',
          courtesy_name: '',
          nickname: [],
          code_name: '',
          title: ''
        },
        basic_info: {
          age: undefined,
          age_perceived: undefined,
          gender: '',
          birthday: '',
          birthplace: '',
          current_residence: ''
        },
        identity_system: {
          public_identity: '',
          hidden_identity: '',
          camp: '',
          family_clan: '',
          status_rank: ''
        }
      },
      appearance: {
        basic_appearance: {
          face_shape: '',
          skin: '',
          eyes: '',
          hair: '',
          body_shape: '',
          height_cm: undefined,
          weight_kg: undefined
        },
        iconic_features: [],
        scene_style: {
          daily: '',
          formal: '',
          fight_crisis: '',
          emotional_out_of_control: ''
        },
        appearance_plot_binding: ''
      },
      abilities: {
        basic_abilities: [],
        core_skills: [],
        gold_finger_system: [],
        fatal_flaw: []
      },
      psychology: {
        core_personality: {
          public_persona: '',
          private_persona: '',
          core_traits: [],
          contrast_design: []
        },
        personality_model: {
          ocean: {
            openness: 50,
            conscientiousness: 50,
            extraversion: 50,
            agreeableness: 50,
            neuroticism: 50
          },
          mbti: '',
          temperament: ''
        },
        moral_principle: {
          alignment: '',
          core_values: [],
          bottom_line: [],
          conflict_handling: ''
        },
        emotional_profile: {
          base_mood: '',
          emotional_volatility: 50,
          joy_triggers: [],
          anger_triggers: [],
          breakdown_triggers: [],
          soft_triggers: []
        },
        psychological_trauma: '',
        obsession: '',
        personality_growth_line: '',
        ooc_red_line: []
      },
      behavior_pattern: {
        speech_style: {
          formality_level: 50,
          verbosity_level: 50,
          vocabulary_habit: '',
          tone: '',
          catchphrases: [],
          forbidden_words: [],
          scene_speech_change: {}
        },
        action_habits: {
          iconic_tics: [],
          crisis_first_reaction: '',
          decision_making_style: '',
          interaction_habit: ''
        }
      },
      background_history: {
        origin_story: '',
        education_experience: '',
        career_experience: '',
        hidden_secret: '',
        family_background: '',
        key_life_events: []
      },
      preferences_lifestyle: {
        hobbies: [],
        favorites: {
          food: '',
          color: '',
          thing: '',
          season: '',
          scene: ''
        },
        aversions: [],
        preference_plot_binding: '',
        lifestyle_habit: ''
      },
      motivation_arc: {
        core_drive: '',
        goals: {
          short_term: [],
          medium_term: [],
          long_term_ultimate: ''
        },
        core_fears: {
          rational: [],
          irrational: []
        },
        character_arc_path: {
          opening_state: '',
          growth_nodes: [],
          highlight_moment: '',
          final_state: '',
          character_transformation: ''
        }
      },
      plot_binding: {
        debut_chapter_node: '',
        core_highlight_nodes: [],
        personality_transformation_nodes: [],
        foreshadowing_recycle_nodes: [],
        main_line_binding: '',
        ending_setting: '',
        extra_content: ''
      },
      relationship_network: {
        core_relationships: [],
        secondary_relationships: [],
        hostile_relationships: [],
        neutral_acquaintances: []
      },
      track_extension: {}
    };
  }

  async onOpen(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createDiv('nweos-editor-modal', modalEl => {
      const headerEl = modalEl.createDiv('nweos-editor-header');
      headerEl.createDiv('nweos-editor-title').textContent = this.isNewCharacter ? '新建角色卡' : '编辑角色卡';

      const bodyEl = modalEl.createDiv('nweos-editor-body');

      const navEl = bodyEl.createDiv('nweos-editor-nav');
      this.tabContainer = new TabContainer(navEl, (tabId) => {
        this.renderTabContent(tabId);
      });

      const formEl = bodyEl.createDiv('nweos-editor-form');
      formEl.appendChild(this.tabContainer.getContentContainer());

      this.renderTabContent(TAB_CONFIG[0].id);

      const footerEl = modalEl.createDiv('nweos-editor-footer');

      new Setting(footerEl)
        .addButton(btn => btn
          .setButtonText('保存')
          .setCta()
          .onClick(() => this.handleSave()));

      new Setting(footerEl)
        .addButton(btn => btn
          .setButtonText('取消')
          .onClick(() => this.close()));

      if (this.onExportJson) {
        new Setting(footerEl)
          .addButton(btn => btn
            .setButtonText('导出JSON')
            .onClick(() => {
              if (this.onExportJson) {
                this.onExportJson(this.character);
              }
            }));
      }

      new Setting(footerEl)
        .addButton(btn => btn
          .setButtonText('导入JSON')
          .onClick(() => this.handleImportJson()));

      new Setting(footerEl)
        .addButton(btn => btn
          .setButtonText('检查红线')
          .onClick(() => this.handleCheckRedLine()));
    });
  }

  private renderTabContent(tabId: string): void {
    const container = this.tabContainer.getContentContainer();
    container.empty();

    switch (tabId) {
      case 'metadata':
        this.renderMetadataTab(container);
        break;
      case 'core-position':
        this.renderCorePositionTab(container);
        break;
      case 'identity':
        this.renderIdentityTab(container);
        break;
      case 'appearance':
        this.renderAppearanceTab(container);
        break;
      case 'abilities':
        this.renderAbilitiesTab(container);
        break;
      case 'psychology':
        this.renderPsychologyTab(container);
        break;
      case 'behavior':
        this.renderBehaviorTab(container);
        break;
      case 'background':
        this.renderBackgroundTab(container);
        break;
      case 'preferences':
        this.renderPreferencesTab(container);
        break;
      case 'motivation':
        this.renderMotivationTab(container);
        break;
      case 'plot-binding':
        this.renderPlotBindingTab(container);
        break;
      case 'relationships':
        this.renderRelationshipsTab(container);
        break;
      case 'track-extension':
        this.renderTrackExtensionTab(container);
        break;
    }
  }

  private renderMetadataTab(container: HTMLElement): void {
    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '核心元数据';
      new Setting(section).setName('角色名称').addText(text => {
        text.setValue(this.character.metadata.character_name).onChange(value => {
          this.character.metadata.character_name = value;
        });
      });
      new Setting(section).setName('作品名称').addText(text => {
        text.setValue(this.character.metadata.work_name).onChange(value => {
          this.character.metadata.work_name = value;
        });
      });
      new Setting(section).setName('赛道分类').addText(text => {
        text.setValue(this.character.metadata.novel_track).onChange(value => {
          this.character.metadata.novel_track = value;
        });
      });
      new Setting(section).setName('角色定位').addText(text => {
        text.setValue(this.character.metadata.character_position).onChange(value => {
          this.character.metadata.character_position = value;
        });
      });
      new Setting(section).setName('作者').addText(text => {
        text.setValue(this.character.metadata.author).onChange(value => {
          this.character.metadata.author = value;
        });
      });
      new Setting(section).setName('备注').addText(text => {
        text.setValue(this.character.metadata.notes || '').onChange(value => {
          this.character.metadata.notes = value;
        });
      });
    });
  }

  private renderCorePositionTab(container: HTMLElement): void {
    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '人物核心定位';
      new Setting(section).setName('核心标签（逗号分隔）').addText(text => {
        text.setValue(this.character.core_position.core_tags.join(', ')).onChange(value => {
          this.character.core_position.core_tags = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('赛道适配标签（逗号分隔）').addText(text => {
        text.setValue(this.character.core_position.track_adapt_tags.join(', ')).onChange(value => {
          this.character.core_position.track_adapt_tags = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('高光点（逗号分隔）').addText(text => {
        text.setValue(this.character.core_position.core_shine_points.join(', ')).onChange(value => {
          this.character.core_position.core_shine_points = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('虐点（逗号分隔）').addText(text => {
        text.setValue(this.character.core_position.core_angst_points.join(', ')).onChange(value => {
          this.character.core_position.core_angst_points = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('读者记忆点（逗号分隔）').addText(text => {
        text.setValue(this.character.core_position.reader_memory_points.join(', ')).onChange(value => {
          this.character.core_position.reader_memory_points = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('角色底线（逗号分隔）').addText(text => {
        text.setValue(this.character.core_position.character_red_line.join(', ')).onChange(value => {
          this.character.core_position.character_red_line = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
    });
  }

  private renderIdentityTab(container: HTMLElement): void {
    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '基础身份';
      new Setting(section).setName('姓名').addText(text => {
        text.setValue(this.character.identity.names.full_name).onChange(value => {
          this.character.identity.names.full_name = value;
        });
      });
      new Setting(section).setName('字/号').addText(text => {
        text.setValue(this.character.identity.names.courtesy_name || '').onChange(value => {
          this.character.identity.names.courtesy_name = value;
        });
      });
      new Setting(section).setName('昵称（逗号分隔）').addText(text => {
        text.setValue(this.character.identity.names.nickname.join(', ')).onChange(value => {
          this.character.identity.names.nickname = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('代号').addText(text => {
        text.setValue(this.character.identity.names.code_name || '').onChange(value => {
          this.character.identity.names.code_name = value;
        });
      });
      new Setting(section).setName('称号').addText(text => {
        text.setValue(this.character.identity.names.title || '').onChange(value => {
          this.character.identity.names.title = value;
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '基本信息';
      new Setting(section).setName('年龄').addText(text => {
        text.setValue(String(this.character.identity.basic_info.age || '')).onChange(value => {
          this.character.identity.basic_info.age = value ? parseInt(value) : undefined;
        });
      });
      new Setting(section).setName('外貌年龄').addText(text => {
        text.setValue(String(this.character.identity.basic_info.age_perceived || '')).onChange(value => {
          this.character.identity.basic_info.age_perceived = value ? parseInt(value) : undefined;
        });
      });
      new Setting(section).setName('性别').addText(text => {
        text.setValue(this.character.identity.basic_info.gender).onChange(value => {
          this.character.identity.basic_info.gender = value;
        });
      });
      new Setting(section).setName('生日').addText(text => {
        text.setValue(this.character.identity.basic_info.birthday || '').onChange(value => {
          this.character.identity.basic_info.birthday = value;
        });
      });
      new Setting(section).setName('出生地').addText(text => {
        text.setValue(this.character.identity.basic_info.birthplace || '').onChange(value => {
          this.character.identity.basic_info.birthplace = value;
        });
      });
      new Setting(section).setName('当前居住地').addText(text => {
        text.setValue(this.character.identity.basic_info.current_residence || '').onChange(value => {
          this.character.identity.basic_info.current_residence = value;
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '身份体系';
      new Setting(section).setName('公开身份').addText(text => {
        text.setValue(this.character.identity.identity_system.public_identity).onChange(value => {
          this.character.identity.identity_system.public_identity = value;
        });
      });
      new Setting(section).setName('隐藏身份').addText(text => {
        text.setValue(this.character.identity.identity_system.hidden_identity || '').onChange(value => {
          this.character.identity.identity_system.hidden_identity = value;
        });
      });
      new Setting(section).setName('阵营').addText(text => {
        text.setValue(this.character.identity.identity_system.camp).onChange(value => {
          this.character.identity.identity_system.camp = value;
        });
      });
      new Setting(section).setName('家族/门派').addText(text => {
        text.setValue(this.character.identity.identity_system.family_clan || '').onChange(value => {
          this.character.identity.identity_system.family_clan = value;
        });
      });
      new Setting(section).setName('地位等级').addText(text => {
        text.setValue(this.character.identity.identity_system.status_rank || '').onChange(value => {
          this.character.identity.identity_system.status_rank = value;
        });
      });
    });
  }

  private renderAppearanceTab(container: HTMLElement): void {
    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '外貌特征';
      new Setting(section).setName('脸型').addText(text => {
        text.setValue(this.character.appearance.basic_appearance.face_shape || '').onChange(value => {
          this.character.appearance.basic_appearance.face_shape = value;
        });
      });
      new Setting(section).setName('肤色').addText(text => {
        text.setValue(this.character.appearance.basic_appearance.skin || '').onChange(value => {
          this.character.appearance.basic_appearance.skin = value;
        });
      });
      new Setting(section).setName('眼睛').addText(text => {
        text.setValue(this.character.appearance.basic_appearance.eyes || '').onChange(value => {
          this.character.appearance.basic_appearance.eyes = value;
        });
      });
      new Setting(section).setName('发型').addText(text => {
        text.setValue(this.character.appearance.basic_appearance.hair || '').onChange(value => {
          this.character.appearance.basic_appearance.hair = value;
        });
      });
      new Setting(section).setName('身材').addText(text => {
        text.setValue(this.character.appearance.basic_appearance.body_shape || '').onChange(value => {
          this.character.appearance.basic_appearance.body_shape = value;
        });
      });
      new Setting(section).setName('身高(cm)').addText(text => {
        text.setValue(String(this.character.appearance.basic_appearance.height_cm || '')).onChange(value => {
          this.character.appearance.basic_appearance.height_cm = value ? parseInt(value) : undefined;
        });
      });
      new Setting(section).setName('体重(kg)').addText(text => {
        text.setValue(String(this.character.appearance.basic_appearance.weight_kg || '')).onChange(value => {
          this.character.appearance.basic_appearance.weight_kg = value ? parseInt(value) : undefined;
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '标志性特征';
      new Setting(section).setName('标志性特征（逗号分隔）').addText(text => {
        text.setValue(this.character.appearance.iconic_features.join(', ')).onChange(value => {
          this.character.appearance.iconic_features = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '场景风格';
      new Setting(section).setName('日常').addText(text => {
        text.setValue(this.character.appearance.scene_style.daily || '').onChange(value => {
          this.character.appearance.scene_style.daily = value;
        });
      });
      new Setting(section).setName('正式').addText(text => {
        text.setValue(this.character.appearance.scene_style.formal || '').onChange(value => {
          this.character.appearance.scene_style.formal = value;
        });
      });
      new Setting(section).setName('战斗/危机').addText(text => {
        text.setValue(this.character.appearance.scene_style.fight_crisis || '').onChange(value => {
          this.character.appearance.scene_style.fight_crisis = value;
        });
      });
      new Setting(section).setName('情绪失控').addText(text => {
        text.setValue(this.character.appearance.scene_style.emotional_out_of_control || '').onChange(value => {
          this.character.appearance.scene_style.emotional_out_of_control = value;
        });
      });
    });
  }

  private renderAbilitiesTab(container: HTMLElement): void {
    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '能力体系';
      new Setting(section).setName('基础能力说明').addTextArea(text => {
        text.setValue(JSON.stringify(this.character.abilities.basic_abilities)).onChange(value => {
          try {
            this.character.abilities.basic_abilities = JSON.parse(value);
          } catch (e) { }
        });
      });
      new Setting(section).setName('核心技能说明').addTextArea(text => {
        text.setValue(JSON.stringify(this.character.abilities.core_skills)).onChange(value => {
          try {
            this.character.abilities.core_skills = JSON.parse(value);
          } catch (e) { }
        });
      });
      new Setting(section).setName('金手指系统说明').addTextArea(text => {
        text.setValue(JSON.stringify(this.character.abilities.gold_finger_system)).onChange(value => {
          try {
            this.character.abilities.gold_finger_system = JSON.parse(value);
          } catch (e) { }
        });
      });
      new Setting(section).setName('致命缺陷（逗号分隔）').addText(text => {
        text.setValue(this.character.abilities.fatal_flaw.join(', ')).onChange(value => {
          this.character.abilities.fatal_flaw = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
    });
  }

  private renderPsychologyTab(container: HTMLElement): void {
    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '核心人格';
      new Setting(section).setName('公开人设').addTextArea(text => {
        text.setValue(this.character.psychology.core_personality.public_persona).onChange(value => {
          this.character.psychology.core_personality.public_persona = value;
        });
      });
      new Setting(section).setName('私人真实').addTextArea(text => {
        text.setValue(this.character.psychology.core_personality.private_persona).onChange(value => {
          this.character.psychology.core_personality.private_persona = value;
        });
      });
      new Setting(section).setName('核心特质（逗号分隔）').addText(text => {
        text.setValue(this.character.psychology.core_personality.core_traits.join(', ')).onChange(value => {
          this.character.psychology.core_personality.core_traits = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = 'OCEAN人格模型';
      new Setting(section).setName('开放性').addSlider(slider => {
        slider.setValue(this.character.psychology.personality_model.ocean.openness).onChange(value => {
          this.character.psychology.personality_model.ocean.openness = value;
        });
      });
      new Setting(section).setName('尽责性').addSlider(slider => {
        slider.setValue(this.character.psychology.personality_model.ocean.conscientiousness).onChange(value => {
          this.character.psychology.personality_model.ocean.conscientiousness = value;
        });
      });
      new Setting(section).setName('外向性').addSlider(slider => {
        slider.setValue(this.character.psychology.personality_model.ocean.extraversion).onChange(value => {
          this.character.psychology.personality_model.ocean.extraversion = value;
        });
      });
      new Setting(section).setName('宜人性').addSlider(slider => {
        slider.setValue(this.character.psychology.personality_model.ocean.agreeableness).onChange(value => {
          this.character.psychology.personality_model.ocean.agreeableness = value;
        });
      });
      new Setting(section).setName('神经质').addSlider(slider => {
        slider.setValue(this.character.psychology.personality_model.ocean.neuroticism).onChange(value => {
          this.character.psychology.personality_model.ocean.neuroticism = value;
        });
      });
      new Setting(section).setName('MBTI').addText(text => {
        text.setValue(this.character.psychology.personality_model.mbti || '').onChange(value => {
          this.character.psychology.personality_model.mbti = value;
        });
      });
      new Setting(section).setName('气质类型').addText(text => {
        text.setValue(this.character.psychology.personality_model.temperament || '').onChange(value => {
          this.character.psychology.personality_model.temperament = value;
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '道德原则';
      new Setting(section).setName('阵营').addText(text => {
        text.setValue(this.character.psychology.moral_principle.alignment).onChange(value => {
          this.character.psychology.moral_principle.alignment = value;
        });
      });
      new Setting(section).setName('核心价值观（逗号分隔）').addText(text => {
        text.setValue(this.character.psychology.moral_principle.core_values.join(', ')).onChange(value => {
          this.character.psychology.moral_principle.core_values = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('底线（逗号分隔）').addText(text => {
        text.setValue(this.character.psychology.moral_principle.bottom_line.join(', ')).onChange(value => {
          this.character.psychology.moral_principle.bottom_line = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('冲突处理方式').addTextArea(text => {
        text.setValue(this.character.psychology.moral_principle.conflict_handling).onChange(value => {
          this.character.psychology.moral_principle.conflict_handling = value;
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '情感画像';
      new Setting(section).setName('基础情绪').addText(text => {
        text.setValue(this.character.psychology.emotional_profile.base_mood).onChange(value => {
          this.character.psychology.emotional_profile.base_mood = value;
        });
      });
      new Setting(section).setName('情绪波动程度').addSlider(slider => {
        slider.setValue(this.character.psychology.emotional_profile.emotional_volatility).onChange(value => {
          this.character.psychology.emotional_profile.emotional_volatility = value;
        });
      });
      new Setting(section).setName('开心触发点（逗号分隔）').addText(text => {
        text.setValue(this.character.psychology.emotional_profile.joy_triggers.join(', ')).onChange(value => {
          this.character.psychology.emotional_profile.joy_triggers = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('愤怒触发点（逗号分隔）').addText(text => {
        text.setValue(this.character.psychology.emotional_profile.anger_triggers.join(', ')).onChange(value => {
          this.character.psychology.emotional_profile.anger_triggers = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('崩溃触发点（逗号分隔）').addText(text => {
        text.setValue(this.character.psychology.emotional_profile.breakdown_triggers.join(', ')).onChange(value => {
          this.character.psychology.emotional_profile.breakdown_triggers = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('软化触发点（逗号分隔）').addText(text => {
        text.setValue(this.character.psychology.emotional_profile.soft_triggers.join(', ')).onChange(value => {
          this.character.psychology.emotional_profile.soft_triggers = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '心理创伤与执念';
      new Setting(section).setName('心理创伤').addTextArea(text => {
        text.setValue(this.character.psychology.psychological_trauma || '').onChange(value => {
          this.character.psychology.psychological_trauma = value;
        });
      });
      new Setting(section).setName('执念').addTextArea(text => {
        text.setValue(this.character.psychology.obsession || '').onChange(value => {
          this.character.psychology.obsession = value;
        });
      });
      new Setting(section).setName('人格成长线').addTextArea(text => {
        text.setValue(this.character.psychology.personality_growth_line || '').onChange(value => {
          this.character.psychology.personality_growth_line = value;
        });
      });
      new Setting(section).setName('OOC底线（逗号分隔）').addText(text => {
        text.setValue(this.character.psychology.ooc_red_line.join(', ')).onChange(value => {
          this.character.psychology.ooc_red_line = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
    });
  }

  private renderBehaviorTab(container: HTMLElement): void {
    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '语言风格';
      new Setting(section).setName('正式程度').addSlider(slider => {
        slider.setValue(this.character.behavior_pattern.speech_style.formality_level).onChange(value => {
          this.character.behavior_pattern.speech_style.formality_level = value;
        });
      });
      new Setting(section).setName('话唠程度').addSlider(slider => {
        slider.setValue(this.character.behavior_pattern.speech_style.verbosity_level).onChange(value => {
          this.character.behavior_pattern.speech_style.verbosity_level = value;
        });
      });
      new Setting(section).setName('用词习惯').addText(text => {
        text.setValue(this.character.behavior_pattern.speech_style.vocabulary_habit).onChange(value => {
          this.character.behavior_pattern.speech_style.vocabulary_habit = value;
        });
      });
      new Setting(section).setName('语气').addText(text => {
        text.setValue(this.character.behavior_pattern.speech_style.tone).onChange(value => {
          this.character.behavior_pattern.speech_style.tone = value;
        });
      });
      new Setting(section).setName('口头禅（逗号分隔）').addText(text => {
        text.setValue(this.character.behavior_pattern.speech_style.catchphrases.join(', ')).onChange(value => {
          this.character.behavior_pattern.speech_style.catchphrases = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('禁语（逗号分隔）').addText(text => {
        text.setValue(this.character.behavior_pattern.speech_style.forbidden_words.join(', ')).onChange(value => {
          this.character.behavior_pattern.speech_style.forbidden_words = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '行为习惯';
      new Setting(section).setName('标志性小动作（逗号分隔）').addText(text => {
        text.setValue(this.character.behavior_pattern.action_habits.iconic_tics.join(', ')).onChange(value => {
          this.character.behavior_pattern.action_habits.iconic_tics = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('危机第一反应').addText(text => {
        text.setValue(this.character.behavior_pattern.action_habits.crisis_first_reaction).onChange(value => {
          this.character.behavior_pattern.action_habits.crisis_first_reaction = value;
        });
      });
      new Setting(section).setName('决策风格').addText(text => {
        text.setValue(this.character.behavior_pattern.action_habits.decision_making_style).onChange(value => {
          this.character.behavior_pattern.action_habits.decision_making_style = value;
        });
      });
      new Setting(section).setName('互动习惯').addTextArea(text => {
        text.setValue(this.character.behavior_pattern.action_habits.interaction_habit || '').onChange(value => {
          this.character.behavior_pattern.action_habits.interaction_habit = value;
        });
      });
    });
  }

  private renderBackgroundTab(container: HTMLElement): void {
    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '过往经历';
      new Setting(section).setName('起源故事').addTextArea(text => {
        text.setValue(this.character.background_history.origin_story || '').onChange(value => {
          this.character.background_history.origin_story = value;
        });
      });
      new Setting(section).setName('教育经历').addTextArea(text => {
        text.setValue(this.character.background_history.education_experience || '').onChange(value => {
          this.character.background_history.education_experience = value;
        });
      });
      new Setting(section).setName('职业经历').addTextArea(text => {
        text.setValue(this.character.background_history.career_experience || '').onChange(value => {
          this.character.background_history.career_experience = value;
        });
      });
      new Setting(section).setName('隐藏秘密').addTextArea(text => {
        text.setValue(this.character.background_history.hidden_secret || '').onChange(value => {
          this.character.background_history.hidden_secret = value;
        });
      });
      new Setting(section).setName('家庭背景').addTextArea(text => {
        text.setValue(this.character.background_history.family_background || '').onChange(value => {
          this.character.background_history.family_background = value;
        });
      });
      new Setting(section).setName('关键人生事件(JSON)').addTextArea(text => {
        text.setValue(JSON.stringify(this.character.background_history.key_life_events, null, 2)).onChange(value => {
          try {
            this.character.background_history.key_life_events = JSON.parse(value);
          } catch (e) { }
        });
      });
    });
  }

  private renderPreferencesTab(container: HTMLElement): void {
    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '喜恶偏好';
      new Setting(section).setName('兴趣爱好（逗号分隔）').addText(text => {
        text.setValue(this.character.preferences_lifestyle.hobbies.join(', ')).onChange(value => {
          this.character.preferences_lifestyle.hobbies = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('喜欢的食物').addText(text => {
        text.setValue(this.character.preferences_lifestyle.favorites.food || '').onChange(value => {
          this.character.preferences_lifestyle.favorites.food = value;
        });
      });
      new Setting(section).setName('喜欢的颜色').addText(text => {
        text.setValue(this.character.preferences_lifestyle.favorites.color || '').onChange(value => {
          this.character.preferences_lifestyle.favorites.color = value;
        });
      });
      new Setting(section).setName('喜欢的事物').addText(text => {
        text.setValue(this.character.preferences_lifestyle.favorites.thing || '').onChange(value => {
          this.character.preferences_lifestyle.favorites.thing = value;
        });
      });
      new Setting(section).setName('喜欢的季节').addText(text => {
        text.setValue(this.character.preferences_lifestyle.favorites.season || '').onChange(value => {
          this.character.preferences_lifestyle.favorites.season = value;
        });
      });
      new Setting(section).setName('喜欢的场景').addText(text => {
        text.setValue(this.character.preferences_lifestyle.favorites.scene || '').onChange(value => {
          this.character.preferences_lifestyle.favorites.scene = value;
        });
      });
      new Setting(section).setName('厌恶（逗号分隔）').addText(text => {
        text.setValue(this.character.preferences_lifestyle.aversions.join(', ')).onChange(value => {
          this.character.preferences_lifestyle.aversions = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('生活方式习惯').addTextArea(text => {
        text.setValue(this.character.preferences_lifestyle.lifestyle_habit || '').onChange(value => {
          this.character.preferences_lifestyle.lifestyle_habit = value;
        });
      });
    });
  }

  private renderMotivationTab(container: HTMLElement): void {
    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '动机弧光';
      new Setting(section).setName('核心驱动力').addTextArea(text => {
        text.setValue(this.character.motivation_arc.core_drive).onChange(value => {
          this.character.motivation_arc.core_drive = value;
        });
      });
      new Setting(section).setName('短期目标（逗号分隔）').addText(text => {
        text.setValue(this.character.motivation_arc.goals.short_term.join(', ')).onChange(value => {
          this.character.motivation_arc.goals.short_term = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('中期目标（逗号分隔）').addText(text => {
        text.setValue(this.character.motivation_arc.goals.medium_term.join(', ')).onChange(value => {
          this.character.motivation_arc.goals.medium_term = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('长期/终极目标').addTextArea(text => {
        text.setValue(this.character.motivation_arc.goals.long_term_ultimate).onChange(value => {
          this.character.motivation_arc.goals.long_term_ultimate = value;
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '核心恐惧';
      new Setting(section).setName('理性恐惧（逗号分隔）').addText(text => {
        text.setValue(this.character.motivation_arc.core_fears.rational.join(', ')).onChange(value => {
          this.character.motivation_arc.core_fears.rational = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('非理性恐惧（逗号分隔）').addText(text => {
        text.setValue(this.character.motivation_arc.core_fears.irrational.join(', ')).onChange(value => {
          this.character.motivation_arc.core_fears.irrational = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '角色弧光路线';
      new Setting(section).setName('初始状态').addTextArea(text => {
        text.setValue(this.character.motivation_arc.character_arc_path.opening_state).onChange(value => {
          this.character.motivation_arc.character_arc_path.opening_state = value;
        });
      });
      new Setting(section).setName('成长节点（逗号分隔）').addText(text => {
        text.setValue(this.character.motivation_arc.character_arc_path.growth_nodes.join(', ')).onChange(value => {
          this.character.motivation_arc.character_arc_path.growth_nodes = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('高光时刻').addTextArea(text => {
        text.setValue(this.character.motivation_arc.character_arc_path.highlight_moment).onChange(value => {
          this.character.motivation_arc.character_arc_path.highlight_moment = value;
        });
      });
      new Setting(section).setName('最终状态').addTextArea(text => {
        text.setValue(this.character.motivation_arc.character_arc_path.final_state).onChange(value => {
          this.character.motivation_arc.character_arc_path.final_state = value;
        });
      });
      new Setting(section).setName('角色转变').addTextArea(text => {
        text.setValue(this.character.motivation_arc.character_arc_path.character_transformation).onChange(value => {
          this.character.motivation_arc.character_arc_path.character_transformation = value;
        });
      });
    });
  }

  private renderPlotBindingTab(container: HTMLElement): void {
    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '剧情绑定';
      new Setting(section).setName('出场章节节点').addText(text => {
        text.setValue(this.character.plot_binding.debut_chapter_node).onChange(value => {
          this.character.plot_binding.debut_chapter_node = value;
        });
      });
      new Setting(section).setName('核心高光节点（逗号分隔）').addText(text => {
        text.setValue(this.character.plot_binding.core_highlight_nodes.join(', ')).onChange(value => {
          this.character.plot_binding.core_highlight_nodes = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('人格转变节点（逗号分隔）').addText(text => {
        text.setValue(this.character.plot_binding.personality_transformation_nodes.join(', ')).onChange(value => {
          this.character.plot_binding.personality_transformation_nodes = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('伏笔回收节点（逗号分隔）').addText(text => {
        text.setValue(this.character.plot_binding.foreshadowing_recycle_nodes.join(', ')).onChange(value => {
          this.character.plot_binding.foreshadowing_recycle_nodes = value.split(',').map(t => t.trim()).filter(t => t);
        });
      });
      new Setting(section).setName('主线绑定').addTextArea(text => {
        text.setValue(this.character.plot_binding.main_line_binding || '').onChange(value => {
          this.character.plot_binding.main_line_binding = value;
        });
      });
      new Setting(section).setName('结局设定').addTextArea(text => {
        text.setValue(this.character.plot_binding.ending_setting || '').onChange(value => {
          this.character.plot_binding.ending_setting = value;
        });
      });
      new Setting(section).setName('额外内容').addTextArea(text => {
        text.setValue(this.character.plot_binding.extra_content || '').onChange(value => {
          this.character.plot_binding.extra_content = value;
        });
      });
    });
  }

  private renderRelationshipsTab(container: HTMLElement): void {
    // === 核心关系 ===
    container.createDiv('nweos-form-section', section => {
      const headerEl = section.createDiv('nweos-form-section-header');
      headerEl.createDiv('nweos-form-section-title').textContent = '核心关系';
      const addBtn = headerEl.createEl('button', { text: '+ 添加', cls: 'nweos-add-btn' });
      addBtn.addEventListener('click', () => {
        this.character.relationship_network.core_relationships.push({
          character_name: '', relationship_position: '', core_bond: '',
          relationship_development_line: '', core_conflict: '', iconic_scene_nodes: []
        });
        this.renderTabContent('relationships');
      });

      const list = section.createDiv('nweos-relationship-list');
      this.character.relationship_network.core_relationships.forEach((rel, index) => {
        const card = list.createDiv('nweos-relationship-card');
        const cardHeader = card.createDiv('nweos-relationship-card-header');
        cardHeader.createSpan().textContent = rel.character_name || `核心关系 #${index + 1}`;
        const deleteBtn = cardHeader.createEl('button', { text: '删除', cls: 'nweos-delete-btn' });
        deleteBtn.addEventListener('click', () => {
          this.character.relationship_network.core_relationships.splice(index, 1);
          this.renderTabContent('relationships');
        });

        new Setting(card).setName('角色名').addText(t => t.setValue(rel.character_name).setPlaceholder('关联角色名').onChange(v => { rel.character_name = v; }));
        new Setting(card).setName('关系定位').addText(t => t.setValue(rel.relationship_position).setPlaceholder('例如：师徒/情侣/死敌').onChange(v => { rel.relationship_position = v; }));
        new Setting(card).setName('核心羁绊').addTextArea(t => t.setValue(rel.core_bond).setPlaceholder('描述核心羁绊').onChange(v => { rel.core_bond = v; }));
        new Setting(card).setName('关系发展线').addTextArea(t => t.setValue(rel.relationship_development_line).setPlaceholder('关系如何变化发展').onChange(v => { rel.relationship_development_line = v; }));
        new Setting(card).setName('核心冲突').addTextArea(t => t.setValue(rel.core_conflict || '').setPlaceholder('可选：关系中的核心矛盾').onChange(v => { rel.core_conflict = v; }));

        // 标志性场景节点
        const scenesEl = card.createDiv('nweos-scenes-section');
        const scenesHeader = scenesEl.createDiv('nweos-scenes-header');
        scenesHeader.createSpan().textContent = '标志性场景';
        const addSceneBtn = scenesHeader.createEl('button', { text: '+ 场景', cls: 'nweos-add-btn nweos-add-btn-small' });
        addSceneBtn.addEventListener('click', () => {
          rel.iconic_scene_nodes.push({ description: '', chapter: '' });
          this.renderTabContent('relationships');
        });

        rel.iconic_scene_nodes.forEach((scene, si) => {
          const sceneEl = scenesEl.createDiv('nweos-scene-item');
          new Setting(sceneEl).setName(`场景${si + 1} 章节`).addText(t => t.setValue(scene.chapter || '').setPlaceholder('章节').onChange(v => { scene.chapter = v; }));
          new Setting(sceneEl).setName(`场景${si + 1} 描述`).addText(t => t.setValue(scene.description).setPlaceholder('场景描述').onChange(v => { scene.description = v; }));
          const delScene = sceneEl.createEl('button', { text: '×', cls: 'nweos-delete-btn nweos-delete-btn-small' });
          delScene.addEventListener('click', () => {
            rel.iconic_scene_nodes.splice(si, 1);
            this.renderTabContent('relationships');
          });
        });
      });
    });

    // === 次要关系 ===
    container.createDiv('nweos-form-section', section => {
      const headerEl = section.createDiv('nweos-form-section-header');
      headerEl.createDiv('nweos-form-section-title').textContent = '次要关系';
      const addBtn = headerEl.createEl('button', { text: '+ 添加', cls: 'nweos-add-btn' });
      addBtn.addEventListener('click', () => {
        this.character.relationship_network.secondary_relationships.push({
          character_name: '', relationship_position: '', core_bond: ''
        });
        this.renderTabContent('relationships');
      });

      const list = section.createDiv('nweos-relationship-list');
      this.character.relationship_network.secondary_relationships.forEach((rel, index) => {
        const card = list.createDiv('nweos-relationship-card nweos-relationship-card-secondary');
        const cardHeader = card.createDiv('nweos-relationship-card-header');
        cardHeader.createSpan().textContent = rel.character_name || `次要关系 #${index + 1}`;
        const deleteBtn = cardHeader.createEl('button', { text: '删除', cls: 'nweos-delete-btn' });
        deleteBtn.addEventListener('click', () => {
          this.character.relationship_network.secondary_relationships.splice(index, 1);
          this.renderTabContent('relationships');
        });

        new Setting(card).setName('角色名').addText(t => t.setValue(rel.character_name).setPlaceholder('关联角色名').onChange(v => { rel.character_name = v; }));
        new Setting(card).setName('关系定位').addText(t => t.setValue(rel.relationship_position).setPlaceholder('例如：同门/下属').onChange(v => { rel.relationship_position = v; }));
        new Setting(card).setName('核心羁绊').addText(t => t.setValue(rel.core_bond).setPlaceholder('简述羁绊').onChange(v => { rel.core_bond = v; }));
      });
    });

    // === 敌对关系 ===
    container.createDiv('nweos-form-section', section => {
      const headerEl = section.createDiv('nweos-form-section-header');
      headerEl.createDiv('nweos-form-section-title').textContent = '敌对关系';
      const addBtn = headerEl.createEl('button', { text: '+ 添加', cls: 'nweos-add-btn' });
      addBtn.addEventListener('click', () => {
        this.character.relationship_network.hostile_relationships.push({
          character_name: '', relationship_position: '', reason: ''
        });
        this.renderTabContent('relationships');
      });

      const list = section.createDiv('nweos-relationship-list');
      this.character.relationship_network.hostile_relationships.forEach((rel, index) => {
        const card = list.createDiv('nweos-relationship-card nweos-relationship-card-hostile');
        const cardHeader = card.createDiv('nweos-relationship-card-header');
        cardHeader.createSpan().textContent = rel.character_name || `敌对关系 #${index + 1}`;
        const deleteBtn = cardHeader.createEl('button', { text: '删除', cls: 'nweos-delete-btn' });
        deleteBtn.addEventListener('click', () => {
          this.character.relationship_network.hostile_relationships.splice(index, 1);
          this.renderTabContent('relationships');
        });

        new Setting(card).setName('角色名').addText(t => t.setValue(rel.character_name).setPlaceholder('敌对角色名').onChange(v => { rel.character_name = v; }));
        new Setting(card).setName('关系定位').addText(t => t.setValue(rel.relationship_position).setPlaceholder('例如：宿敌/竞争者').onChange(v => { rel.relationship_position = v; }));
        new Setting(card).setName('敌对原因').addTextArea(t => t.setValue(rel.reason).setPlaceholder('为何敌对').onChange(v => { rel.reason = v; }));
      });
    });

    // === 中立关系 ===
    container.createDiv('nweos-form-section', section => {
      const headerEl = section.createDiv('nweos-form-section-header');
      headerEl.createDiv('nweos-form-section-title').textContent = '中立关系';
      const addBtn = headerEl.createEl('button', { text: '+ 添加', cls: 'nweos-add-btn' });
      addBtn.addEventListener('click', () => {
        this.character.relationship_network.neutral_acquaintances.push({
          character_name: '', relationship_position: '', note: ''
        });
        this.renderTabContent('relationships');
      });

      const list = section.createDiv('nweos-relationship-list');
      this.character.relationship_network.neutral_acquaintances.forEach((rel, index) => {
        const card = list.createDiv('nweos-relationship-card nweos-relationship-card-neutral');
        const cardHeader = card.createDiv('nweos-relationship-card-header');
        cardHeader.createSpan().textContent = rel.character_name || `中立关系 #${index + 1}`;
        const deleteBtn = cardHeader.createEl('button', { text: '删除', cls: 'nweos-delete-btn' });
        deleteBtn.addEventListener('click', () => {
          this.character.relationship_network.neutral_acquaintances.splice(index, 1);
          this.renderTabContent('relationships');
        });

        new Setting(card).setName('角色名').addText(t => t.setValue(rel.character_name).setPlaceholder('角色名').onChange(v => { rel.character_name = v; }));
        new Setting(card).setName('关系定位').addText(t => t.setValue(rel.relationship_position).setPlaceholder('例如：路人/邻居').onChange(v => { rel.relationship_position = v; }));
        new Setting(card).setName('备注').addText(t => t.setValue(rel.note || '').setPlaceholder('可选备注').onChange(v => { rel.note = v; }));
      });
    });
  }

  private renderTrackExtensionTab(container: HTMLElement): void {
    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '玄幻仙侠';
      new Setting(section).setName('修为等级').addText(text => {
        text.setValue(this.character.track_extension.xuanhuan_xianxia?.cultivation_level || '').onChange(value => {
          if (!this.character.track_extension.xuanhuan_xianxia) {
            this.character.track_extension.xuanhuan_xianxia = {};
          }
          this.character.track_extension.xuanhuan_xianxia.cultivation_level = value;
        });
      });
      new Setting(section).setName('灵根/武魂').addText(text => {
        text.setValue(this.character.track_extension.xuanhuan_xianxia?.spirit_root_martial_soul || '').onChange(value => {
          if (!this.character.track_extension.xuanhuan_xianxia) {
            this.character.track_extension.xuanhuan_xianxia = {};
          }
          this.character.track_extension.xuanhuan_xianxia.spirit_root_martial_soul = value;
        });
      });
      new Setting(section).setName('修炼法门/法宝').addText(text => {
        text.setValue(this.character.track_extension.xuanhuan_xianxia?.cultivation_method_magic_treasure || '').onChange(value => {
          if (!this.character.track_extension.xuanhuan_xianxia) {
            this.character.track_extension.xuanhuan_xianxia = {};
          }
          this.character.track_extension.xuanhuan_xianxia.cultivation_method_magic_treasure = value;
        });
      });
      new Setting(section).setName('门派').addText(text => {
        text.setValue(this.character.track_extension.xuanhuan_xianxia?.sect || '').onChange(value => {
          if (!this.character.track_extension.xuanhuan_xianxia) {
            this.character.track_extension.xuanhuan_xianxia = {};
          }
          this.character.track_extension.xuanhuan_xianxia.sect = value;
        });
      });
      new Setting(section).setName('寿命').addText(text => {
        text.setValue(this.character.track_extension.xuanhuan_xianxia?.lifespan || '').onChange(value => {
          if (!this.character.track_extension.xuanhuan_xianxia) {
            this.character.track_extension.xuanhuan_xianxia = {};
          }
          this.character.track_extension.xuanhuan_xianxia.lifespan = value;
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '古言宫斗';
      new Setting(section).setName('王朝年份').addText(text => {
        text.setValue(this.character.track_extension.guyan_gongdou?.dynasty_year || '').onChange(value => {
          if (!this.character.track_extension.guyan_gongdou) {
            this.character.track_extension.guyan_gongdou = {};
          }
          this.character.track_extension.guyan_gongdou.dynasty_year = value;
        });
      });
      new Setting(section).setName('贵族头衔').addText(text => {
        text.setValue(this.character.track_extension.guyan_gongdou?.noble_title || '').onChange(value => {
          if (!this.character.track_extension.guyan_gongdou) {
            this.character.track_extension.guyan_gongdou = {};
          }
          this.character.track_extension.guyan_gongdou.noble_title = value;
        });
      });
      new Setting(section).setName('家族势力').addText(text => {
        text.setValue(this.character.track_extension.guyan_gongdou?.family_power || '').onChange(value => {
          if (!this.character.track_extension.guyan_gongdou) {
            this.character.track_extension.guyan_gongdou = {};
          }
          this.character.track_extension.guyan_gongdou.family_power = value;
        });
      });
      new Setting(section).setName('府邸宫殿').addText(text => {
        text.setValue(this.character.track_extension.guyan_gongdou?.mansion_palace || '').onChange(value => {
          if (!this.character.track_extension.guyan_gongdou) {
            this.character.track_extension.guyan_gongdou = {};
          }
          this.character.track_extension.guyan_gongdou.mansion_palace = value;
        });
      });
      new Setting(section).setName('阵营').addText(text => {
        text.setValue(this.character.track_extension.guyan_gongdou?.court_camp || '').onChange(value => {
          if (!this.character.track_extension.guyan_gongdou) {
            this.character.track_extension.guyan_gongdou = {};
          }
          this.character.track_extension.guyan_gongdou.court_camp = value;
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '都市现言';
      new Setting(section).setName('职业职位').addText(text => {
        text.setValue(this.character.track_extension.xianyan_dushi?.career_position || '').onChange(value => {
          if (!this.character.track_extension.xianyan_dushi) {
            this.character.track_extension.xianyan_dushi = {};
          }
          this.character.track_extension.xianyan_dushi.career_position = value;
        });
      });
      new Setting(section).setName('公司行业').addText(text => {
        text.setValue(this.character.track_extension.xianyan_dushi?.company_industry || '').onChange(value => {
          if (!this.character.track_extension.xianyan_dushi) {
            this.character.track_extension.xianyan_dushi = {};
          }
          this.character.track_extension.xianyan_dushi.company_industry = value;
        });
      });
      new Setting(section).setName('资产').addText(text => {
        text.setValue(this.character.track_extension.xianyan_dushi?.assets || '').onChange(value => {
          if (!this.character.track_extension.xianyan_dushi) {
            this.character.track_extension.xianyan_dushi = {};
          }
          this.character.track_extension.xianyan_dushi.assets = value;
        });
      });
      new Setting(section).setName('社会资源').addText(text => {
        text.setValue(this.character.track_extension.xianyan_dushi?.social_resources || '').onChange(value => {
          if (!this.character.track_extension.xianyan_dushi) {
            this.character.track_extension.xianyan_dushi = {};
          }
          this.character.track_extension.xianyan_dushi.social_resources = value;
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '科幻末世';
      new Setting(section).setName('能力等级').addText(text => {
        text.setValue(this.character.track_extension.kehuan_moshi?.ability_level || '').onChange(value => {
          if (!this.character.track_extension.kehuan_moshi) {
            this.character.track_extension.kehuan_moshi = {};
          }
          this.character.track_extension.kehuan_moshi.ability_level = value;
        });
      });
      new Setting(section).setName('机械改造').addText(text => {
        text.setValue(this.character.track_extension.kehuan_moshi?.cybernetic_reform || '').onChange(value => {
          if (!this.character.track_extension.kehuan_moshi) {
            this.character.track_extension.kehuan_moshi = {};
          }
          this.character.track_extension.kehuan_moshi.cybernetic_reform = value;
        });
      });
      new Setting(section).setName('阵营基地').addText(text => {
        text.setValue(this.character.track_extension.kehuan_moshi?.camp_base || '').onChange(value => {
          if (!this.character.track_extension.kehuan_moshi) {
            this.character.track_extension.kehuan_moshi = {};
          }
          this.character.track_extension.kehuan_moshi.camp_base = value;
        });
      });
      new Setting(section).setName('生存能力').addText(text => {
        text.setValue(this.character.track_extension.kehuan_moshi?.survival_ability || '').onChange(value => {
          if (!this.character.track_extension.kehuan_moshi) {
            this.character.track_extension.kehuan_moshi = {};
          }
          this.character.track_extension.kehuan_moshi.survival_ability = value;
        });
      });
    });

    container.createDiv('nweos-form-section', section => {
      section.createDiv('nweos-form-section-title').textContent = '悬疑刑侦';
      new Setting(section).setName('身份权限').addText(text => {
        text.setValue(this.character.track_extension.xuanyi_xingzhen?.identity_authority || '').onChange(value => {
          if (!this.character.track_extension.xuanyi_xingzhen) {
            this.character.track_extension.xuanyi_xingzhen = {};
          }
          this.character.track_extension.xuanyi_xingzhen.identity_authority = value;
        });
      });
      new Setting(section).setName('破案能力').addText(text => {
        text.setValue(this.character.track_extension.xuanyi_xingzhen?.case_solving_ability || '').onChange(value => {
          if (!this.character.track_extension.xuanyi_xingzhen) {
            this.character.track_extension.xuanyi_xingzhen = {};
          }
          this.character.track_extension.xuanyi_xingzhen.case_solving_ability = value;
        });
      });
      new Setting(section).setName('核心秘密').addText(text => {
        text.setValue(this.character.track_extension.xuanyi_xingzhen?.core_secret || '').onChange(value => {
          if (!this.character.track_extension.xuanyi_xingzhen) {
            this.character.track_extension.xuanyi_xingzhen = {};
          }
          this.character.track_extension.xuanyi_xingzhen.core_secret = value;
        });
      });
      new Setting(section).setName('心理画像').addTextArea(text => {
        text.setValue(this.character.track_extension.xuanyi_xingzhen?.psychological_profile || '').onChange(value => {
          if (!this.character.track_extension.xuanyi_xingzhen) {
            this.character.track_extension.xuanyi_xingzhen = {};
          }
          this.character.track_extension.xuanyi_xingzhen.psychological_profile = value;
        });
      });
    });
  }

  private async handleSave(): Promise<void> {
    try {
      this.character.metadata.last_updated = getCurrentTimestamp();
      await this.onSave(this.character);
      this.close();
    } catch (error) {
      console.error('保存角色失败:', error);
      new Notice('保存失败: ' + (error as Error).message);
    }
  }

  private handleImportJson(): void {
    const jsonString = prompt('请粘贴JSON内容:');
    if (!jsonString) return;

    try {
      const parsed = JSON.parse(jsonString);

      if (parsed.standard?.schema !== 'nweos') {
        new Notice('无效的NWEOS角色卡格式');
        return;
      }

      parsed.metadata.character_id = generateId();
      parsed.metadata.created_at = getCurrentTimestamp();
      parsed.metadata.last_updated = getCurrentTimestamp();

      this.character = parsed;
      this.isNewCharacter = false;
      this.renderTabContent(this.tabContainer.getActiveTabId());
      new Notice('导入成功');
    } catch (error) {
      console.error('导入失败:', error);
      new Notice('JSON格式错误，导入失败');
    }
  }

  private handleCheckRedLine(): void {
    const result = checkRedLines(this.character);

    if (result.isValid) {
      new Notice('角色卡填写完整！');
    } else {
      const message = `缺少必填项: ${result.missingFields.join(', ')}`;
      new Notice(message);
    }

    if (result.warnings.length > 0) {
      console.log('红线警告:', result.warnings);
    }
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
