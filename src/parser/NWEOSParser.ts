import { NWEOSCharacter, Metadata, StandardInfo, CorePosition, Identity, Appearance, Abilities, Psychology, BehaviorPattern, BackgroundHistory, PreferencesLifestyle, MotivationArc, PlotBinding, RelationshipNetwork, TrackExtension } from '../types/nweos';

export class NWEOSParser {
  createEmptyCharacter(characterId: string, characterName: string, author: string): NWEOSCharacter {
    const timestamp = new Date().toISOString();

    return {
      standard: {
        version: '1.0',
        schema: 'nweos-v1',
        format: 'json'
      },
      metadata: {
        character_id: characterId,
        character_name: characterName,
        work_name: '',
        novel_track: '',
        character_position: '',
        character_version: '1.0',
        author: author,
        created_at: timestamp,
        last_updated: timestamp,
        notes: ''
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
          courtesy_name: undefined,
          nickname: [],
          code_name: undefined,
          title: undefined
        },
        basic_info: {
          age: undefined,
          age_perceived: undefined,
          gender: '',
          birthday: undefined,
          birthplace: undefined,
          current_residence: undefined
        },
        identity_system: {
          public_identity: '',
          hidden_identity: undefined,
          camp: '',
          family_clan: undefined,
          status_rank: undefined
        }
      },
      appearance: {
        basic_appearance: {
          face_shape: undefined,
          skin: undefined,
          eyes: undefined,
          hair: undefined,
          body_shape: undefined,
          height_cm: undefined,
          weight_kg: undefined
        },
        iconic_features: [],
        scene_style: {
          daily: undefined,
          formal: undefined,
          fight_crisis: undefined,
          emotional_out_of_control: undefined
        },
        appearance_plot_binding: undefined
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
          mbti: undefined,
          temperament: undefined
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
        psychological_trauma: undefined,
        obsession: undefined,
        personality_growth_line: undefined,
        ooc_red_line: []
      },
      behavior_pattern: {
        speech_style: {
          formality_level: 5,
          verbosity_level: 5,
          vocabulary_habit: '',
          tone: '',
          catchphrases: [],
          forbidden_words: [],
          scene_speech_change: undefined
        },
        action_habits: {
          iconic_tics: [],
          crisis_first_reaction: '',
          decision_making_style: '',
          interaction_habit: undefined
        }
      },
      background_history: {
        origin_story: undefined,
        education_experience: undefined,
        career_experience: undefined,
        hidden_secret: undefined,
        family_background: undefined,
        key_life_events: []
      },
      preferences_lifestyle: {
        hobbies: [],
        favorites: {
          food: undefined,
          color: undefined,
          thing: undefined,
          season: undefined,
          scene: undefined
        },
        aversions: [],
        preference_plot_binding: undefined,
        lifestyle_habit: undefined
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
        main_line_binding: undefined,
        ending_setting: undefined,
        extra_content: undefined
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

  parseCharacter(jsonString: string): NWEOSCharacter | null {
    try {
      const parsed = JSON.parse(jsonString);
      if (this.validateCharacter(parsed)) {
        return parsed as NWEOSCharacter;
      }
      return null;
    } catch (error) {
      console.error('Failed to parse character JSON:', error);
      return null;
    }
  }

  stringifyCharacter(character: NWEOSCharacter): string {
    return JSON.stringify(character, null, 2);
  }

  validateCharacter(character: unknown): character is NWEOSCharacter {
    if (!character || typeof character !== 'object') {
      return false;
    }

    const c = character as Record<string, unknown>;

    if (!c.standard || !c.metadata || !c.core_position || !c.identity ||
        !c.appearance || !c.abilities || !c.psychology || !c.behavior_pattern ||
        !c.background_history || !c.preferences_lifestyle || !c.motivation_arc ||
        !c.plot_binding || !c.relationship_network || !c.track_extension) {
      return false;
    }

    const standard = c.standard as Record<string, unknown>;
    if (typeof standard.version !== 'string' || typeof standard.schema !== 'string') {
      return false;
    }

    const metadata = c.metadata as Record<string, unknown>;
    if (typeof metadata.character_id !== 'string' || typeof metadata.character_name !== 'string') {
      return false;
    }

    return true;
  }

  exportToMarkdown(character: NWEOSCharacter): string {
    const { metadata, identity, appearance, abilities, psychology, behavior_pattern, background_history, motivation_arc, relationship_network } = character;

    let md = `# ${metadata.character_name}\n\n`;
    md += `**作品**: ${metadata.work_name || '未设置'} | **作者**: ${metadata.author}\n`;
    md += `**创建时间**: ${metadata.created_at} | **最后更新**: ${metadata.last_updated}\n\n`;

    md += `## 身份信息\n\n`;
    md += `- **全名**: ${identity.names.full_name || '未设置'}\n`;
    if (identity.names.nickname.length > 0) {
      md += `- **昵称**: ${identity.names.nickname.join(', ')}\n`;
    }
    md += `- **性别**: ${identity.basic_info.gender || '未设置'}\n`;
    if (identity.basic_info.age) {
      md += `- **年龄**: ${identity.basic_info.age}\n`;
    }
    md += `- **公开身份**: ${identity.identity_system.public_identity || '未设置'}\n`;
    md += `- **阵营**: ${identity.identity_system.camp || '未设置'}\n\n`;

    md += `## 外观特征\n\n`;
    const basic = appearance.basic_appearance;
    if (basic.face_shape) md += `- **面容**: ${basic.face_shape}\n`;
    if (basic.eyes) md += `- **眼睛**: ${basic.eyes}\n`;
    if (basic.hair) md += `- **头发**: ${basic.hair}\n`;
    if (basic.height_cm) md += `- **身高**: ${basic.height_cm}cm\n`;
    if (basic.weight_kg) md += `- **体重**: ${basic.weight_kg}kg\n`;
    if (appearance.iconic_features.length > 0) {
      md += `- **标志性特征**: ${appearance.iconic_features.join(', ')}\n`;
    }
    md += '\n';

    md += `## 能力设定\n\n`;
    if (abilities.core_skills.length > 0) {
      md += `### 核心技能\n`;
      abilities.core_skills.forEach(skill => {
        md += `- **${skill.name}**: ${skill.description}\n`;
      });
    }
    if (abilities.fatal_flaw.length > 0) {
      md += `\n### 致命缺陷\n`;
      md += abilities.fatal_flaw.map(f => `- ${f}`).join('\n');
    }
    md += '\n';

    md += `## 性格心理\n\n`;
    md += `### 公开人格\n${psychology.core_personality.public_persona || '未设置'}\n\n`;
    md += `### 私下人格\n${psychology.core_personality.private_persona || '未设置'}\n\n`;
    if (psychology.core_personality.core_traits.length > 0) {
      md += `### 核心特质\n${psychology.core_personality.core_traits.join(', ')}\n\n`;
    }

    md += `## 行为模式\n\n`;
    md += `### 言语风格\n- **正式程度**: ${behavior_pattern.speech_style.formality_level}/10\n`;
    md += `- **语气**: ${behavior_pattern.speech_style.tone || '未设置'}\n`;
    if (behavior_pattern.speech_style.catchphrases.length > 0) {
      md += `- **口头禅**: ${behavior_pattern.speech_style.catchphrases.join(', ')}\n`;
    }
    md += `\n### 行为习惯\n`;
    if (behavior_pattern.action_habits.iconic_tics.length > 0) {
      md += `- **标志性习惯**: ${behavior_pattern.action_habits.iconic_tics.join(', ')}\n`;
    }
    md += `- **危机反应**: ${behavior_pattern.action_habits.crisis_first_reaction || '未设置'}\n`;
    md += `- **决策风格**: ${behavior_pattern.action_habits.decision_making_style || '未设置'}\n`;
    md += '\n';

    if (background_history.origin_story) {
      md += `## 背景故事\n\n${background_history.origin_story}\n\n`;
    }

    if (background_history.key_life_events.length > 0) {
      md += `### 关键人生事件\n`;
      background_history.key_life_events.forEach(event => {
        md += `- **${event.year}**: ${event.event}\n`;
      });
      md += '\n';
    }

    md += `## 动机弧光\n\n`;
    md += `### 核心驱动力\n${motivation_arc.core_drive || '未设置'}\n\n`;
    md += `### 终极目标\n${motivation_arc.goals.long_term_ultimate || '未设置'}\n\n`;
    md += `### 角色成长线\n`;
    md += `- **初始状态**: ${motivation_arc.character_arc_path.opening_state || '未设置'}\n`;
    md += `- **最终状态**: ${motivation_arc.character_arc_path.final_state || '未设置'}\n`;
    md += '\n';

    if (relationship_network.core_relationships.length > 0) {
      md += `## 核心关系\n\n`;
      relationship_network.core_relationships.forEach(rel => {
        md += `- **${rel.character_name}** (${rel.relationship_position}): ${rel.core_bond}\n`;
      });
      md += '\n';
    }

    if (metadata.notes) {
      md += `## 备注\n\n${metadata.notes}\n`;
    }

    return md;
  }
}
