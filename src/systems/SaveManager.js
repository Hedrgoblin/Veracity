/**
 * SaveManager - Handles game save/load using localStorage
 * Supports auto-save and manual save slots
 */
import gameStateManager from './GameStateManager.js';

class SaveManager {
  constructor() {
    this.SAVE_KEY = 'veracity_save';
    this.AUTOSAVE_KEY = 'veracity_autosave';
    this.VERSION = '1.0.0';
  }

  // Save current game state
  save(slotName = 'manual') {
    try {
      const state = gameStateManager.getState();
      const saveData = {
        version: this.VERSION,
        timestamp: Date.now(),
        state: state
      };

      const key = slotName === 'auto' ? this.AUTOSAVE_KEY : `${this.SAVE_KEY}_${slotName}`;
      localStorage.setItem(key, JSON.stringify(saveData));

      console.log(`Game saved to slot: ${slotName}`);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  // Load game state from slot
  load(slotName = 'manual') {
    try {
      const key = slotName === 'auto' ? this.AUTOSAVE_KEY : `${this.SAVE_KEY}_${slotName}`;
      const saveDataString = localStorage.getItem(key);

      if (!saveDataString) {
        console.log(`No save found in slot: ${slotName}`);
        return null;
      }

      const saveData = JSON.parse(saveDataString);

      // Version check
      if (saveData.version !== this.VERSION) {
        console.warn('Save file version mismatch. Migration may be needed.');
      }

      gameStateManager.loadState(saveData.state);
      console.log(`Game loaded from slot: ${slotName}`);
      return saveData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  // Auto-save (called on chapter completion)
  autoSave() {
    return this.save('auto');
  }

  // Check if save exists
  hasSave(slotName = 'manual') {
    const key = slotName === 'auto' ? this.AUTOSAVE_KEY : `${this.SAVE_KEY}_${slotName}`;
    return localStorage.getItem(key) !== null;
  }

  // Get save info without loading
  getSaveInfo(slotName = 'manual') {
    try {
      const key = slotName === 'auto' ? this.AUTOSAVE_KEY : `${this.SAVE_KEY}_${slotName}`;
      const saveDataString = localStorage.getItem(key);

      if (!saveDataString) {
        return null;
      }

      const saveData = JSON.parse(saveDataString);
      return {
        version: saveData.version,
        timestamp: saveData.timestamp,
        chapter: saveData.state.currentChapter,
        completedChapters: saveData.state.completedChapters.length
      };
    } catch (error) {
      console.error('Failed to get save info:', error);
      return null;
    }
  }

  // Delete save
  deleteSave(slotName = 'manual') {
    try {
      const key = slotName === 'auto' ? this.AUTOSAVE_KEY : `${this.SAVE_KEY}_${slotName}`;
      localStorage.removeItem(key);
      console.log(`Save deleted from slot: ${slotName}`);
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  // Get all save slots
  getAllSaves() {
    const saves = [];
    const slots = ['auto', 'slot1', 'slot2', 'slot3'];

    slots.forEach(slot => {
      const info = this.getSaveInfo(slot);
      if (info) {
        saves.push({ slot, ...info });
      }
    });

    return saves;
  }

  // Export save as JSON string (for backup)
  exportSave(slotName = 'manual') {
    const key = slotName === 'auto' ? this.AUTOSAVE_KEY : `${this.SAVE_KEY}_${slotName}`;
    const saveDataString = localStorage.getItem(key);
    return saveDataString;
  }

  // Import save from JSON string
  importSave(jsonString, slotName = 'manual') {
    try {
      const saveData = JSON.parse(jsonString);

      // Validate structure
      if (!saveData.version || !saveData.state) {
        throw new Error('Invalid save file format');
      }

      const key = slotName === 'auto' ? this.AUTOSAVE_KEY : `${this.SAVE_KEY}_${slotName}`;
      localStorage.setItem(key, jsonString);

      console.log(`Save imported to slot: ${slotName}`);
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }
}

const saveManager = new SaveManager();
export default saveManager;
