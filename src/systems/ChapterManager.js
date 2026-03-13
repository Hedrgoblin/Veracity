/**
 * ChapterManager - Loads and manages chapter data from JSON files
 * Handles narrative branching based on player choices
 */
import gameStateManager from './GameStateManager.js';

const BASE = import.meta.env.BASE_URL;

class ChapterManager {
  constructor() {
    this.currentChapter = null;
    this.chapterCache = {}; // Cache loaded chapters
  }

  // Load chapter data from JSON
  async loadChapter(chapterNumber) {
    // Check cache first
    if (this.chapterCache[chapterNumber]) {
      console.log(`Loading chapter ${chapterNumber} from cache`);
      this.currentChapter = this.chapterCache[chapterNumber];
      return this.currentChapter;
    }

    try {
      const response = await fetch(`${BASE}data/chapters/chapter_${String(chapterNumber).padStart(2, '0')}.json`);

      if (!response.ok) {
        throw new Error(`Failed to load chapter ${chapterNumber}: ${response.statusText}`);
      }

      const chapterData = await response.json();

      // Process chapter data based on current game state
      this.currentChapter = this.processChapterData(chapterData);

      // Cache for future use
      this.chapterCache[chapterNumber] = this.currentChapter;

      console.log(`Chapter ${chapterNumber} loaded successfully`);
      return this.currentChapter;
    } catch (error) {
      console.error(`Error loading chapter ${chapterNumber}:`, error);
      return null;
    }
  }

  // Process chapter data based on game state (for branching)
  processChapterData(chapterData) {
    const state = gameStateManager.getState();
    const processed = { ...chapterData };

    // Handle narrative branching based on story flags
    if (chapterData.branches) {
      for (const branch of chapterData.branches) {
        const conditionMet = this.evaluateCondition(branch.condition, state);
        if (conditionMet) {
          // Apply branch modifications
          if (branch.dialogue) {
            processed.dialogue = { ...processed.dialogue, ...branch.dialogue };
          }
          if (branch.assets) {
            processed.assets = { ...processed.assets, ...branch.assets };
          }
          if (branch.puzzle) {
            processed.puzzle = { ...processed.puzzle, ...branch.puzzle };
          }
        }
      }
    }

    // Check companion availability
    if (processed.companions) {
      processed.companions = processed.companions.filter(companionName => {
        return gameStateManager.isCompanionAvailable(companionName);
      });
    }

    return processed;
  }

  // Evaluate conditional logic for branching
  evaluateCondition(condition, state) {
    if (!condition) return true;

    // Handle different condition types
    if (condition.flag) {
      return state.storyFlags[condition.flag] === condition.value;
    }

    if (condition.minConfidence) {
      return state.girl.confidence >= condition.minConfidence;
    }

    if (condition.minAgency) {
      return state.girl.agency >= condition.minAgency;
    }

    if (condition.companionHealth) {
      const companion = state.companions[condition.companionHealth.name];
      return companion && companion.health >= condition.companionHealth.min;
    }

    if (condition.hasItem) {
      return state.inventory.includes(condition.hasItem);
    }

    if (condition.completedChapter) {
      return state.completedChapters.includes(condition.completedChapter);
    }

    return true;
  }

  // Get current chapter
  getCurrentChapter() {
    return this.currentChapter;
  }

  // Determine next chapter based on choices and state
  getNextChapter() {
    if (!this.currentChapter) return 1;

    const currentNum = this.currentChapter.chapterNumber;
    const state = gameStateManager.getState();

    // Check if chapter defines custom next chapter logic
    if (this.currentChapter.nextChapter) {
      if (typeof this.currentChapter.nextChapter === 'number') {
        return this.currentChapter.nextChapter;
      }

      // Conditional next chapter
      if (Array.isArray(this.currentChapter.nextChapter)) {
        for (const option of this.currentChapter.nextChapter) {
          if (this.evaluateCondition(option.condition, state)) {
            return option.chapter;
          }
        }
      }
    }

    // Default: next sequential chapter
    return currentNum + 1;
  }

  // Get chapter title by number
  async getChapterTitle(chapterNumber) {
    const chapter = await this.loadChapter(chapterNumber);
    return chapter ? chapter.title : `Chapter ${chapterNumber}`;
  }

  // Clear cache (useful for testing)
  clearCache() {
    this.chapterCache = {};
    console.log('Chapter cache cleared');
  }

  // Preload multiple chapters for smoother transitions
  async preloadChapters(chapterNumbers) {
    const promises = chapterNumbers.map(num => this.loadChapter(num));
    await Promise.all(promises);
    console.log(`Preloaded chapters: ${chapterNumbers.join(', ')}`);
  }
}

const chapterManager = new ChapterManager();
export default chapterManager;
