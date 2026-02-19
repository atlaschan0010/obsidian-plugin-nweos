import { App, Notice, TFile } from 'obsidian';
import { NWEOSCharacter } from '../types/nweos';
import { CharacterStore } from '../storage/CharacterStore';
import { generateId, getCurrentTimestamp } from '../utils/helpers';

export interface NWEOSCommands {
	openSidebar: () => Promise<void>;
	createNewCharacter: () => Promise<void>;
	importCharacter: () => Promise<void>;
	exportCharacter: (character: NWEOSCharacter) => void;
}

export function createCommands(app: App, characterStore: CharacterStore): NWEOSCommands {
	return {
		openSidebar: async () => {
			const leaves = app.workspace.getLeavesOfType('nweos-sidebar');
			if (leaves.length > 0) {
				app.workspace.revealLeaf(leaves[0]);
				return;
			}

			const leaf = app.workspace.getLeaf(true);
			if (leaf) {
				await leaf.setViewState({
					type: 'nweos-sidebar',
					active: true
				});
			}
		},

		createNewCharacter: async () => {
			await createCommands(app, characterStore).openSidebar();
			
			setTimeout(() => {
				const leaves = app.workspace.getLeavesOfType('nweos-sidebar');
				if (leaves.length > 0) {
					const view = leaves[0].view;
					if ('createNewCharacter' in view) {
						(view as any).createNewCharacter();
					}
				}
			}, 100);
		},

		importCharacter: async () => {
			const activeFile = app.workspace.getActiveFile();
			if (!activeFile || activeFile.extension !== 'json') {
				new Notice('请先打开一个JSON文件');
				return;
			}

			try {
				const content = await app.vault.read(activeFile);
				const character = JSON.parse(content) as NWEOSCharacter;

				if (!character.standard || character.standard.schema !== 'nweos') {
					new Notice('无效的NWEOS角色卡格式');
					return;
				}

				character.metadata.character_id = generateId();
				character.metadata.created_at = getCurrentTimestamp();
				character.metadata.last_updated = getCurrentTimestamp();

				await characterStore.saveCharacter(character);
				new Notice(`角色 "${character.metadata.character_name}" 导入成功`);
			} catch (error) {
				console.error('导入角色失败:', error);
				new Notice('导入角色失败，请检查JSON格式');
			}
		},

		exportCharacter: (character: NWEOSCharacter) => {
			const jsonString = JSON.stringify(character, null, 2);
			const blob = new Blob([jsonString], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${character.metadata.character_name || 'character'}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			new Notice('角色卡已导出');
		}
	};
}

export function createEmptyCharacter(): NWEOSCharacter {
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
			work_name: '',
			novel_track: '',
			character_position: '',
			character_version: '1.0',
			author: '',
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
