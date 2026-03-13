/**
 * GameStateManager - Singleton that manages all game state
 * Tracks chapter progress, companion health, choices, and story flags
 */
class GameStateManager {
  constructor() {
    if (GameStateManager.instance) {
      return GameStateManager.instance;
    }

    this.state = {
      currentChapter: 1,
      completedChapters: [],
      subscribed: false, // Track subscription status
      companions: {
        addie: {
          name: 'Addie',
          health: 100,
          isDamaged: false,
          personality: 'cautious'
        },
        rainie: {
          name: 'Rainie',
          health: 100,
          isDamaged: false,
          personality: 'adventurous'
        }
      },
      girl: {
        confidence: 0, // Grows throughout the game
        agency: 0 // Represents her independence
      },
      choices: [], // Array of {chapter, choice, companion} objects
      storyFlags: {}, // Dynamic flags for branching narrative
      inventory: [],
      completedPuzzles: []
    };

    GameStateManager.instance = this;
  }

  // Get current state
  getState() {
    return this.state;
  }

  // Set current chapter
  setCurrentChapter(chapterNum) {
    this.state.currentChapter = chapterNum;
  }

  // Mark chapter as completed
  completeChapter(chapterNum) {
    if (!this.state.completedChapters.includes(chapterNum)) {
      this.state.completedChapters.push(chapterNum);
    }
  }

  // Add a choice made by the player
  addChoice(chapter, choice, companion) {
    this.state.choices.push({ chapter, choice, companion, timestamp: Date.now() });

    // Update companion relationship or girl's growth
    if (companion === 'addie') {
      this.state.girl.confidence += 1; // Cautious choices build confidence gradually
    } else if (companion === 'rainie') {
      this.state.girl.agency += 1; // Risky choices build agency
    }
  }

  // Damage a companion
  damageCompanion(companionName, damage = 25) {
    const companion = this.state.companions[companionName];
    if (companion) {
      companion.health = Math.max(0, companion.health - damage);
      if (companion.health < 50) {
        companion.isDamaged = true;
      }
    }
  }

  // Repair a companion
  repairCompanion(companionName, amount = 50) {
    const companion = this.state.companions[companionName];
    if (companion) {
      companion.health = Math.min(100, companion.health + amount);
      if (companion.health >= 50) {
        companion.isDamaged = false;
      }
    }
  }

  // Set a story flag
  setFlag(flagName, value = true) {
    this.state.storyFlags[flagName] = value;
  }

  // Get a story flag
  getFlag(flagName) {
    return this.state.storyFlags[flagName] || false;
  }

  // Add item to inventory
  addToInventory(item) {
    if (!this.state.inventory.includes(item)) {
      this.state.inventory.push(item);
    }
  }

  // Remove item from inventory
  removeFromInventory(item) {
    const index = this.state.inventory.indexOf(item);
    if (index > -1) {
      this.state.inventory.splice(index, 1);
    }
  }

  // Mark puzzle as completed
  completePuzzle(puzzleId) {
    if (!this.state.completedPuzzles.includes(puzzleId)) {
      this.state.completedPuzzles.push(puzzleId);
    }
  }

  // Check if companion is available (not too damaged)
  isCompanionAvailable(companionName) {
    const companion = this.state.companions[companionName];
    return companion && companion.health > 0;
  }

  // Set subscription status
  setSubscribed(value = true) {
    this.state.subscribed = value;
  }

  // Check if player is subscribed
  isSubscribed() {
    return this.state.subscribed === true;
  }

  // Load state from save data
  loadState(saveData) {
    this.state = { ...this.state, ...saveData };
  }

  // Reset state for new game
  resetState() {
    this.state = {
      currentChapter: 1,
      completedChapters: [],
      subscribed: false,
      companions: {
        addie: { name: 'Addie', health: 100, isDamaged: false, personality: 'cautious' },
        rainie: { name: 'Rainie', health: 100, isDamaged: false, personality: 'adventurous' }
      },
      girl: { confidence: 0, agency: 0 },
      choices: [],
      storyFlags: {},
      inventory: [],
      completedPuzzles: []
    };
  }
}

// Create singleton instance
const gameStateManager = new GameStateManager();

export default gameStateManager;
