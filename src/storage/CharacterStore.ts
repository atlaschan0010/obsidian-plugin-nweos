import { App, TFolder, TFile } from 'obsidian';
import { NWEOSCharacter } from '../types/nweos';

export class CharacterStore {
  private app: App;
  private charactersPath: string;

  constructor(app: App, charactersPath: string = 'characters') {
    this.app = app;
    this.charactersPath = charactersPath;
  }

  /**
   * Generate a safe filename from character metadata.
   * Format: "角色名_作品名.json" or "角色名.json" if no work name.
   */
  private getFileName(character: NWEOSCharacter): string {
    const name = character.metadata.character_name || character.metadata.character_id;
    const workName = character.metadata.work_name;

    // Sanitize: remove characters that are invalid in filenames
    const sanitize = (s: string) => s.replace(/[\\/:*?"<>|]/g, '_').trim();

    const safeName = sanitize(name);
    const safeWork = workName ? sanitize(workName) : '';

    const baseName = safeWork ? `${safeName}_${safeWork}` : safeName;
    return `${baseName}.json`;
  }

  private async ensureCharactersFolder(): Promise<TFolder> {
    const folder = this.app.vault.getFolderByPath(this.charactersPath);
    if (folder) {
      return folder;
    }
    return await this.app.vault.createFolder(this.charactersPath);
  }

  async loadCharacters(): Promise<NWEOSCharacter[]> {
    const characters: NWEOSCharacter[] = [];
    const folder = this.app.vault.getFolderByPath(this.charactersPath);

    if (!folder) {
      return characters;
    }

    const processFolder = async (tf: TFolder): Promise<void> => {
      for (const child of tf.children) {
        if (child instanceof TFile && child.extension === 'json') {
          try {
            const content = await this.app.vault.read(child);
            const character = JSON.parse(content) as NWEOSCharacter;
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

  async saveCharacter(character: NWEOSCharacter): Promise<void> {
    await this.ensureCharactersFolder();

    const fileName = this.getFileName(character);
    const filePath = `${this.charactersPath}/${fileName}`;

    // Check if there's an old file with different name for this character_id
    // (e.g., name changed, or migrating from ID-based filenames)
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
  private async removeOldFile(characterId: string, newFilePath: string): Promise<void> {
    const folder = this.app.vault.getFolderByPath(this.charactersPath);
    if (!folder) return;

    for (const child of folder.children) {
      if (child instanceof TFile && child.extension === 'json' && child.path !== newFilePath) {
        try {
          const content = await this.app.vault.read(child);
          const data = JSON.parse(content);
          if (data?.metadata?.character_id === characterId) {
            await this.app.vault.delete(child);
            break;
          }
        } catch (e) {
          // skip unreadable files
        }
      }
    }
  }

  async deleteCharacter(id: string): Promise<void> {
    const folder = this.app.vault.getFolderByPath(this.charactersPath);
    if (!folder) return;

    for (const child of folder.children) {
      if (child instanceof TFile && child.extension === 'json') {
        try {
          const content = await this.app.vault.read(child);
          const data = JSON.parse(content);
          if (data?.metadata?.character_id === id) {
            await this.app.vault.delete(child);
            return;
          }
        } catch (e) {
          // skip
        }
      }
    }
  }

  async getCharacter(id: string): Promise<NWEOSCharacter | null> {
    const folder = this.app.vault.getFolderByPath(this.charactersPath);
    if (!folder) return null;

    for (const child of folder.children) {
      if (child instanceof TFile && child.extension === 'json') {
        try {
          const content = await this.app.vault.read(child);
          const data = JSON.parse(content) as NWEOSCharacter;
          if (data.metadata.character_id === id) {
            return data;
          }
        } catch (e) {
          // skip
        }
      }
    }
    return null;
  }
}
