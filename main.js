"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => NWEOSPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// src/storage/CharacterStore.ts
var import_obsidian = require("obsidian");
var CharacterStore = class {
  constructor(app, charactersPath = "characters") {
    this.app = app;
    this.charactersPath = charactersPath;
  }
  /**
   * Generate a safe filename from character metadata.
   * Format: "角色名_作品名.json" or "角色名.json" if no work name.
   */
  getFileName(character) {
    const name = character.metadata.character_name || character.metadata.character_id;
    const workName = character.metadata.work_name;
    const sanitize = (s) => s.replace(/[\\/:*?"<>|]/g, "_").trim();
    const safeName = sanitize(name);
    const safeWork = workName ? sanitize(workName) : "";
    const baseName = safeWork ? `${safeName}_${safeWork}` : safeName;
    return `${baseName}.json`;
  }
  async ensureCharactersFolder() {
    const folder = this.app.vault.getFolderByPath(this.charactersPath);
    if (folder) {
      return folder;
    }
    return await this.app.vault.createFolder(this.charactersPath);
  }
  async loadCharacters() {
    const characters = [];
    const folder = this.app.vault.getFolderByPath(this.charactersPath);
    if (!folder) {
      return characters;
    }
    const processFolder = async (tf) => {
      for (const child of tf.children) {
        if (child instanceof import_obsidian.TFile && child.extension === "json") {
          try {
            const content = await this.app.vault.read(child);
            const character = JSON.parse(content);
            characters.push(character);
          } catch (error) {
            console.error(`Failed to load character from ${child.path}:`, error);
          }
        }
      }
    };
    await processFolder(folder);
    return characters;
  }
  async saveCharacter(character) {
    await this.ensureCharactersFolder();
    const fileName = this.getFileName(character);
    const filePath = `${this.charactersPath}/${fileName}`;
    await this.removeOldFile(character.metadata.character_id, filePath);
    const jsonString = JSON.stringify(character, null, 2);
    const file = this.app.vault.getFileByPath(filePath);
    if (file) {
      await this.app.vault.modify(file, jsonString);
    } else {
      await this.app.vault.create(filePath, jsonString);
    }
  }
  /**
   * Remove old file if character was renamed or migrating from ID-based filename.
   */
  async removeOldFile(characterId, newFilePath) {
    const folder = this.app.vault.getFolderByPath(this.charactersPath);
    if (!folder) return;
    for (const child of folder.children) {
      if (child instanceof import_obsidian.TFile && child.extension === "json" && child.path !== newFilePath) {
        try {
          const content = await this.app.vault.read(child);
          const data = JSON.parse(content);
          if (data?.metadata?.character_id === characterId) {
            await this.app.vault.delete(child);
            break;
          }
        } catch (e) {
        }
      }
    }
  }
  async deleteCharacter(id) {
    const folder = this.app.vault.getFolderByPath(this.charactersPath);
    if (!folder) return;
    for (const child of folder.children) {
      if (child instanceof import_obsidian.TFile && child.extension === "json") {
        try {
          const content = await this.app.vault.read(child);
          const data = JSON.parse(content);
          if (data?.metadata?.character_id === id) {
            await this.app.vault.delete(child);
            return;
          }
        } catch (e) {
        }
      }
    }
  }
  async getCharacter(id) {
    const folder = this.app.vault.getFolderByPath(this.charactersPath);
    if (!folder) return null;
    for (const child of folder.children) {
      if (child instanceof import_obsidian.TFile && child.extension === "json") {
        try {
          const content = await this.app.vault.read(child);
          const data = JSON.parse(content);
          if (data.metadata.character_id === id) {
            return data;
          }
        } catch (e) {
        }
      }
    }
    return null;
  }
};

// src/ui/SidebarView.ts
var import_obsidian3 = require("obsidian");

// src/utils/helpers.ts
function generateId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${randomPart}`;
}
function formatDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getCurrentTimestamp() {
  return (/* @__PURE__ */ new Date()).toISOString();
}

// src/ui/CharacterListItem.ts
var CharacterListItem = class {
  constructor(container, options) {
    this.container = container;
    this.character = options.character;
    this.options = options;
    this.render();
  }
  getMetadata() {
    return this.character.metadata;
  }
  getInitials(name) {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  }
  render() {
    const metadata = this.getMetadata();
    const trackTags = this.character.core_position?.track_adapt_tags || [];
    const itemEl = this.container.createDiv("nweos-character-item");
    itemEl.setAttribute("data-character-id", metadata.character_id);
    const avatarEl = itemEl.createDiv("nweos-character-avatar");
    avatarEl.textContent = this.getInitials(metadata.character_name);
    const infoEl = itemEl.createDiv("nweos-character-info");
    const headerEl = infoEl.createDiv("nweos-character-header");
    headerEl.createDiv("nweos-character-name").textContent = metadata.character_name;
    headerEl.createDiv("nweos-character-position").textContent = metadata.character_position || "\u672A\u8BBE\u7F6E\u5B9A\u4F4D";
    const tagsEl = infoEl.createDiv("nweos-character-tags");
    trackTags.slice(0, 3).forEach((tag) => {
      const tagEl = tagsEl.createSpan("nweos-track-tag");
      tagEl.textContent = tag;
    });
    const metaEl = infoEl.createDiv("nwe-character-meta");
    const updateEl = metaEl.createSpan("nweos-update-time");
    updateEl.textContent = `\u66F4\u65B0\u4E8E ${formatDate(metadata.last_updated)}`;
    itemEl.addEventListener("click", () => {
      this.options.onClick(this.character);
    });
    itemEl.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.showContextMenu(e);
    });
  }
  showContextMenu(e) {
    const existingMenu = document.querySelector(".nweos-context-menu");
    if (existingMenu) {
      existingMenu.remove();
    }
    const menuEl = document.createElement("div");
    menuEl.className = "nweos-context-menu";
    const editItem = menuEl.createDiv("nweos-context-menu-item");
    editItem.textContent = "\u7F16\u8F91";
    editItem.addEventListener("click", () => {
      this.options.onEdit(this.character);
      menuEl.remove();
    });
    const deleteItem = menuEl.createDiv("nweos-context-menu-item");
    deleteItem.textContent = "\u5220\u9664";
    deleteItem.addEventListener("click", () => {
      this.options.onDelete(this.character);
      menuEl.remove();
    });
    const copyItem = menuEl.createDiv("nweos-context-menu-item");
    copyItem.textContent = "\u590D\u5236JSON";
    copyItem.addEventListener("click", () => {
      this.options.onCopyJson(this.character);
      menuEl.remove();
    });
    menuEl.style.left = `${e.clientX}px`;
    menuEl.style.top = `${e.clientY}px`;
    document.body.appendChild(menuEl);
    const closeMenu = (evt) => {
      if (!menuEl.contains(evt.target)) {
        menuEl.remove();
        document.removeEventListener("click", closeMenu);
      }
    };
    setTimeout(() => document.addEventListener("click", closeMenu), 0);
  }
};

// src/ui/EditorModal.ts
var import_obsidian2 = require("obsidian");

// src/ui/TabContainer.ts
var TAB_CONFIG = [
  { id: "metadata", label: "\u6838\u5FC3\u5143\u6570\u636E", icon: "\u{1F4CB}" },
  { id: "core-position", label: "\u4EBA\u7269\u6838\u5FC3\u5B9A\u4F4D", icon: "\u{1F3AF}" },
  { id: "identity", label: "\u57FA\u7840\u8EAB\u4EFD", icon: "\u{1F464}" },
  { id: "appearance", label: "\u5916\u5728\u5F62\u8C61", icon: "\u{1F3A8}" },
  { id: "abilities", label: "\u80FD\u529B\u4F53\u7CFB", icon: "\u26A1" },
  { id: "psychology", label: "\u7075\u9B42\u4EBA\u8BBE", icon: "\u{1F9E0}" },
  { id: "behavior", label: "\u8BED\u8A00\u884C\u4E3A", icon: "\u{1F4AC}" },
  { id: "background", label: "\u8FC7\u5F80\u7ECF\u5386", icon: "\u{1F4DC}" },
  { id: "preferences", label: "\u559C\u6076\u504F\u597D", icon: "\u2764\uFE0F" },
  { id: "motivation", label: "\u52A8\u673A\u5F27\u5149", icon: "\u{1F525}" },
  { id: "plot-binding", label: "\u5267\u60C5\u7ED1\u5B9A", icon: "\u{1F4D6}" },
  { id: "relationships", label: "\u5173\u7CFB\u7F51\u7EDC", icon: "\u{1F517}" },
  { id: "track-extension", label: "\u8D5B\u9053\u6269\u5C55", icon: "\u{1F3C1}" }
];
var TabContainer = class {
  constructor(container, onTabChange) {
    this.activeTabId = TAB_CONFIG[0].id;
    this.container = container;
    this.onTabChange = onTabChange;
    this.tabsEl = container.createDiv("nweos-tabs");
    this.contentContainer = container.createDiv("nweos-tab-content");
    this.render();
  }
  render() {
    TAB_CONFIG.forEach((tab) => {
      const tabEl = this.tabsEl.createDiv("nweos-tab-item");
      tabEl.setAttribute("data-tab-id", tab.id);
      const iconEl = tabEl.createSpan("nweos-tab-icon");
      iconEl.textContent = tab.icon;
      const labelEl = tabEl.createSpan("nweos-tab-label");
      labelEl.textContent = tab.label;
      if (tab.id === this.activeTabId) {
        tabEl.addClass("active");
      }
      tabEl.addEventListener("click", () => {
        this.setActiveTab(tab.id);
      });
    });
  }
  setActiveTab(tabId) {
    const prevActive = this.tabsEl.querySelector(".active");
    if (prevActive) {
      prevActive.removeClass("active");
    }
    const newActive = this.tabsEl.querySelector(`[data-tab-id="${tabId}"]`);
    if (newActive) {
      newActive.addClass("active");
    }
    this.activeTabId = tabId;
    this.onTabChange(tabId);
  }
  getActiveTabId() {
    return this.activeTabId;
  }
  getContentContainer() {
    return this.contentContainer;
  }
  clearContent() {
    this.contentContainer.empty();
  }
};

// src/redline/index.ts
function checkRedLines(character) {
  const missingFields = [];
  const warnings = [];
  if (!character.metadata.character_name || character.metadata.character_name.trim() === "") {
    missingFields.push("\u89D2\u8272\u540D\u79F0");
  }
  if (!character.metadata.work_name || character.metadata.work_name.trim() === "") {
    missingFields.push("\u4F5C\u54C1\u540D\u79F0");
  }
  if (!character.core_position.core_tags || character.core_position.core_tags.length === 0) {
    missingFields.push("\u6838\u5FC3\u6807\u7B7E");
  }
  if (!character.identity.names.full_name || character.identity.names.full_name.trim() === "") {
    missingFields.push("\u59D3\u540D");
  }
  if (!character.psychology.core_personality.public_persona || character.psychology.core_personality.public_persona.trim() === "") {
    missingFields.push("\u516C\u5F00\u4EBA\u8BBE");
  }
  if (!character.motivation_arc.core_drive || character.motivation_arc.core_drive.trim() === "") {
    missingFields.push("\u6838\u5FC3\u9A71\u52A8\u529B");
  }
  if (character.core_position.character_red_line.length === 0) {
    warnings.push("\u5EFA\u8BAE\u586B\u5199\u89D2\u8272\u5E95\u7EBF");
  }
  if (character.psychology.ooc_red_line.length === 0) {
    warnings.push("\u5EFA\u8BAE\u586B\u5199OOC\u5E95\u7EBF");
  }
  if (!character.plot_binding.debut_chapter_node || character.plot_binding.debut_chapter_node.trim() === "") {
    warnings.push("\u5EFA\u8BAE\u586B\u5199\u51FA\u573A\u7AE0\u8282\u8282\u70B9");
  }
  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
}
function getRedLineWarnings(character) {
  const result = checkRedLines(character);
  const messages = [];
  if (result.missingFields.length > 0) {
    messages.push(`\u7F3A\u5C11\u5FC5\u586B\u9879: ${result.missingFields.join(", ")}`);
  }
  if (result.warnings.length > 0) {
    messages.push(...result.warnings);
  }
  return messages;
}

// src/ui/EditorModal.ts
var EditorModal = class extends import_obsidian2.Modal {
  constructor(options) {
    super(options.app);
    this.onSave = options.onSave;
    this.onExportJson = options.onExportJson;
    this.isNewCharacter = !options.character;
    this.defaults = options.defaults;
    this.character = options.character || this.createEmptyCharacter();
  }
  createEmptyCharacter() {
    const id = generateId();
    const timestamp = getCurrentTimestamp();
    return {
      standard: {
        version: "1.0.0",
        schema: "nweos",
        format: "character-card"
      },
      metadata: {
        character_id: id,
        character_name: "",
        work_name: this.defaults?.workName || "",
        novel_track: this.defaults?.novelTrack || "",
        character_position: "",
        character_version: "1.0",
        author: this.defaults?.author || "",
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
          full_name: "",
          courtesy_name: "",
          nickname: [],
          code_name: "",
          title: ""
        },
        basic_info: {
          age: void 0,
          age_perceived: void 0,
          gender: "",
          birthday: "",
          birthplace: "",
          current_residence: ""
        },
        identity_system: {
          public_identity: "",
          hidden_identity: "",
          camp: "",
          family_clan: "",
          status_rank: ""
        }
      },
      appearance: {
        basic_appearance: {
          face_shape: "",
          skin: "",
          eyes: "",
          hair: "",
          body_shape: "",
          height_cm: void 0,
          weight_kg: void 0
        },
        iconic_features: [],
        scene_style: {
          daily: "",
          formal: "",
          fight_crisis: "",
          emotional_out_of_control: ""
        },
        appearance_plot_binding: ""
      },
      abilities: {
        basic_abilities: [],
        core_skills: [],
        gold_finger_system: [],
        fatal_flaw: []
      },
      psychology: {
        core_personality: {
          public_persona: "",
          private_persona: "",
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
          mbti: "",
          temperament: ""
        },
        moral_principle: {
          alignment: "",
          core_values: [],
          bottom_line: [],
          conflict_handling: ""
        },
        emotional_profile: {
          base_mood: "",
          emotional_volatility: 50,
          joy_triggers: [],
          anger_triggers: [],
          breakdown_triggers: [],
          soft_triggers: []
        },
        psychological_trauma: "",
        obsession: "",
        personality_growth_line: "",
        ooc_red_line: []
      },
      behavior_pattern: {
        speech_style: {
          formality_level: 50,
          verbosity_level: 50,
          vocabulary_habit: "",
          tone: "",
          catchphrases: [],
          forbidden_words: [],
          scene_speech_change: {}
        },
        action_habits: {
          iconic_tics: [],
          crisis_first_reaction: "",
          decision_making_style: "",
          interaction_habit: ""
        }
      },
      background_history: {
        origin_story: "",
        education_experience: "",
        career_experience: "",
        hidden_secret: "",
        family_background: "",
        key_life_events: []
      },
      preferences_lifestyle: {
        hobbies: [],
        favorites: {
          food: "",
          color: "",
          thing: "",
          season: "",
          scene: ""
        },
        aversions: [],
        preference_plot_binding: "",
        lifestyle_habit: ""
      },
      motivation_arc: {
        core_drive: "",
        goals: {
          short_term: [],
          medium_term: [],
          long_term_ultimate: ""
        },
        core_fears: {
          rational: [],
          irrational: []
        },
        character_arc_path: {
          opening_state: "",
          growth_nodes: [],
          highlight_moment: "",
          final_state: "",
          character_transformation: ""
        }
      },
      plot_binding: {
        debut_chapter_node: "",
        core_highlight_nodes: [],
        personality_transformation_nodes: [],
        foreshadowing_recycle_nodes: [],
        main_line_binding: "",
        ending_setting: "",
        extra_content: ""
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
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createDiv("nweos-editor-modal", (modalEl) => {
      const headerEl = modalEl.createDiv("nweos-editor-header");
      headerEl.createDiv("nweos-editor-title").textContent = this.isNewCharacter ? "\u65B0\u5EFA\u89D2\u8272\u5361" : "\u7F16\u8F91\u89D2\u8272\u5361";
      const bodyEl = modalEl.createDiv("nweos-editor-body");
      const navEl = bodyEl.createDiv("nweos-editor-nav");
      this.tabContainer = new TabContainer(navEl, (tabId) => {
        this.renderTabContent(tabId);
      });
      const formEl = bodyEl.createDiv("nweos-editor-form");
      formEl.appendChild(this.tabContainer.getContentContainer());
      this.renderTabContent(TAB_CONFIG[0].id);
      const footerEl = modalEl.createDiv("nweos-editor-footer");
      new import_obsidian2.Setting(footerEl).addButton((btn) => btn.setButtonText("\u4FDD\u5B58").setCta().onClick(() => this.handleSave()));
      new import_obsidian2.Setting(footerEl).addButton((btn) => btn.setButtonText("\u53D6\u6D88").onClick(() => this.close()));
      if (this.onExportJson) {
        new import_obsidian2.Setting(footerEl).addButton((btn) => btn.setButtonText("\u5BFC\u51FAJSON").onClick(() => {
          if (this.onExportJson) {
            this.onExportJson(this.character);
          }
        }));
      }
      new import_obsidian2.Setting(footerEl).addButton((btn) => btn.setButtonText("\u5BFC\u5165JSON").onClick(() => this.handleImportJson()));
      new import_obsidian2.Setting(footerEl).addButton((btn) => btn.setButtonText("\u68C0\u67E5\u7EA2\u7EBF").onClick(() => this.handleCheckRedLine()));
    });
  }
  renderTabContent(tabId) {
    const container = this.tabContainer.getContentContainer();
    container.empty();
    switch (tabId) {
      case "metadata":
        this.renderMetadataTab(container);
        break;
      case "core-position":
        this.renderCorePositionTab(container);
        break;
      case "identity":
        this.renderIdentityTab(container);
        break;
      case "appearance":
        this.renderAppearanceTab(container);
        break;
      case "abilities":
        this.renderAbilitiesTab(container);
        break;
      case "psychology":
        this.renderPsychologyTab(container);
        break;
      case "behavior":
        this.renderBehaviorTab(container);
        break;
      case "background":
        this.renderBackgroundTab(container);
        break;
      case "preferences":
        this.renderPreferencesTab(container);
        break;
      case "motivation":
        this.renderMotivationTab(container);
        break;
      case "plot-binding":
        this.renderPlotBindingTab(container);
        break;
      case "relationships":
        this.renderRelationshipsTab(container);
        break;
      case "track-extension":
        this.renderTrackExtensionTab(container);
        break;
    }
  }
  renderMetadataTab(container) {
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u6838\u5FC3\u5143\u6570\u636E";
      new import_obsidian2.Setting(section).setName("\u89D2\u8272\u540D\u79F0").addText((text) => {
        text.setValue(this.character.metadata.character_name).onChange((value) => {
          this.character.metadata.character_name = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u4F5C\u54C1\u540D\u79F0").addText((text) => {
        text.setValue(this.character.metadata.work_name).onChange((value) => {
          this.character.metadata.work_name = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u8D5B\u9053\u5206\u7C7B").addText((text) => {
        text.setValue(this.character.metadata.novel_track).onChange((value) => {
          this.character.metadata.novel_track = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u89D2\u8272\u5B9A\u4F4D").addText((text) => {
        text.setValue(this.character.metadata.character_position).onChange((value) => {
          this.character.metadata.character_position = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u4F5C\u8005").addText((text) => {
        text.setValue(this.character.metadata.author).onChange((value) => {
          this.character.metadata.author = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5907\u6CE8").addText((text) => {
        text.setValue(this.character.metadata.notes || "").onChange((value) => {
          this.character.metadata.notes = value;
        });
      });
    });
  }
  renderCorePositionTab(container) {
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u4EBA\u7269\u6838\u5FC3\u5B9A\u4F4D";
      new import_obsidian2.Setting(section).setName("\u6838\u5FC3\u6807\u7B7E\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.core_position.core_tags.join(", ")).onChange((value) => {
          this.character.core_position.core_tags = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u8D5B\u9053\u9002\u914D\u6807\u7B7E\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.core_position.track_adapt_tags.join(", ")).onChange((value) => {
          this.character.core_position.track_adapt_tags = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u9AD8\u5149\u70B9\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.core_position.core_shine_points.join(", ")).onChange((value) => {
          this.character.core_position.core_shine_points = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u8650\u70B9\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.core_position.core_angst_points.join(", ")).onChange((value) => {
          this.character.core_position.core_angst_points = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u8BFB\u8005\u8BB0\u5FC6\u70B9\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.core_position.reader_memory_points.join(", ")).onChange((value) => {
          this.character.core_position.reader_memory_points = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u89D2\u8272\u5E95\u7EBF\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.core_position.character_red_line.join(", ")).onChange((value) => {
          this.character.core_position.character_red_line = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
    });
  }
  renderIdentityTab(container) {
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u57FA\u7840\u8EAB\u4EFD";
      new import_obsidian2.Setting(section).setName("\u59D3\u540D").addText((text) => {
        text.setValue(this.character.identity.names.full_name).onChange((value) => {
          this.character.identity.names.full_name = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5B57/\u53F7").addText((text) => {
        text.setValue(this.character.identity.names.courtesy_name || "").onChange((value) => {
          this.character.identity.names.courtesy_name = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u6635\u79F0\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.identity.names.nickname.join(", ")).onChange((value) => {
          this.character.identity.names.nickname = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u4EE3\u53F7").addText((text) => {
        text.setValue(this.character.identity.names.code_name || "").onChange((value) => {
          this.character.identity.names.code_name = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u79F0\u53F7").addText((text) => {
        text.setValue(this.character.identity.names.title || "").onChange((value) => {
          this.character.identity.names.title = value;
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u57FA\u672C\u4FE1\u606F";
      new import_obsidian2.Setting(section).setName("\u5E74\u9F84").addText((text) => {
        text.setValue(String(this.character.identity.basic_info.age || "")).onChange((value) => {
          this.character.identity.basic_info.age = value ? parseInt(value) : void 0;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5916\u8C8C\u5E74\u9F84").addText((text) => {
        text.setValue(String(this.character.identity.basic_info.age_perceived || "")).onChange((value) => {
          this.character.identity.basic_info.age_perceived = value ? parseInt(value) : void 0;
        });
      });
      new import_obsidian2.Setting(section).setName("\u6027\u522B").addText((text) => {
        text.setValue(this.character.identity.basic_info.gender).onChange((value) => {
          this.character.identity.basic_info.gender = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u751F\u65E5").addText((text) => {
        text.setValue(this.character.identity.basic_info.birthday || "").onChange((value) => {
          this.character.identity.basic_info.birthday = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u51FA\u751F\u5730").addText((text) => {
        text.setValue(this.character.identity.basic_info.birthplace || "").onChange((value) => {
          this.character.identity.basic_info.birthplace = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5F53\u524D\u5C45\u4F4F\u5730").addText((text) => {
        text.setValue(this.character.identity.basic_info.current_residence || "").onChange((value) => {
          this.character.identity.basic_info.current_residence = value;
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u8EAB\u4EFD\u4F53\u7CFB";
      new import_obsidian2.Setting(section).setName("\u516C\u5F00\u8EAB\u4EFD").addText((text) => {
        text.setValue(this.character.identity.identity_system.public_identity).onChange((value) => {
          this.character.identity.identity_system.public_identity = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u9690\u85CF\u8EAB\u4EFD").addText((text) => {
        text.setValue(this.character.identity.identity_system.hidden_identity || "").onChange((value) => {
          this.character.identity.identity_system.hidden_identity = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u9635\u8425").addText((text) => {
        text.setValue(this.character.identity.identity_system.camp).onChange((value) => {
          this.character.identity.identity_system.camp = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5BB6\u65CF/\u95E8\u6D3E").addText((text) => {
        text.setValue(this.character.identity.identity_system.family_clan || "").onChange((value) => {
          this.character.identity.identity_system.family_clan = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5730\u4F4D\u7B49\u7EA7").addText((text) => {
        text.setValue(this.character.identity.identity_system.status_rank || "").onChange((value) => {
          this.character.identity.identity_system.status_rank = value;
        });
      });
    });
  }
  renderAppearanceTab(container) {
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u5916\u8C8C\u7279\u5F81";
      new import_obsidian2.Setting(section).setName("\u8138\u578B").addText((text) => {
        text.setValue(this.character.appearance.basic_appearance.face_shape || "").onChange((value) => {
          this.character.appearance.basic_appearance.face_shape = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u80A4\u8272").addText((text) => {
        text.setValue(this.character.appearance.basic_appearance.skin || "").onChange((value) => {
          this.character.appearance.basic_appearance.skin = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u773C\u775B").addText((text) => {
        text.setValue(this.character.appearance.basic_appearance.eyes || "").onChange((value) => {
          this.character.appearance.basic_appearance.eyes = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u53D1\u578B").addText((text) => {
        text.setValue(this.character.appearance.basic_appearance.hair || "").onChange((value) => {
          this.character.appearance.basic_appearance.hair = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u8EAB\u6750").addText((text) => {
        text.setValue(this.character.appearance.basic_appearance.body_shape || "").onChange((value) => {
          this.character.appearance.basic_appearance.body_shape = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u8EAB\u9AD8(cm)").addText((text) => {
        text.setValue(String(this.character.appearance.basic_appearance.height_cm || "")).onChange((value) => {
          this.character.appearance.basic_appearance.height_cm = value ? parseInt(value) : void 0;
        });
      });
      new import_obsidian2.Setting(section).setName("\u4F53\u91CD(kg)").addText((text) => {
        text.setValue(String(this.character.appearance.basic_appearance.weight_kg || "")).onChange((value) => {
          this.character.appearance.basic_appearance.weight_kg = value ? parseInt(value) : void 0;
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u6807\u5FD7\u6027\u7279\u5F81";
      new import_obsidian2.Setting(section).setName("\u6807\u5FD7\u6027\u7279\u5F81\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.appearance.iconic_features.join(", ")).onChange((value) => {
          this.character.appearance.iconic_features = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u573A\u666F\u98CE\u683C";
      new import_obsidian2.Setting(section).setName("\u65E5\u5E38").addText((text) => {
        text.setValue(this.character.appearance.scene_style.daily || "").onChange((value) => {
          this.character.appearance.scene_style.daily = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u6B63\u5F0F").addText((text) => {
        text.setValue(this.character.appearance.scene_style.formal || "").onChange((value) => {
          this.character.appearance.scene_style.formal = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u6218\u6597/\u5371\u673A").addText((text) => {
        text.setValue(this.character.appearance.scene_style.fight_crisis || "").onChange((value) => {
          this.character.appearance.scene_style.fight_crisis = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u60C5\u7EEA\u5931\u63A7").addText((text) => {
        text.setValue(this.character.appearance.scene_style.emotional_out_of_control || "").onChange((value) => {
          this.character.appearance.scene_style.emotional_out_of_control = value;
        });
      });
    });
  }
  renderAbilitiesTab(container) {
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u80FD\u529B\u4F53\u7CFB";
      new import_obsidian2.Setting(section).setName("\u57FA\u7840\u80FD\u529B\u8BF4\u660E").addTextArea((text) => {
        text.setValue(JSON.stringify(this.character.abilities.basic_abilities)).onChange((value) => {
          try {
            this.character.abilities.basic_abilities = JSON.parse(value);
          } catch (e) {
          }
        });
      });
      new import_obsidian2.Setting(section).setName("\u6838\u5FC3\u6280\u80FD\u8BF4\u660E").addTextArea((text) => {
        text.setValue(JSON.stringify(this.character.abilities.core_skills)).onChange((value) => {
          try {
            this.character.abilities.core_skills = JSON.parse(value);
          } catch (e) {
          }
        });
      });
      new import_obsidian2.Setting(section).setName("\u91D1\u624B\u6307\u7CFB\u7EDF\u8BF4\u660E").addTextArea((text) => {
        text.setValue(JSON.stringify(this.character.abilities.gold_finger_system)).onChange((value) => {
          try {
            this.character.abilities.gold_finger_system = JSON.parse(value);
          } catch (e) {
          }
        });
      });
      new import_obsidian2.Setting(section).setName("\u81F4\u547D\u7F3A\u9677\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.abilities.fatal_flaw.join(", ")).onChange((value) => {
          this.character.abilities.fatal_flaw = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
    });
  }
  renderPsychologyTab(container) {
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u6838\u5FC3\u4EBA\u683C";
      new import_obsidian2.Setting(section).setName("\u516C\u5F00\u4EBA\u8BBE").addTextArea((text) => {
        text.setValue(this.character.psychology.core_personality.public_persona).onChange((value) => {
          this.character.psychology.core_personality.public_persona = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u79C1\u4EBA\u771F\u5B9E").addTextArea((text) => {
        text.setValue(this.character.psychology.core_personality.private_persona).onChange((value) => {
          this.character.psychology.core_personality.private_persona = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u6838\u5FC3\u7279\u8D28\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.psychology.core_personality.core_traits.join(", ")).onChange((value) => {
          this.character.psychology.core_personality.core_traits = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "OCEAN\u4EBA\u683C\u6A21\u578B";
      new import_obsidian2.Setting(section).setName("\u5F00\u653E\u6027").addSlider((slider) => {
        slider.setValue(this.character.psychology.personality_model.ocean.openness).onChange((value) => {
          this.character.psychology.personality_model.ocean.openness = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5C3D\u8D23\u6027").addSlider((slider) => {
        slider.setValue(this.character.psychology.personality_model.ocean.conscientiousness).onChange((value) => {
          this.character.psychology.personality_model.ocean.conscientiousness = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5916\u5411\u6027").addSlider((slider) => {
        slider.setValue(this.character.psychology.personality_model.ocean.extraversion).onChange((value) => {
          this.character.psychology.personality_model.ocean.extraversion = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5B9C\u4EBA\u6027").addSlider((slider) => {
        slider.setValue(this.character.psychology.personality_model.ocean.agreeableness).onChange((value) => {
          this.character.psychology.personality_model.ocean.agreeableness = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u795E\u7ECF\u8D28").addSlider((slider) => {
        slider.setValue(this.character.psychology.personality_model.ocean.neuroticism).onChange((value) => {
          this.character.psychology.personality_model.ocean.neuroticism = value;
        });
      });
      new import_obsidian2.Setting(section).setName("MBTI").addText((text) => {
        text.setValue(this.character.psychology.personality_model.mbti || "").onChange((value) => {
          this.character.psychology.personality_model.mbti = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u6C14\u8D28\u7C7B\u578B").addText((text) => {
        text.setValue(this.character.psychology.personality_model.temperament || "").onChange((value) => {
          this.character.psychology.personality_model.temperament = value;
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u9053\u5FB7\u539F\u5219";
      new import_obsidian2.Setting(section).setName("\u9635\u8425").addText((text) => {
        text.setValue(this.character.psychology.moral_principle.alignment).onChange((value) => {
          this.character.psychology.moral_principle.alignment = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u6838\u5FC3\u4EF7\u503C\u89C2\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.psychology.moral_principle.core_values.join(", ")).onChange((value) => {
          this.character.psychology.moral_principle.core_values = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u5E95\u7EBF\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.psychology.moral_principle.bottom_line.join(", ")).onChange((value) => {
          this.character.psychology.moral_principle.bottom_line = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u51B2\u7A81\u5904\u7406\u65B9\u5F0F").addTextArea((text) => {
        text.setValue(this.character.psychology.moral_principle.conflict_handling).onChange((value) => {
          this.character.psychology.moral_principle.conflict_handling = value;
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u60C5\u611F\u753B\u50CF";
      new import_obsidian2.Setting(section).setName("\u57FA\u7840\u60C5\u7EEA").addText((text) => {
        text.setValue(this.character.psychology.emotional_profile.base_mood).onChange((value) => {
          this.character.psychology.emotional_profile.base_mood = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u60C5\u7EEA\u6CE2\u52A8\u7A0B\u5EA6").addSlider((slider) => {
        slider.setValue(this.character.psychology.emotional_profile.emotional_volatility).onChange((value) => {
          this.character.psychology.emotional_profile.emotional_volatility = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5F00\u5FC3\u89E6\u53D1\u70B9\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.psychology.emotional_profile.joy_triggers.join(", ")).onChange((value) => {
          this.character.psychology.emotional_profile.joy_triggers = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u6124\u6012\u89E6\u53D1\u70B9\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.psychology.emotional_profile.anger_triggers.join(", ")).onChange((value) => {
          this.character.psychology.emotional_profile.anger_triggers = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u5D29\u6E83\u89E6\u53D1\u70B9\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.psychology.emotional_profile.breakdown_triggers.join(", ")).onChange((value) => {
          this.character.psychology.emotional_profile.breakdown_triggers = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u8F6F\u5316\u89E6\u53D1\u70B9\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.psychology.emotional_profile.soft_triggers.join(", ")).onChange((value) => {
          this.character.psychology.emotional_profile.soft_triggers = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u5FC3\u7406\u521B\u4F24\u4E0E\u6267\u5FF5";
      new import_obsidian2.Setting(section).setName("\u5FC3\u7406\u521B\u4F24").addTextArea((text) => {
        text.setValue(this.character.psychology.psychological_trauma || "").onChange((value) => {
          this.character.psychology.psychological_trauma = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u6267\u5FF5").addTextArea((text) => {
        text.setValue(this.character.psychology.obsession || "").onChange((value) => {
          this.character.psychology.obsession = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u4EBA\u683C\u6210\u957F\u7EBF").addTextArea((text) => {
        text.setValue(this.character.psychology.personality_growth_line || "").onChange((value) => {
          this.character.psychology.personality_growth_line = value;
        });
      });
      new import_obsidian2.Setting(section).setName("OOC\u5E95\u7EBF\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.psychology.ooc_red_line.join(", ")).onChange((value) => {
          this.character.psychology.ooc_red_line = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
    });
  }
  renderBehaviorTab(container) {
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u8BED\u8A00\u98CE\u683C";
      new import_obsidian2.Setting(section).setName("\u6B63\u5F0F\u7A0B\u5EA6").addSlider((slider) => {
        slider.setValue(this.character.behavior_pattern.speech_style.formality_level).onChange((value) => {
          this.character.behavior_pattern.speech_style.formality_level = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u8BDD\u5520\u7A0B\u5EA6").addSlider((slider) => {
        slider.setValue(this.character.behavior_pattern.speech_style.verbosity_level).onChange((value) => {
          this.character.behavior_pattern.speech_style.verbosity_level = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u7528\u8BCD\u4E60\u60EF").addText((text) => {
        text.setValue(this.character.behavior_pattern.speech_style.vocabulary_habit).onChange((value) => {
          this.character.behavior_pattern.speech_style.vocabulary_habit = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u8BED\u6C14").addText((text) => {
        text.setValue(this.character.behavior_pattern.speech_style.tone).onChange((value) => {
          this.character.behavior_pattern.speech_style.tone = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u53E3\u5934\u7985\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.behavior_pattern.speech_style.catchphrases.join(", ")).onChange((value) => {
          this.character.behavior_pattern.speech_style.catchphrases = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u7981\u8BED\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.behavior_pattern.speech_style.forbidden_words.join(", ")).onChange((value) => {
          this.character.behavior_pattern.speech_style.forbidden_words = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u884C\u4E3A\u4E60\u60EF";
      new import_obsidian2.Setting(section).setName("\u6807\u5FD7\u6027\u5C0F\u52A8\u4F5C\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.behavior_pattern.action_habits.iconic_tics.join(", ")).onChange((value) => {
          this.character.behavior_pattern.action_habits.iconic_tics = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u5371\u673A\u7B2C\u4E00\u53CD\u5E94").addText((text) => {
        text.setValue(this.character.behavior_pattern.action_habits.crisis_first_reaction).onChange((value) => {
          this.character.behavior_pattern.action_habits.crisis_first_reaction = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u51B3\u7B56\u98CE\u683C").addText((text) => {
        text.setValue(this.character.behavior_pattern.action_habits.decision_making_style).onChange((value) => {
          this.character.behavior_pattern.action_habits.decision_making_style = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u4E92\u52A8\u4E60\u60EF").addTextArea((text) => {
        text.setValue(this.character.behavior_pattern.action_habits.interaction_habit || "").onChange((value) => {
          this.character.behavior_pattern.action_habits.interaction_habit = value;
        });
      });
    });
  }
  renderBackgroundTab(container) {
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u8FC7\u5F80\u7ECF\u5386";
      new import_obsidian2.Setting(section).setName("\u8D77\u6E90\u6545\u4E8B").addTextArea((text) => {
        text.setValue(this.character.background_history.origin_story || "").onChange((value) => {
          this.character.background_history.origin_story = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u6559\u80B2\u7ECF\u5386").addTextArea((text) => {
        text.setValue(this.character.background_history.education_experience || "").onChange((value) => {
          this.character.background_history.education_experience = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u804C\u4E1A\u7ECF\u5386").addTextArea((text) => {
        text.setValue(this.character.background_history.career_experience || "").onChange((value) => {
          this.character.background_history.career_experience = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u9690\u85CF\u79D8\u5BC6").addTextArea((text) => {
        text.setValue(this.character.background_history.hidden_secret || "").onChange((value) => {
          this.character.background_history.hidden_secret = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5BB6\u5EAD\u80CC\u666F").addTextArea((text) => {
        text.setValue(this.character.background_history.family_background || "").onChange((value) => {
          this.character.background_history.family_background = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5173\u952E\u4EBA\u751F\u4E8B\u4EF6(JSON)").addTextArea((text) => {
        text.setValue(JSON.stringify(this.character.background_history.key_life_events, null, 2)).onChange((value) => {
          try {
            this.character.background_history.key_life_events = JSON.parse(value);
          } catch (e) {
          }
        });
      });
    });
  }
  renderPreferencesTab(container) {
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u559C\u6076\u504F\u597D";
      new import_obsidian2.Setting(section).setName("\u5174\u8DA3\u7231\u597D\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.preferences_lifestyle.hobbies.join(", ")).onChange((value) => {
          this.character.preferences_lifestyle.hobbies = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u559C\u6B22\u7684\u98DF\u7269").addText((text) => {
        text.setValue(this.character.preferences_lifestyle.favorites.food || "").onChange((value) => {
          this.character.preferences_lifestyle.favorites.food = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u559C\u6B22\u7684\u989C\u8272").addText((text) => {
        text.setValue(this.character.preferences_lifestyle.favorites.color || "").onChange((value) => {
          this.character.preferences_lifestyle.favorites.color = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u559C\u6B22\u7684\u4E8B\u7269").addText((text) => {
        text.setValue(this.character.preferences_lifestyle.favorites.thing || "").onChange((value) => {
          this.character.preferences_lifestyle.favorites.thing = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u559C\u6B22\u7684\u5B63\u8282").addText((text) => {
        text.setValue(this.character.preferences_lifestyle.favorites.season || "").onChange((value) => {
          this.character.preferences_lifestyle.favorites.season = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u559C\u6B22\u7684\u573A\u666F").addText((text) => {
        text.setValue(this.character.preferences_lifestyle.favorites.scene || "").onChange((value) => {
          this.character.preferences_lifestyle.favorites.scene = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u538C\u6076\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.preferences_lifestyle.aversions.join(", ")).onChange((value) => {
          this.character.preferences_lifestyle.aversions = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u751F\u6D3B\u65B9\u5F0F\u4E60\u60EF").addTextArea((text) => {
        text.setValue(this.character.preferences_lifestyle.lifestyle_habit || "").onChange((value) => {
          this.character.preferences_lifestyle.lifestyle_habit = value;
        });
      });
    });
  }
  renderMotivationTab(container) {
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u52A8\u673A\u5F27\u5149";
      new import_obsidian2.Setting(section).setName("\u6838\u5FC3\u9A71\u52A8\u529B").addTextArea((text) => {
        text.setValue(this.character.motivation_arc.core_drive).onChange((value) => {
          this.character.motivation_arc.core_drive = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u77ED\u671F\u76EE\u6807\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.motivation_arc.goals.short_term.join(", ")).onChange((value) => {
          this.character.motivation_arc.goals.short_term = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u4E2D\u671F\u76EE\u6807\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.motivation_arc.goals.medium_term.join(", ")).onChange((value) => {
          this.character.motivation_arc.goals.medium_term = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u957F\u671F/\u7EC8\u6781\u76EE\u6807").addTextArea((text) => {
        text.setValue(this.character.motivation_arc.goals.long_term_ultimate).onChange((value) => {
          this.character.motivation_arc.goals.long_term_ultimate = value;
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u6838\u5FC3\u6050\u60E7";
      new import_obsidian2.Setting(section).setName("\u7406\u6027\u6050\u60E7\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.motivation_arc.core_fears.rational.join(", ")).onChange((value) => {
          this.character.motivation_arc.core_fears.rational = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u975E\u7406\u6027\u6050\u60E7\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.motivation_arc.core_fears.irrational.join(", ")).onChange((value) => {
          this.character.motivation_arc.core_fears.irrational = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u89D2\u8272\u5F27\u5149\u8DEF\u7EBF";
      new import_obsidian2.Setting(section).setName("\u521D\u59CB\u72B6\u6001").addTextArea((text) => {
        text.setValue(this.character.motivation_arc.character_arc_path.opening_state).onChange((value) => {
          this.character.motivation_arc.character_arc_path.opening_state = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u6210\u957F\u8282\u70B9\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.motivation_arc.character_arc_path.growth_nodes.join(", ")).onChange((value) => {
          this.character.motivation_arc.character_arc_path.growth_nodes = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u9AD8\u5149\u65F6\u523B").addTextArea((text) => {
        text.setValue(this.character.motivation_arc.character_arc_path.highlight_moment).onChange((value) => {
          this.character.motivation_arc.character_arc_path.highlight_moment = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u6700\u7EC8\u72B6\u6001").addTextArea((text) => {
        text.setValue(this.character.motivation_arc.character_arc_path.final_state).onChange((value) => {
          this.character.motivation_arc.character_arc_path.final_state = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u89D2\u8272\u8F6C\u53D8").addTextArea((text) => {
        text.setValue(this.character.motivation_arc.character_arc_path.character_transformation).onChange((value) => {
          this.character.motivation_arc.character_arc_path.character_transformation = value;
        });
      });
    });
  }
  renderPlotBindingTab(container) {
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u5267\u60C5\u7ED1\u5B9A";
      new import_obsidian2.Setting(section).setName("\u51FA\u573A\u7AE0\u8282\u8282\u70B9").addText((text) => {
        text.setValue(this.character.plot_binding.debut_chapter_node).onChange((value) => {
          this.character.plot_binding.debut_chapter_node = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u6838\u5FC3\u9AD8\u5149\u8282\u70B9\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.plot_binding.core_highlight_nodes.join(", ")).onChange((value) => {
          this.character.plot_binding.core_highlight_nodes = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u4EBA\u683C\u8F6C\u53D8\u8282\u70B9\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.plot_binding.personality_transformation_nodes.join(", ")).onChange((value) => {
          this.character.plot_binding.personality_transformation_nodes = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u4F0F\u7B14\u56DE\u6536\u8282\u70B9\uFF08\u9017\u53F7\u5206\u9694\uFF09").addText((text) => {
        text.setValue(this.character.plot_binding.foreshadowing_recycle_nodes.join(", ")).onChange((value) => {
          this.character.plot_binding.foreshadowing_recycle_nodes = value.split(",").map((t) => t.trim()).filter((t) => t);
        });
      });
      new import_obsidian2.Setting(section).setName("\u4E3B\u7EBF\u7ED1\u5B9A").addTextArea((text) => {
        text.setValue(this.character.plot_binding.main_line_binding || "").onChange((value) => {
          this.character.plot_binding.main_line_binding = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u7ED3\u5C40\u8BBE\u5B9A").addTextArea((text) => {
        text.setValue(this.character.plot_binding.ending_setting || "").onChange((value) => {
          this.character.plot_binding.ending_setting = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u989D\u5916\u5185\u5BB9").addTextArea((text) => {
        text.setValue(this.character.plot_binding.extra_content || "").onChange((value) => {
          this.character.plot_binding.extra_content = value;
        });
      });
    });
  }
  renderRelationshipsTab(container) {
    container.createDiv("nweos-form-section", (section) => {
      const headerEl = section.createDiv("nweos-form-section-header");
      headerEl.createDiv("nweos-form-section-title").textContent = "\u6838\u5FC3\u5173\u7CFB";
      const addBtn = headerEl.createEl("button", { text: "+ \u6DFB\u52A0", cls: "nweos-add-btn" });
      addBtn.addEventListener("click", () => {
        this.character.relationship_network.core_relationships.push({
          character_name: "",
          relationship_position: "",
          core_bond: "",
          relationship_development_line: "",
          core_conflict: "",
          iconic_scene_nodes: []
        });
        this.renderTabContent("relationships");
      });
      const list = section.createDiv("nweos-relationship-list");
      this.character.relationship_network.core_relationships.forEach((rel, index) => {
        const card = list.createDiv("nweos-relationship-card");
        const cardHeader = card.createDiv("nweos-relationship-card-header");
        cardHeader.createSpan().textContent = rel.character_name || `\u6838\u5FC3\u5173\u7CFB #${index + 1}`;
        const deleteBtn = cardHeader.createEl("button", { text: "\u5220\u9664", cls: "nweos-delete-btn" });
        deleteBtn.addEventListener("click", () => {
          this.character.relationship_network.core_relationships.splice(index, 1);
          this.renderTabContent("relationships");
        });
        new import_obsidian2.Setting(card).setName("\u89D2\u8272\u540D").addText((t) => t.setValue(rel.character_name).setPlaceholder("\u5173\u8054\u89D2\u8272\u540D").onChange((v) => {
          rel.character_name = v;
        }));
        new import_obsidian2.Setting(card).setName("\u5173\u7CFB\u5B9A\u4F4D").addText((t) => t.setValue(rel.relationship_position).setPlaceholder("\u4F8B\u5982\uFF1A\u5E08\u5F92/\u60C5\u4FA3/\u6B7B\u654C").onChange((v) => {
          rel.relationship_position = v;
        }));
        new import_obsidian2.Setting(card).setName("\u6838\u5FC3\u7F81\u7ECA").addTextArea((t) => t.setValue(rel.core_bond).setPlaceholder("\u63CF\u8FF0\u6838\u5FC3\u7F81\u7ECA").onChange((v) => {
          rel.core_bond = v;
        }));
        new import_obsidian2.Setting(card).setName("\u5173\u7CFB\u53D1\u5C55\u7EBF").addTextArea((t) => t.setValue(rel.relationship_development_line).setPlaceholder("\u5173\u7CFB\u5982\u4F55\u53D8\u5316\u53D1\u5C55").onChange((v) => {
          rel.relationship_development_line = v;
        }));
        new import_obsidian2.Setting(card).setName("\u6838\u5FC3\u51B2\u7A81").addTextArea((t) => t.setValue(rel.core_conflict || "").setPlaceholder("\u53EF\u9009\uFF1A\u5173\u7CFB\u4E2D\u7684\u6838\u5FC3\u77DB\u76FE").onChange((v) => {
          rel.core_conflict = v;
        }));
        const scenesEl = card.createDiv("nweos-scenes-section");
        const scenesHeader = scenesEl.createDiv("nweos-scenes-header");
        scenesHeader.createSpan().textContent = "\u6807\u5FD7\u6027\u573A\u666F";
        const addSceneBtn = scenesHeader.createEl("button", { text: "+ \u573A\u666F", cls: "nweos-add-btn nweos-add-btn-small" });
        addSceneBtn.addEventListener("click", () => {
          rel.iconic_scene_nodes.push({ description: "", chapter: "" });
          this.renderTabContent("relationships");
        });
        rel.iconic_scene_nodes.forEach((scene, si) => {
          const sceneEl = scenesEl.createDiv("nweos-scene-item");
          new import_obsidian2.Setting(sceneEl).setName(`\u573A\u666F${si + 1} \u7AE0\u8282`).addText((t) => t.setValue(scene.chapter || "").setPlaceholder("\u7AE0\u8282").onChange((v) => {
            scene.chapter = v;
          }));
          new import_obsidian2.Setting(sceneEl).setName(`\u573A\u666F${si + 1} \u63CF\u8FF0`).addText((t) => t.setValue(scene.description).setPlaceholder("\u573A\u666F\u63CF\u8FF0").onChange((v) => {
            scene.description = v;
          }));
          const delScene = sceneEl.createEl("button", { text: "\xD7", cls: "nweos-delete-btn nweos-delete-btn-small" });
          delScene.addEventListener("click", () => {
            rel.iconic_scene_nodes.splice(si, 1);
            this.renderTabContent("relationships");
          });
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      const headerEl = section.createDiv("nweos-form-section-header");
      headerEl.createDiv("nweos-form-section-title").textContent = "\u6B21\u8981\u5173\u7CFB";
      const addBtn = headerEl.createEl("button", { text: "+ \u6DFB\u52A0", cls: "nweos-add-btn" });
      addBtn.addEventListener("click", () => {
        this.character.relationship_network.secondary_relationships.push({
          character_name: "",
          relationship_position: "",
          core_bond: ""
        });
        this.renderTabContent("relationships");
      });
      const list = section.createDiv("nweos-relationship-list");
      this.character.relationship_network.secondary_relationships.forEach((rel, index) => {
        const card = list.createDiv("nweos-relationship-card nweos-relationship-card-secondary");
        const cardHeader = card.createDiv("nweos-relationship-card-header");
        cardHeader.createSpan().textContent = rel.character_name || `\u6B21\u8981\u5173\u7CFB #${index + 1}`;
        const deleteBtn = cardHeader.createEl("button", { text: "\u5220\u9664", cls: "nweos-delete-btn" });
        deleteBtn.addEventListener("click", () => {
          this.character.relationship_network.secondary_relationships.splice(index, 1);
          this.renderTabContent("relationships");
        });
        new import_obsidian2.Setting(card).setName("\u89D2\u8272\u540D").addText((t) => t.setValue(rel.character_name).setPlaceholder("\u5173\u8054\u89D2\u8272\u540D").onChange((v) => {
          rel.character_name = v;
        }));
        new import_obsidian2.Setting(card).setName("\u5173\u7CFB\u5B9A\u4F4D").addText((t) => t.setValue(rel.relationship_position).setPlaceholder("\u4F8B\u5982\uFF1A\u540C\u95E8/\u4E0B\u5C5E").onChange((v) => {
          rel.relationship_position = v;
        }));
        new import_obsidian2.Setting(card).setName("\u6838\u5FC3\u7F81\u7ECA").addText((t) => t.setValue(rel.core_bond).setPlaceholder("\u7B80\u8FF0\u7F81\u7ECA").onChange((v) => {
          rel.core_bond = v;
        }));
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      const headerEl = section.createDiv("nweos-form-section-header");
      headerEl.createDiv("nweos-form-section-title").textContent = "\u654C\u5BF9\u5173\u7CFB";
      const addBtn = headerEl.createEl("button", { text: "+ \u6DFB\u52A0", cls: "nweos-add-btn" });
      addBtn.addEventListener("click", () => {
        this.character.relationship_network.hostile_relationships.push({
          character_name: "",
          relationship_position: "",
          reason: ""
        });
        this.renderTabContent("relationships");
      });
      const list = section.createDiv("nweos-relationship-list");
      this.character.relationship_network.hostile_relationships.forEach((rel, index) => {
        const card = list.createDiv("nweos-relationship-card nweos-relationship-card-hostile");
        const cardHeader = card.createDiv("nweos-relationship-card-header");
        cardHeader.createSpan().textContent = rel.character_name || `\u654C\u5BF9\u5173\u7CFB #${index + 1}`;
        const deleteBtn = cardHeader.createEl("button", { text: "\u5220\u9664", cls: "nweos-delete-btn" });
        deleteBtn.addEventListener("click", () => {
          this.character.relationship_network.hostile_relationships.splice(index, 1);
          this.renderTabContent("relationships");
        });
        new import_obsidian2.Setting(card).setName("\u89D2\u8272\u540D").addText((t) => t.setValue(rel.character_name).setPlaceholder("\u654C\u5BF9\u89D2\u8272\u540D").onChange((v) => {
          rel.character_name = v;
        }));
        new import_obsidian2.Setting(card).setName("\u5173\u7CFB\u5B9A\u4F4D").addText((t) => t.setValue(rel.relationship_position).setPlaceholder("\u4F8B\u5982\uFF1A\u5BBF\u654C/\u7ADE\u4E89\u8005").onChange((v) => {
          rel.relationship_position = v;
        }));
        new import_obsidian2.Setting(card).setName("\u654C\u5BF9\u539F\u56E0").addTextArea((t) => t.setValue(rel.reason).setPlaceholder("\u4E3A\u4F55\u654C\u5BF9").onChange((v) => {
          rel.reason = v;
        }));
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      const headerEl = section.createDiv("nweos-form-section-header");
      headerEl.createDiv("nweos-form-section-title").textContent = "\u4E2D\u7ACB\u5173\u7CFB";
      const addBtn = headerEl.createEl("button", { text: "+ \u6DFB\u52A0", cls: "nweos-add-btn" });
      addBtn.addEventListener("click", () => {
        this.character.relationship_network.neutral_acquaintances.push({
          character_name: "",
          relationship_position: "",
          note: ""
        });
        this.renderTabContent("relationships");
      });
      const list = section.createDiv("nweos-relationship-list");
      this.character.relationship_network.neutral_acquaintances.forEach((rel, index) => {
        const card = list.createDiv("nweos-relationship-card nweos-relationship-card-neutral");
        const cardHeader = card.createDiv("nweos-relationship-card-header");
        cardHeader.createSpan().textContent = rel.character_name || `\u4E2D\u7ACB\u5173\u7CFB #${index + 1}`;
        const deleteBtn = cardHeader.createEl("button", { text: "\u5220\u9664", cls: "nweos-delete-btn" });
        deleteBtn.addEventListener("click", () => {
          this.character.relationship_network.neutral_acquaintances.splice(index, 1);
          this.renderTabContent("relationships");
        });
        new import_obsidian2.Setting(card).setName("\u89D2\u8272\u540D").addText((t) => t.setValue(rel.character_name).setPlaceholder("\u89D2\u8272\u540D").onChange((v) => {
          rel.character_name = v;
        }));
        new import_obsidian2.Setting(card).setName("\u5173\u7CFB\u5B9A\u4F4D").addText((t) => t.setValue(rel.relationship_position).setPlaceholder("\u4F8B\u5982\uFF1A\u8DEF\u4EBA/\u90BB\u5C45").onChange((v) => {
          rel.relationship_position = v;
        }));
        new import_obsidian2.Setting(card).setName("\u5907\u6CE8").addText((t) => t.setValue(rel.note || "").setPlaceholder("\u53EF\u9009\u5907\u6CE8").onChange((v) => {
          rel.note = v;
        }));
      });
    });
  }
  renderTrackExtensionTab(container) {
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u7384\u5E7B\u4ED9\u4FA0";
      new import_obsidian2.Setting(section).setName("\u4FEE\u4E3A\u7B49\u7EA7").addText((text) => {
        text.setValue(this.character.track_extension.xuanhuan_xianxia?.cultivation_level || "").onChange((value) => {
          if (!this.character.track_extension.xuanhuan_xianxia) {
            this.character.track_extension.xuanhuan_xianxia = {};
          }
          this.character.track_extension.xuanhuan_xianxia.cultivation_level = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u7075\u6839/\u6B66\u9B42").addText((text) => {
        text.setValue(this.character.track_extension.xuanhuan_xianxia?.spirit_root_martial_soul || "").onChange((value) => {
          if (!this.character.track_extension.xuanhuan_xianxia) {
            this.character.track_extension.xuanhuan_xianxia = {};
          }
          this.character.track_extension.xuanhuan_xianxia.spirit_root_martial_soul = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u4FEE\u70BC\u6CD5\u95E8/\u6CD5\u5B9D").addText((text) => {
        text.setValue(this.character.track_extension.xuanhuan_xianxia?.cultivation_method_magic_treasure || "").onChange((value) => {
          if (!this.character.track_extension.xuanhuan_xianxia) {
            this.character.track_extension.xuanhuan_xianxia = {};
          }
          this.character.track_extension.xuanhuan_xianxia.cultivation_method_magic_treasure = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u95E8\u6D3E").addText((text) => {
        text.setValue(this.character.track_extension.xuanhuan_xianxia?.sect || "").onChange((value) => {
          if (!this.character.track_extension.xuanhuan_xianxia) {
            this.character.track_extension.xuanhuan_xianxia = {};
          }
          this.character.track_extension.xuanhuan_xianxia.sect = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5BFF\u547D").addText((text) => {
        text.setValue(this.character.track_extension.xuanhuan_xianxia?.lifespan || "").onChange((value) => {
          if (!this.character.track_extension.xuanhuan_xianxia) {
            this.character.track_extension.xuanhuan_xianxia = {};
          }
          this.character.track_extension.xuanhuan_xianxia.lifespan = value;
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u53E4\u8A00\u5BAB\u6597";
      new import_obsidian2.Setting(section).setName("\u738B\u671D\u5E74\u4EFD").addText((text) => {
        text.setValue(this.character.track_extension.guyan_gongdou?.dynasty_year || "").onChange((value) => {
          if (!this.character.track_extension.guyan_gongdou) {
            this.character.track_extension.guyan_gongdou = {};
          }
          this.character.track_extension.guyan_gongdou.dynasty_year = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u8D35\u65CF\u5934\u8854").addText((text) => {
        text.setValue(this.character.track_extension.guyan_gongdou?.noble_title || "").onChange((value) => {
          if (!this.character.track_extension.guyan_gongdou) {
            this.character.track_extension.guyan_gongdou = {};
          }
          this.character.track_extension.guyan_gongdou.noble_title = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5BB6\u65CF\u52BF\u529B").addText((text) => {
        text.setValue(this.character.track_extension.guyan_gongdou?.family_power || "").onChange((value) => {
          if (!this.character.track_extension.guyan_gongdou) {
            this.character.track_extension.guyan_gongdou = {};
          }
          this.character.track_extension.guyan_gongdou.family_power = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5E9C\u90B8\u5BAB\u6BBF").addText((text) => {
        text.setValue(this.character.track_extension.guyan_gongdou?.mansion_palace || "").onChange((value) => {
          if (!this.character.track_extension.guyan_gongdou) {
            this.character.track_extension.guyan_gongdou = {};
          }
          this.character.track_extension.guyan_gongdou.mansion_palace = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u9635\u8425").addText((text) => {
        text.setValue(this.character.track_extension.guyan_gongdou?.court_camp || "").onChange((value) => {
          if (!this.character.track_extension.guyan_gongdou) {
            this.character.track_extension.guyan_gongdou = {};
          }
          this.character.track_extension.guyan_gongdou.court_camp = value;
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u90FD\u5E02\u73B0\u8A00";
      new import_obsidian2.Setting(section).setName("\u804C\u4E1A\u804C\u4F4D").addText((text) => {
        text.setValue(this.character.track_extension.xianyan_dushi?.career_position || "").onChange((value) => {
          if (!this.character.track_extension.xianyan_dushi) {
            this.character.track_extension.xianyan_dushi = {};
          }
          this.character.track_extension.xianyan_dushi.career_position = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u516C\u53F8\u884C\u4E1A").addText((text) => {
        text.setValue(this.character.track_extension.xianyan_dushi?.company_industry || "").onChange((value) => {
          if (!this.character.track_extension.xianyan_dushi) {
            this.character.track_extension.xianyan_dushi = {};
          }
          this.character.track_extension.xianyan_dushi.company_industry = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u8D44\u4EA7").addText((text) => {
        text.setValue(this.character.track_extension.xianyan_dushi?.assets || "").onChange((value) => {
          if (!this.character.track_extension.xianyan_dushi) {
            this.character.track_extension.xianyan_dushi = {};
          }
          this.character.track_extension.xianyan_dushi.assets = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u793E\u4F1A\u8D44\u6E90").addText((text) => {
        text.setValue(this.character.track_extension.xianyan_dushi?.social_resources || "").onChange((value) => {
          if (!this.character.track_extension.xianyan_dushi) {
            this.character.track_extension.xianyan_dushi = {};
          }
          this.character.track_extension.xianyan_dushi.social_resources = value;
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u79D1\u5E7B\u672B\u4E16";
      new import_obsidian2.Setting(section).setName("\u80FD\u529B\u7B49\u7EA7").addText((text) => {
        text.setValue(this.character.track_extension.kehuan_moshi?.ability_level || "").onChange((value) => {
          if (!this.character.track_extension.kehuan_moshi) {
            this.character.track_extension.kehuan_moshi = {};
          }
          this.character.track_extension.kehuan_moshi.ability_level = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u673A\u68B0\u6539\u9020").addText((text) => {
        text.setValue(this.character.track_extension.kehuan_moshi?.cybernetic_reform || "").onChange((value) => {
          if (!this.character.track_extension.kehuan_moshi) {
            this.character.track_extension.kehuan_moshi = {};
          }
          this.character.track_extension.kehuan_moshi.cybernetic_reform = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u9635\u8425\u57FA\u5730").addText((text) => {
        text.setValue(this.character.track_extension.kehuan_moshi?.camp_base || "").onChange((value) => {
          if (!this.character.track_extension.kehuan_moshi) {
            this.character.track_extension.kehuan_moshi = {};
          }
          this.character.track_extension.kehuan_moshi.camp_base = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u751F\u5B58\u80FD\u529B").addText((text) => {
        text.setValue(this.character.track_extension.kehuan_moshi?.survival_ability || "").onChange((value) => {
          if (!this.character.track_extension.kehuan_moshi) {
            this.character.track_extension.kehuan_moshi = {};
          }
          this.character.track_extension.kehuan_moshi.survival_ability = value;
        });
      });
    });
    container.createDiv("nweos-form-section", (section) => {
      section.createDiv("nweos-form-section-title").textContent = "\u60AC\u7591\u5211\u4FA6";
      new import_obsidian2.Setting(section).setName("\u8EAB\u4EFD\u6743\u9650").addText((text) => {
        text.setValue(this.character.track_extension.xuanyi_xingzhen?.identity_authority || "").onChange((value) => {
          if (!this.character.track_extension.xuanyi_xingzhen) {
            this.character.track_extension.xuanyi_xingzhen = {};
          }
          this.character.track_extension.xuanyi_xingzhen.identity_authority = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u7834\u6848\u80FD\u529B").addText((text) => {
        text.setValue(this.character.track_extension.xuanyi_xingzhen?.case_solving_ability || "").onChange((value) => {
          if (!this.character.track_extension.xuanyi_xingzhen) {
            this.character.track_extension.xuanyi_xingzhen = {};
          }
          this.character.track_extension.xuanyi_xingzhen.case_solving_ability = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u6838\u5FC3\u79D8\u5BC6").addText((text) => {
        text.setValue(this.character.track_extension.xuanyi_xingzhen?.core_secret || "").onChange((value) => {
          if (!this.character.track_extension.xuanyi_xingzhen) {
            this.character.track_extension.xuanyi_xingzhen = {};
          }
          this.character.track_extension.xuanyi_xingzhen.core_secret = value;
        });
      });
      new import_obsidian2.Setting(section).setName("\u5FC3\u7406\u753B\u50CF").addTextArea((text) => {
        text.setValue(this.character.track_extension.xuanyi_xingzhen?.psychological_profile || "").onChange((value) => {
          if (!this.character.track_extension.xuanyi_xingzhen) {
            this.character.track_extension.xuanyi_xingzhen = {};
          }
          this.character.track_extension.xuanyi_xingzhen.psychological_profile = value;
        });
      });
    });
  }
  async handleSave() {
    try {
      this.character.metadata.last_updated = getCurrentTimestamp();
      await this.onSave(this.character);
      this.close();
    } catch (error) {
      console.error("\u4FDD\u5B58\u89D2\u8272\u5931\u8D25:", error);
      new import_obsidian2.Notice("\u4FDD\u5B58\u5931\u8D25: " + error.message);
    }
  }
  handleImportJson() {
    const jsonString = prompt("\u8BF7\u7C98\u8D34JSON\u5185\u5BB9:");
    if (!jsonString) return;
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.standard?.schema !== "nweos") {
        new import_obsidian2.Notice("\u65E0\u6548\u7684NWEOS\u89D2\u8272\u5361\u683C\u5F0F");
        return;
      }
      parsed.metadata.character_id = generateId();
      parsed.metadata.created_at = getCurrentTimestamp();
      parsed.metadata.last_updated = getCurrentTimestamp();
      this.character = parsed;
      this.isNewCharacter = false;
      this.renderTabContent(this.tabContainer.getActiveTabId());
      new import_obsidian2.Notice("\u5BFC\u5165\u6210\u529F");
    } catch (error) {
      console.error("\u5BFC\u5165\u5931\u8D25:", error);
      new import_obsidian2.Notice("JSON\u683C\u5F0F\u9519\u8BEF\uFF0C\u5BFC\u5165\u5931\u8D25");
    }
  }
  handleCheckRedLine() {
    const result = checkRedLines(this.character);
    if (result.isValid) {
      new import_obsidian2.Notice("\u89D2\u8272\u5361\u586B\u5199\u5B8C\u6574\uFF01");
    } else {
      const message = `\u7F3A\u5C11\u5FC5\u586B\u9879: ${result.missingFields.join(", ")}`;
      new import_obsidian2.Notice(message);
    }
    if (result.warnings.length > 0) {
      console.log("\u7EA2\u7EBF\u8B66\u544A:", result.warnings);
    }
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};

// src/ui/SidebarView.ts
var NWEOS_SIDEBAR_VIEW_TYPE = "nweos-sidebar";
var SidebarView = class extends import_obsidian3.View {
  constructor(leaf, app, characterStore, plugin) {
    super(leaf);
    this.characters = [];
    this.searchQuery = "";
    this.refreshTimer = null;
    this.listContainer = null;
    this.searchTimer = null;
    this.characterStore = characterStore;
    this.plugin = plugin;
  }
  getViewType() {
    return NWEOS_SIDEBAR_VIEW_TYPE;
  }
  getDisplayText() {
    return "NWEOS\u89D2\u8272\u5361";
  }
  async onOpen() {
    await this.loadCharacters();
    this.render();
    this.registerEvent(this.app.vault.on("create", (file) => this.onFileChange(file)));
    this.registerEvent(this.app.vault.on("delete", (file) => this.onFileChange(file)));
    this.registerEvent(this.app.vault.on("modify", (file) => this.onFileChange(file)));
  }
  onFileChange(file) {
    const settings = this.plugin.getSettings();
    const charPath = settings.charactersPath || "characters";
    if (file instanceof import_obsidian3.TFile && file.extension === "json" && file.path.startsWith(charPath)) {
      if (this.refreshTimer) clearTimeout(this.refreshTimer);
      this.refreshTimer = setTimeout(async () => {
        await this.loadCharacters();
        this.render();
      }, 500);
    }
  }
  async onClose() {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }
  async loadCharacters() {
    this.characters = await this.characterStore.loadCharacters();
  }
  render() {
    const container = this.containerEl;
    container.empty();
    container.createDiv("nweos-sidebar", (sidebarEl) => {
      const headerEl = sidebarEl.createDiv("nweos-sidebar-header");
      headerEl.createDiv("nweos-sidebar-title").textContent = "NWEOS\u89D2\u8272\u5361";
      new import_obsidian3.Setting(headerEl).addButton((btn) => btn.setButtonText("+ \u65B0\u5EFA\u89D2\u8272\u5361").setCta().onClick(() => this.handleCreateNew()));
      const searchEl = sidebarEl.createDiv("nweos-sidebar-search");
      const searchWrapper = searchEl.createDiv("nweos-search-wrapper");
      const searchInput = searchWrapper.createEl("input", {
        type: "text",
        placeholder: "\u641C\u7D22\u89D2\u8272\uFF08\u6309\u56DE\u8F66\u641C\u7D22\uFF09..."
      });
      searchInput.value = this.searchQuery;
      const clearBtn = searchWrapper.createEl("button", { text: "\xD7", cls: "nweos-search-clear" });
      clearBtn.style.display = this.searchQuery ? "block" : "none";
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.searchQuery = e.target.value.toLowerCase();
          clearBtn.style.display = this.searchQuery ? "block" : "none";
          if (this.listContainer) this.renderCharacterList(this.listContainer);
        }
      });
      searchInput.addEventListener("input", (e) => {
        if (this.searchTimer) clearTimeout(this.searchTimer);
        const value = e.target.value;
        clearBtn.style.display = value ? "block" : "none";
        this.searchTimer = setTimeout(() => {
          this.searchQuery = value.toLowerCase();
          if (this.listContainer) this.renderCharacterList(this.listContainer);
        }, 500);
      });
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        this.searchQuery = "";
        clearBtn.style.display = "none";
        if (this.listContainer) this.renderCharacterList(this.listContainer);
      });
      this.listContainer = sidebarEl.createDiv("nweos-sidebar-list");
      this.renderCharacterList(this.listContainer);
    });
  }
  renderCharacterList(container) {
    container.empty();
    const filteredCharacters = this.searchQuery ? this.characters.filter((char) => {
      const name = char.metadata.character_name.toLowerCase();
      const workName = char.metadata.work_name.toLowerCase();
      const position = char.metadata.character_position.toLowerCase();
      const tags = char.core_position?.track_adapt_tags?.join(" ").toLowerCase() || "";
      return name.includes(this.searchQuery) || workName.includes(this.searchQuery) || position.includes(this.searchQuery) || tags.includes(this.searchQuery);
    }) : this.characters;
    const groupedByWork = this.groupByWork(filteredCharacters);
    if (Object.keys(groupedByWork).length === 0) {
      container.createDiv("nweos-empty-state").textContent = this.characters.length === 0 ? '\u6682\u65E0\u89D2\u8272\u5361\uFF0C\u70B9\u51FB"\u65B0\u5EFA\u89D2\u8272\u5361"\u5F00\u59CB\u521B\u5EFA' : "\u6CA1\u6709\u5339\u914D\u7684\u89D2\u8272";
      return;
    }
    Object.entries(groupedByWork).forEach(([workName, characters]) => {
      const groupEl = container.createDiv("nweos-character-group");
      const groupHeaderEl = groupEl.createDiv("nweos-character-group-header");
      groupHeaderEl.textContent = workName || "\u672A\u547D\u540D\u4F5C\u54C1";
      groupHeaderEl.createSpan("nweos-character-count").textContent = `(${characters.length})`;
      const itemsEl = groupEl.createDiv("nweos-character-items");
      characters.forEach((character) => {
        new CharacterListItem(itemsEl, {
          character,
          onClick: (char) => this.handleOpenEditor(char),
          onEdit: (char) => this.handleOpenEditor(char),
          onDelete: (char) => this.handleDelete(char),
          onCopyJson: (char) => this.handleCopyJson(char)
        });
      });
    });
  }
  groupByWork(characters) {
    return characters.reduce((groups, character) => {
      const workName = character.metadata.work_name || "\u672A\u547D\u540D\u4F5C\u54C1";
      if (!groups[workName]) {
        groups[workName] = [];
      }
      groups[workName].push(character);
      return groups;
    }, {});
  }
  handleCreateNew() {
    const settings = this.plugin.getSettings();
    const modal = new EditorModal({
      app: this.app,
      onSave: async (character) => {
        await this.characterStore.saveCharacter(character);
        await this.loadCharacters();
        this.render();
      },
      onExportJson: (character) => this.handleExportJson(character),
      defaults: {
        workName: settings.workName,
        novelTrack: settings.novelTrack,
        author: settings.author
      }
    });
    modal.open();
  }
  handleOpenEditor(character) {
    const modal = new EditorModal({
      app: this.app,
      character,
      onSave: async (updatedCharacter) => {
        await this.characterStore.saveCharacter(updatedCharacter);
        await this.loadCharacters();
        this.render();
      },
      onExportJson: (char) => this.handleExportJson(char)
    });
    modal.open();
  }
  async handleDelete(character) {
    const confirmed = confirm(`\u786E\u5B9A\u8981\u5220\u9664\u89D2\u8272"${character.metadata.character_name}"\u5417\uFF1F\u6B64\u64CD\u4F5C\u4E0D\u53EF\u64A4\u9500\u3002`);
    if (confirmed) {
      await this.characterStore.deleteCharacter(character.metadata.character_id);
      await this.loadCharacters();
      this.render();
    }
  }
  handleCopyJson(character) {
    const jsonString = JSON.stringify(character, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      new Notice2("\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F");
    }).catch((err) => {
      console.error("\u590D\u5236\u5931\u8D25:", err);
    });
  }
  handleExportJson(character) {
    const jsonString = JSON.stringify(character, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${character.metadata.character_name || "character"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  async refresh() {
    await this.loadCharacters();
    this.render();
  }
  createNewCharacter() {
    this.handleCreateNew();
  }
};
var Notice2 = class {
  constructor(message) {
    const noticeEl = document.createElement("div");
    noticeEl.className = "nweos-notice";
    noticeEl.textContent = message;
    document.body.appendChild(noticeEl);
    setTimeout(() => noticeEl.remove(), 3e3);
  }
};

// src/main.ts
var DEFAULT_SETTINGS = {
  workName: "",
  novelTrack: "",
  author: "",
  charactersPath: "characters",
  autoCheckRedLine: true
};
var NWEOSPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.currentSidebarView = null;
  }
  async onload() {
    console.log("NWEOS\u7F51\u6587\u89D2\u8272\u5361\u63D2\u4EF6\u5DF2\u52A0\u8F7D");
    await this.loadSettings();
    this.app.workspace.onLayoutReady(() => {
      this.loadStyles();
    });
    this.characterStore = new CharacterStore(this.app, this.settings.charactersPath);
    this.registerView(
      NWEOS_SIDEBAR_VIEW_TYPE,
      (leaf) => {
        const view = new SidebarView(leaf, this.app, this.characterStore, this);
        this.currentSidebarView = view;
        return view;
      }
    );
    this.addCommand({
      id: "open-nweos-sidebar",
      name: "\u6253\u5F00\u89D2\u8272\u5361\u9762\u677F",
      callback: () => {
        this.openSidebar();
      }
    });
    this.addCommand({
      id: "create-nweos-character",
      name: "\u521B\u5EFA\u65B0\u89D2\u8272\u5361",
      callback: () => {
        this.createNewCharacter();
      }
    });
    this.addCommand({
      id: "import-nweos-character",
      name: "\u5BFC\u5165\u89D2\u8272JSON",
      callback: () => {
        this.importCharacter();
      }
    });
    this.addCommand({
      id: "check-nweos-redline",
      name: "\u68C0\u67E5\u89D2\u8272\u7EA2\u7EBF",
      callback: () => {
        this.checkCharacterRedLine();
      }
    });
    this.addSettingTab(new NWEOSSettingTab(this.app, this));
    this.openSidebar();
  }
  onunload() {
    console.log("NWEOS\u7F51\u6587\u89D2\u8272\u5361\u63D2\u4EF6\u5DF2\u5378\u8F7D");
    this.app.workspace.getLeavesOfType(NWEOS_SIDEBAR_VIEW_TYPE).forEach((leaf) => leaf.detach());
  }
  async loadStyles() {
    const stylesPath = (0, import_obsidian4.normalizePath)(`${this.manifest.dir}/styles.css`);
    try {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = stylesPath;
      document.head.appendChild(link);
    } catch (e) {
      console.warn("\u52A0\u8F7D\u6837\u5F0F\u6587\u4EF6\u5931\u8D25:", e);
    }
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  getSettings() {
    return this.settings;
  }
  async openSidebar() {
    const leaves = this.app.workspace.getLeavesOfType(NWEOS_SIDEBAR_VIEW_TYPE);
    if (leaves.length > 0) {
      this.app.workspace.revealLeaf(leaves[0]);
      return;
    }
    const leaf = this.app.workspace.getLeaf(true);
    if (leaf) {
      await leaf.setViewState({
        type: NWEOS_SIDEBAR_VIEW_TYPE,
        active: true
      });
    }
  }
  async createNewCharacter() {
    await this.openSidebar();
    setTimeout(() => {
      if (this.currentSidebarView) {
        this.currentSidebarView.createNewCharacter();
      }
    }, 100);
  }
  async importCharacter() {
    const activeFile = this.app.workspace.getActiveFile();
    if (!activeFile || activeFile.extension !== "json") {
      new import_obsidian4.Notice("\u8BF7\u5148\u6253\u5F00\u4E00\u4E2AJSON\u6587\u4EF6");
      return;
    }
    try {
      const content = await this.app.vault.read(activeFile);
      const character = JSON.parse(content);
      if (!character.standard || character.standard.schema !== "nweos") {
        new import_obsidian4.Notice("\u65E0\u6548\u7684NWEOS\u89D2\u8272\u5361\u683C\u5F0F");
        return;
      }
      character.metadata.character_id = generateId();
      character.metadata.created_at = getCurrentTimestamp();
      character.metadata.last_updated = getCurrentTimestamp();
      await this.characterStore.saveCharacter(character);
      new import_obsidian4.Notice(`\u89D2\u8272 "${character.metadata.character_name}" \u5BFC\u5165\u6210\u529F`);
      if (this.currentSidebarView) {
        this.currentSidebarView.refresh();
      }
    } catch (error) {
      console.error("\u5BFC\u5165\u89D2\u8272\u5931\u8D25:", error);
      new import_obsidian4.Notice("\u5BFC\u5165\u89D2\u8272\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5JSON\u683C\u5F0F");
    }
  }
  async checkCharacterRedLine() {
    const characters = await this.characterStore.loadCharacters();
    if (characters.length === 0) {
      new import_obsidian4.Notice("\u6682\u65E0\u89D2\u8272\u5361");
      return;
    }
    let allWarnings = [];
    for (const character of characters) {
      const warnings = getRedLineWarnings(character);
      if (warnings.length > 0) {
        allWarnings.push(`\u3010${character.metadata.character_name}\u3011
${warnings.join("\n")}`);
      }
    }
    if (allWarnings.length === 0) {
      new import_obsidian4.Notice("\u6240\u6709\u89D2\u8272\u5361\u90FD\u5DF2\u586B\u5199\u5B8C\u6574\uFF01");
    } else {
      const message = allWarnings.slice(0, 3).join("\n\n");
      new import_obsidian4.Notice(`\u53D1\u73B0 ${allWarnings.length} \u4E2A\u89D2\u8272\u5361\u5B58\u5728\u7EA2\u7EBF\u95EE\u9898`);
      console.log("\u7EA2\u7EBF\u68C0\u67E5\u7ED3\u679C:\n", message);
    }
  }
  getCharacterStore() {
    return this.characterStore;
  }
};
var NWEOSSettingTab = class extends import_obsidian4.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "NWEOS\u7F51\u6587\u89D2\u8272\u5361\u8BBE\u7F6E" });
    containerEl.createEl("h3", { text: "\u4F5C\u54C1\u4FE1\u606F\uFF08\u65B0\u5EFA\u89D2\u8272\u65F6\u81EA\u52A8\u586B\u5165\uFF09" });
    new import_obsidian4.Setting(containerEl).setName("\u4F5C\u54C1\u540D\u79F0").setDesc("\u5F53\u524D Vault \u5BF9\u5E94\u7684\u5C0F\u8BF4\u540D\u79F0\uFF0C\u65B0\u5EFA\u89D2\u8272\u65F6\u81EA\u52A8\u586B\u5165").addText((text) => text.setPlaceholder("\u4F8B\u5982\uFF1A\u6597\u7834\u82CD\u7A79").setValue(this.plugin.settings.workName).onChange(async (value) => {
      this.plugin.settings.workName = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian4.Setting(containerEl).setName("\u8D5B\u9053\u5206\u7C7B").setDesc("\u5C0F\u8BF4\u6240\u5C5E\u8D5B\u9053\uFF0C\u65B0\u5EFA\u89D2\u8272\u65F6\u81EA\u52A8\u586B\u5165").addText((text) => text.setPlaceholder("\u4F8B\u5982\uFF1A\u90FD\u5E02\u5A31\u4E50\u3001\u7384\u5E7B").setValue(this.plugin.settings.novelTrack).onChange(async (value) => {
      this.plugin.settings.novelTrack = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian4.Setting(containerEl).setName("\u4F5C\u8005").setDesc("\u4F5C\u8005\u540D\u5B57\uFF0C\u65B0\u5EFA\u89D2\u8272\u65F6\u81EA\u52A8\u586B\u5165").addText((text) => text.setPlaceholder("\u4F8B\u5982\uFF1A\u5929\u8695\u571F\u8C46").setValue(this.plugin.settings.author).onChange(async (value) => {
      this.plugin.settings.author = value;
      await this.plugin.saveSettings();
    }));
    containerEl.createEl("h3", { text: "\u5B58\u50A8\u8BBE\u7F6E" });
    new import_obsidian4.Setting(containerEl).setName("\u89D2\u8272\u5B58\u50A8\u8DEF\u5F84").setDesc("\u89D2\u8272\u5361\u6587\u4EF6\u5B58\u50A8\u7684\u6587\u4EF6\u5939\u8DEF\u5F84").addText((text) => text.setPlaceholder("characters").setValue(this.plugin.settings.charactersPath).onChange(async (value) => {
      this.plugin.settings.charactersPath = value || "characters";
      await this.plugin.saveSettings();
    }));
    new import_obsidian4.Setting(containerEl).setName("\u81EA\u52A8\u68C0\u67E5\u7EA2\u7EBF").setDesc("\u4FDD\u5B58\u89D2\u8272\u65F6\u81EA\u52A8\u68C0\u67E5\u5FC5\u586B\u9879\u662F\u5426\u586B\u5199").addToggle((toggle) => toggle.setValue(this.plugin.settings.autoCheckRedLine).onChange(async (value) => {
      this.plugin.settings.autoCheckRedLine = value;
      await this.plugin.saveSettings();
    }));
  }
};
