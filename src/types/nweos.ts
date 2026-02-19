export interface StandardInfo {
  version: string;
  schema: string;
  format: string;
}

export interface Metadata {
  character_id: string;
  character_name: string;
  work_name: string;
  novel_track: string;
  character_position: string;
  character_version: string;
  author: string;
  created_at: string;
  last_updated: string;
  notes?: string;
}

export interface CorePosition {
  core_tags: string[];
  track_adapt_tags: string[];
  core_shine_points: string[];
  core_angst_points: string[];
  reader_memory_points: string[];
  character_red_line: string[];
}

export interface IdentityNames {
  full_name: string;
  courtesy_name?: string;
  nickname: string[];
  code_name?: string;
  title?: string;
}

export interface IdentityBasicInfo {
  age?: number;
  age_perceived?: number;
  gender: string;
  birthday?: string;
  birthplace?: string;
  current_residence?: string;
}

export interface IdentitySystem {
  public_identity: string;
  hidden_identity?: string;
  camp: string;
  family_clan?: string;
  status_rank?: string;
}

export interface Identity {
  names: IdentityNames;
  basic_info: IdentityBasicInfo;
  identity_system: IdentitySystem;
}

export interface AppearanceBasicAppearance {
  face_shape?: string;
  skin?: string;
  eyes?: string;
  hair?: string;
  body_shape?: string;
  height_cm?: number;
  weight_kg?: number;
}

export interface AppearanceSceneStyle {
  daily?: string;
  formal?: string;
  fight_crisis?: string;
  emotional_out_of_control?: string;
}

export interface Appearance {
  basic_appearance: AppearanceBasicAppearance;
  iconic_features: string[];
  scene_style: AppearanceSceneStyle;
  appearance_plot_binding?: string;
}

export interface BasicAbility {
  name: string;
  proficiency: string;
  plot_purpose: string;
  priority: number;
}

export interface CoreSkill {
  name: string;
  description: string;
  strength: string;
  weakness: string;
  growth_line?: string;
  highlight_scene?: string;
}

export interface GoldFingerSystem {
  name: string;
  trigger_condition: string;
  limit_restriction: string;
  growth_rule?: string;
  core_usage: string;
}

export interface Abilities {
  basic_abilities: BasicAbility[];
  core_skills: CoreSkill[];
  gold_finger_system: GoldFingerSystem[];
  fatal_flaw: string[];
}

export interface ContrastDesign {
  trait: string;
  public_side: string;
  private_side: string;
}

export interface OceanModel {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface PersonalityModel {
  ocean: OceanModel;
  mbti?: string;
  temperament?: string;
}

export interface MoralPrinciple {
  alignment: string;
  core_values: string[];
  bottom_line: string[];
  conflict_handling: string;
}

export interface EmotionalProfile {
  base_mood: string;
  emotional_volatility: number;
  joy_triggers: string[];
  anger_triggers: string[];
  breakdown_triggers: string[];
  soft_triggers: string[];
}

export interface Psychology {
  core_personality: {
    public_persona: string;
    private_persona: string;
    core_traits: string[];
    contrast_design: ContrastDesign[];
  };
  personality_model: PersonalityModel;
  moral_principle: MoralPrinciple;
  emotional_profile: EmotionalProfile;
  psychological_trauma?: string;
  obsession?: string;
  personality_growth_line?: string;
  ooc_red_line: string[];
}

export interface SpeechStyle {
  formality_level: number;
  verbosity_level: number;
  vocabulary_habit: string;
  tone: string;
  catchphrases: string[];
  forbidden_words: string[];
  scene_speech_change?: Record<string, string>;
}

export interface ActionHabits {
  iconic_tics: string[];
  crisis_first_reaction: string;
  decision_making_style: string;
  interaction_habit?: string;
}

export interface BehaviorPattern {
  speech_style: SpeechStyle;
  action_habits: ActionHabits;
}

export interface KeyLifeEvent {
  year: string;
  event: string;
  impact_on_personality: string;
  plot_foreshadowing?: string;
}

export interface BackgroundHistory {
  origin_story?: string;
  education_experience?: string;
  career_experience?: string;
  hidden_secret?: string;
  family_background?: string;
  key_life_events: KeyLifeEvent[];
}

export interface Favorites {
  food?: string;
  color?: string;
  thing?: string;
  season?: string;
  scene?: string;
}

export interface PreferencesLifestyle {
  hobbies: string[];
  favorites: Favorites;
  aversions: string[];
  preference_plot_binding?: string;
  lifestyle_habit?: string;
}

export interface Goals {
  short_term: string[];
  medium_term: string[];
  long_term_ultimate: string;
}

export interface CharacterArcPath {
  opening_state: string;
  growth_nodes: string[];
  highlight_moment: string;
  final_state: string;
  character_transformation: string;
}

export interface MotivationArc {
  core_drive: string;
  goals: Goals;
  core_fears: {
    rational: string[];
    irrational: string[];
  };
  character_arc_path: CharacterArcPath;
}

export interface PlotBinding {
  debut_chapter_node: string;
  core_highlight_nodes: string[];
  personality_transformation_nodes: string[];
  foreshadowing_recycle_nodes: string[];
  main_line_binding?: string;
  ending_setting?: string;
  extra_content?: string;
}

export interface IconicSceneNode {
  chapter?: string;
  description: string;
}

export interface CoreRelationship {
  character_name: string;
  relationship_position: string;
  core_bond: string;
  relationship_development_line: string;
  core_conflict?: string;
  iconic_scene_nodes: IconicSceneNode[];
}

export interface SecondaryRelationship {
  character_name: string;
  relationship_position: string;
  core_bond: string;
}

export interface HostileRelationship {
  character_name: string;
  relationship_position: string;
  reason: string;
}

export interface NeutralAcquaintance {
  character_name: string;
  relationship_position: string;
  note?: string;
}

export interface RelationshipNetwork {
  core_relationships: CoreRelationship[];
  secondary_relationships: SecondaryRelationship[];
  hostile_relationships: HostileRelationship[];
  neutral_acquaintances: NeutralAcquaintance[];
}

export interface XuanhuanXianxia {
  cultivation_level?: string;
  spirit_root_martial_soul?: string;
  cultivation_method_magic_treasure?: string;
  sect?: string;
  lifespan?: string;
}

export interface GuyanGongdou {
  dynasty_year?: string;
  noble_title?: string;
  family_power?: string;
  mansion_palace?: string;
  court_camp?: string;
}

export interface XianyanDushi {
  career_position?: string;
  company_industry?: string;
  assets?: string;
  social_resources?: string;
}

export interface KehuanMoshi {
  ability_level?: string;
  cybernetic_reform?: string;
  camp_base?: string;
  survival_ability?: string;
}

export interface XuanyiXingzhen {
  identity_authority?: string;
  case_solving_ability?: string;
  core_secret?: string;
  psychological_profile?: string;
}

export interface TrackExtension {
  xuanhuan_xianxia?: XuanhuanXianxia;
  guyan_gongdou?: GuyanGongdou;
  xianyan_dushi?: XianyanDushi;
  kehuan_moshi?: KehuanMoshi;
  xuanyi_xingzhen?: XuanyiXingzhen;
}

export interface NWEOSCharacter {
  standard: StandardInfo;
  metadata: Metadata;
  core_position: CorePosition;
  identity: Identity;
  appearance: Appearance;
  abilities: Abilities;
  psychology: Psychology;
  behavior_pattern: BehaviorPattern;
  background_history: BackgroundHistory;
  preferences_lifestyle: PreferencesLifestyle;
  motivation_arc: MotivationArc;
  plot_binding: PlotBinding;
  relationship_network: RelationshipNetwork;
  track_extension: TrackExtension;
}
