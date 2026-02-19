# 基于AIEOS v1.1.0 网文人物设计专属改造方案
## 一、改造总纲
### 规范命名
**NWEOS (Novel Writing Entity Object Specification) v1.0**，全称「网文实体对象规范」，100%兼容AIEOS v1.1.0的核心分层逻辑，针对网络小说创作的核心痛点做定向改造与扩展。

### 核心定位转变
从「AI Agent跨平台可移植身份标准」→「网络小说人物全生命周期标准化设计规范」，核心目标从「保障AI行为一致性」升级为**「锁死人物核心人设、杜绝写崩OOC、深度绑定剧情主线、强化人物弧光与读者共情」**，完全服务于网文从大纲、正文到番外的全创作流程。

### 核心改造原则
1.  **人设防崩优先**：所有字段设计围绕「固定核心锚点、明确人设红线」，解决网文创作最核心的人设跑偏问题；
2.  **全剧情周期适配**：从人物出场、成长、高光到结局，覆盖完整人物弧光，拒绝静态孤立的人设卡；
3.  **全赛道兼容**：预留通用扩展位，适配现言/古言/玄幻/都市/科幻/悬疑等全品类网文；
4.  **轻量化与专业性平衡**：拆分「核心必填层」和「扩展可选层」，新人作者可快速上手，资深作者可做百万字长篇的全维度人物管理；
5.  **阅读体验导向**：新增网文专属的爽点、虐点、读者记忆点设计，让人物直接服务于网文核心阅读需求。

---

## 二、模块级改造方案（对应原AIEOS框架）
保留原AIEOS「从基础身份→外在形象→内在能力→灵魂内核→行为动因」的底层逻辑，剔除纯技术类字段，对原生模块做网文定向改造，同时新增网文创作核心刚需模块。

| 原AIEOS v1.1.0模块 | 改造后NWEOS模块 | 核心改造动作 |
|---------------------|------------------|--------------|
| Root & Metadata（根与元数据） | 核心元数据 | 剔除语义网、UUID等AI技术字段，替换为网文创作专属的元数据，用于人物版本管理与作品适配 |
| 无（原生缺失） | 人物核心定位 | 【新增核心模块】锚定人物在作品中的核心价值，明确人设标签、爽点/虐点、人设红线，从根源防止写偏 |
| Identity（身份） | 基础身份档案 | 保留基础身份字段，新增网文专属的「表里身份」「阵营势力」「位份/封号」等强剧情相关字段 |
| Physicality（物理形象） | 外在形象设定 | 剔除AI图像生成相关字段，改造为服务于写作的「标志性记忆点」「场景化形象变化」「形象与剧情绑定」字段 |
| Capabilities（能力） | 能力与金手指体系 | 【核心改造】从AI技能列表升级为网文专属的能力体系，覆盖基础能力、核心技能、金手指/异能/修为、能力短板与成长线 |
| Psychology（心理灵魂层） | 灵魂人设与心理画像 | 【灵魂核心模块】保留基础人格模型，新增网文核心的「人前/人后反差」「人设成长线」「情绪触发点」「人设崩塌红线」 |
| Linguistics（语言体系） | 语言与行为模式 | 剔除TTS、声学等AI语音字段，改造为写作专用的「说话风格」「标志性小动作」「场景化行为逻辑」 |
| History（历史履历） | 过往经历与背景伏笔 | 从静态履历升级为「前史+剧情伏笔」绑定的结构，每个关键事件明确对人设、剧情的影响 |
| Interests & Lifestyle（兴趣生活） | 喜恶偏好与生活细节 | 保留基础字段，新增「喜恶与剧情的关联」，让细节服务于人物塑造与伏笔设计 |
| Motivations（动机） | 核心动机与人物弧光 | 【剧情核心模块】从静态目标升级为完整的人物弧光路径，明确底层驱动力、目标层级、核心恐惧与完整成长轨迹 |
| 无（原生缺失） | 剧情绑定与关键节点 | 【新增核心模块】完全绑定人物与主线剧情，明确出场、高光、转变、结局等全流程节点，杜绝人物与剧情脱节 |
| 无（原生缺失） | 人物关系网络 | 【新增核心模块】从单薄的家庭信息升级为完整的网文关系网，覆盖核心羁绊、敌对关系、关系发展线与名场面节点 |
| 无（原生缺失） | 赛道专属扩展字段 | 【新增适配模块】为不同网文品类预留专属扩展位，一套规范适配全赛道 |

---

## 三、NWEOS v1.0 完整标准化JSON模板
```json
{
  "standard": {
    "protocol": "NWEOS",
    "version": "1.0",
    "base_standard": "AIEOS v1.1.0",
    "description": "基于AIEOS改造的网络小说人物设计标准化规范"
  },
  "metadata": {
    "@description": "人物核心元数据，用于版本管理与作品定位",
    "character_id": "",
    "character_name": "",
    "work_name": "",
    "novel_track": "",
    "character_position": "",
    "character_version": "1.0",
    "author": "",
    "created_at": "",
    "last_updated": "",
    "notes": ""
  },
  "core_position": {
    "@description": "人物核心定位，网文创作的锚点，防止人设跑偏",
    "core_tags": [],
    "track_adapt_tags": [],
    "core_shine_points": [],
    "core_angst_points": [],
    "reader_memory_points": [],
    "character_red_line": []
  },
  "identity": {
    "@description": "基础身份档案，人物的核心身份锚点",
    "names": {
      "full_name": "",
      "courtesy_name": "",
      "nickname": [],
      "code_name": "",
      "title": ""
    },
    "basic_info": {
      "age": 0,
      "age_perceived": 0,
      "gender": "",
      "birthday": "",
      "birthplace": "",
      "current_residence": ""
    },
    "identity_system": {
      "public_identity": "",
      "hidden_identity": "",
      "camp": "",
      "family_clan": "",
      "status_rank": ""
    }
  },
  "appearance": {
    "@description": "外在形象设定，服务于写作与剧情，强化读者记忆点",
    "basic_appearance": {
      "face_shape": "",
      "skin": "",
      "eyes": "",
      "hair": "",
      "body_shape": "",
      "height_cm": 0,
      "weight_kg": 0
    },
    "iconic_features": [],
    "scene_style": {
      "daily": "",
      "formal": "",
      "fight_crisis": "",
      "emotional_out_of_control": ""
    },
    "appearance_plot_binding": ""
  },
  "abilities": {
    "@description": "能力与金手指体系，网文核心爽点载体",
    "basic_abilities": [
      {
        "name": "",
        "proficiency": "",
        "plot_purpose": "",
        "priority": 1
      }
    ],
    "core_skills": [
      {
        "name": "",
        "description": "",
        "strength": "",
        "weakness": "",
        "growth_line": "",
        "highlight_scene": ""
      }
    ],
    "gold_finger_system": {
      "name": "",
      "trigger_condition": "",
      "limit_restriction": "",
      "growth_rule": "",
      "core_usage": ""
    },
    "fatal_flaw": []
  },
  "psychology": {
    "@description": "灵魂人设层，锁死人物核心性格，杜绝OOC",
    "core_personality": {
      "public_persona": "",
      "private_persona": "",
      "core_traits": [],
      "contrast_design": []
    },
    "personality_model": {
      "ocean": {
        "openness": 0,
        "conscientiousness": 0,
        "extraversion": 0,
        "agreeableness": 0,
        "neuroticism": 0
      },
      "mbti": "",
      "temperament": ""
    },
    "moral_principle": {
      "alignment": "",
      "core_values": [],
      "bottom_line": [],
      "conflict_handling": ""
    },
    "emotional_profile": {
      "base_mood": "",
      "emotional_volatility": 0,
      "joy_triggers": [],
      "anger_triggers": [],
      "breakdown_triggers": [],
      "soft_triggers": []
    },
    "psychological_trauma": "",
    "obsession": "",
    "personality_growth_line": "",
    "ooc_red_line": []
  },
  "behavior_pattern": {
    "@description": "语言与行为模式，让人物落地可感，说话做事不跑偏",
    "speech_style": {
      "formality_level": 0,
      "verbosity_level": 0,
      "vocabulary_habit": "",
      "tone": "",
      "catchphrases": [],
      "forbidden_words": [],
      "scene_speech_change": ""
    },
    "action_habits": {
      "iconic_tics": [],
      "crisis_first_reaction": "",
      "decision_making_style": "",
      "interaction_habit": ""
    }
  },
  "background_history": {
    "@description": "过往经历与背景伏笔，人设的根源，剧情的伏笔库",
    "origin_story": "",
    "key_life_events": [
      {
        "year": 0,
        "event": "",
        "impact_on_personality": "",
        "plot_foreshadowing": ""
      }
    ],
    "education_experience": "",
    "career_experience": "",
    "hidden_secret": "",
    "family_background": ""
  },
  "preferences_lifestyle": {
    "@description": "喜恶偏好与生活细节，让人物更鲜活，服务于剧情伏笔",
    "hobbies": [],
    "favorites": {
      "food": "",
      "color": "",
      "thing": "",
      "season": "",
      "scene": ""
    },
    "aversions": [],
    "preference_plot_binding": "",
    "lifestyle_habit": ""
  },
  "motivation_arc": {
    "@description": "核心动机与人物弧光，人物行为的底层逻辑，剧情的核心驱动力",
    "core_drive": "",
    "goals": {
      "short_term": [],
      "medium_term": [],
      "long_term_ultimate": ""
    },
    "core_fears": {
      "rational": [],
      "irrational": []
    },
    "character_arc_path": {
      "opening_state": "",
      "growth_nodes": [],
      "highlight_moment": "",
      "final_state": "",
      "character_transformation": ""
    }
  },
  "plot_binding": {
    "@description": "剧情绑定与关键节点，让人物完全服务于主线，杜绝脱节",
    "debut_chapter_node": "",
    "core_highlight_nodes": [],
    "personality_transformation_nodes": [],
    "foreshadowing_recycle_nodes": [],
    "main_line_binding": "",
    "ending_setting": "",
    "extra_content": ""
  },
  "relationship_network": {
    "@description": "人物关系网络，网文剧情推进的核心载体",
    "core_relationships": [
      {
        "character_name": "",
        "relationship_position": "",
        "core_bond": "",
        "relationship_development_line": "",
        "core_conflict": "",
        "iconic_scene_nodes": []
      }
    ],
    "secondary_relationships": [],
    "hostile_relationships": [],
    "neutral_acquaintances": []
  },
  "track_extension": {
    "@description": "赛道专属扩展字段，按需填写，全品类适配",
    "xuanhuan_xianxia": {
      "cultivation_level": "",
      "spirit_root_martial_soul": "",
      "cultivation_method_magic_treasure": "",
      "sect": "",
      "lifespan": ""
    },
    "guyan_gongdou": {
      "dynasty_year": "",
      "noble_title": "",
      "family_power": "",
      "mansion_palace": "",
      "court_camp": ""
    },
    "xianyan_dushi": {
      "career_position": "",
      "company_industry": "",
      "assets": "",
      "social_resources": ""
    },
    "kehuan_moshi": {
      "ability_level": "",
      "cybernetic_reform": "",
      "camp_base": "",
      "survival_ability": ""
    },
    "xuanyi_xingzhen": {
      "identity_authority": "",
      "case_solving_ability": "",
      "core_secret": "",
      "psychological_profile": ""
    }
  }
}
```

---

## 四、不同网文赛道的适配规则
1.  **短篇/新媒体文**：仅需填写「核心元数据、人物核心定位、基础身份、灵魂人设、核心动机、剧情绑定」6个核心模块，轻量化快速锁定人设，适配快节奏剧情；
2.  **长篇男频/女频文**：填写全量模块，通过「人物弧光、能力成长线、关系网、剧情节点」实现百万字篇幅的人设一致性管理；
3.  **群像文**：为每个角色建立独立的NWEOS文件，通过「relationship_network」模块实现人物关系的联动管理，避免群像人物扁平化、同质化；
4.  **同人二创文**：基于原作人物设定，填充NWEOS模块，明确二创人设红线与扩展边界，避免OOC。

---

## 五、落地使用核心建议
1.  **先填锚点，再补细节**：优先完成「人物核心定位、灵魂人设、核心动机」3个锚点模块，锁死人物核心，再补充其他细节，从根源避免人设跑偏；
2.  **人设红线必须明确**：`character_red_line`和`ooc_red_line`字段必须填写，明确人物绝对不会做的事、绝对不会违背的原则，是防止写崩的核心；
3.  **所有设定必须服务于剧情**：避免无意义的细节堆砌，每个字段的内容都要对应「人设塑造、剧情伏笔、爽点/虐点设计」三者之一；
4.  **版本化管理**：人物设定调整时，更新`character_version`版本号，保留历史版本，避免剧情前后矛盾；
5.  **适配AI辅助写作**：该JSON结构可直接投喂给AI写作工具，精准控制人物言行，彻底解决AI写文OOC的问题。