# Developer Guide - Steampunk Journey

This guide is for developers who want to understand and extend the game's codebase.

## Architecture Overview

### Core Systems (Singleton Pattern)

#### GameStateManager (`src/systems/GameStateManager.js`)
- **Purpose**: Central state management for the entire game
- **Responsibilities**:
  - Track current chapter and completion status
  - Manage companion health and damage
  - Track player choices and their consequences
  - Manage story flags for branching narrative
  - Handle inventory system
  - Track puzzle completion

**Key Methods**:
```javascript
gameStateManager.setCurrentChapter(number)
gameStateManager.completeChapter(number)
gameStateManager.addChoice(chapter, choice, companion)
gameStateManager.damageCompanion(name, amount)
gameStateManager.setFlag(flagName, value)
```

#### SaveManager (`src/systems/SaveManager.js`)
- **Purpose**: Persist game state to localStorage
- **Features**:
  - Auto-save after each chapter
  - Multiple manual save slots (3)
  - Save import/export functionality
  - Version checking

**Key Methods**:
```javascript
saveManager.save(slotName)
saveManager.load(slotName)
saveManager.autoSave()
saveManager.hasSave(slotName)
```

#### ChapterManager (`src/systems/ChapterManager.js`)
- **Purpose**: Load and process chapter data from JSON
- **Features**:
  - Dynamic chapter loading from `/public/data/chapters/`
  - Chapter caching for performance
  - Conditional narrative branching
  - Next chapter determination

**Key Methods**:
```javascript
await chapterManager.loadChapter(number)
chapterManager.getCurrentChapter()
chapterManager.getNextChapter()
```

#### AudioManager (`src/systems/AudioManager.js`)
- **Purpose**: Handle all audio (music and SFX)
- **Features**:
  - Music crossfading
  - Volume control with persistence
  - Sound effect management

**Key Methods**:
```javascript
audioManager.playMusic(key, loop, fadeIn)
audioManager.playSfx(key, config)
audioManager.setMusicVolume(volume)
```

## Scene Architecture

### Scene Flow
```
BootScene -> MainMenuScene -> ChapterScene <-> PuzzleScene -> EndingScene
                  ^                                    |
                  |                                    v
              SettingsScene                    (cycle repeats)
```

### BootScene
- Loads initial assets
- Creates placeholder graphics (replaced by art later)
- Transitions to MainMenuScene

### MainMenuScene
- New Game / Continue / Settings
- Checks for save files
- Launches appropriate scene

### ChapterScene
**The main gameplay scene**
- Loads chapter data
- Displays narrative dialogue
- Shows player choices
- Launches puzzle scenes
- Handles chapter completion

**Lifecycle**:
1. `init(data)` - Receive chapter number
2. `create()` - Load chapter, setup scene
3. `startNarrative()` - Show opening dialogue
4. `checkForChoices()` - Present choices
5. `checkForPuzzle()` - Launch puzzle if exists
6. `onPuzzleComplete()` - Show closing dialogue
7. `completeChapter()` - Save and transition

### PuzzleScene
- Handles all three puzzle types
- Spawned as overlay on ChapterScene
- Returns control when complete

**Puzzle Types**:
1. **Connection Puzzle** - Connect matching points with lines
2. **Rhythm Puzzle** - Tap pattern at correct timing
3. **Gather Sort Puzzle** - Drag items to correct slots

### SettingsScene
- Volume controls
- Settings persistence
- Launched as overlay

### EndingScene
- Shows ending based on player choices
- Credits
- Return to main menu

## Chapter JSON Schema

```json
{
  "chapterNumber": 1,
  "title": "Chapter Title",
  "act": 1,
  "description": "Brief description",

  "assets": {
    "background": "filename_without_extension",
    "music": "filename_without_extension",
    "characters": ["girl", "addie", "rainie"]
  },

  "companions": ["addie", "rainie"],

  "dialogue": {
    "opening": [
      { "speaker": "Name", "text": "Dialogue text" }
    ],
    "closing": [
      { "speaker": "Name", "text": "Dialogue text" }
    ]
  },

  "choices": [
    {
      "text": "Choice description",
      "companion": "addie" | "rainie",
      "consequences": {
        "flag_name": true
      }
    }
  ],

  "puzzle": {
    "type": "connection" | "rhythm" | "gather_sort",
    "title": "Puzzle Title",
    "instructions": "Puzzle instructions",
    // Type-specific config here
  },

  "storyFlags": {
    "flag_name": true
  },

  "nextChapter": 2 | null,

  "branches": [
    {
      "condition": {
        "flag": "flag_name",
        "value": true
      },
      "dialogue": { /* Override dialogue */ },
      "assets": { /* Override assets */ }
    }
  ]
}
```

## Adding New Features

### Adding a New Puzzle Type

1. **Update PuzzleScene** (`src/scenes/PuzzleScene.js`):
```javascript
create() {
  switch (this.puzzleData.type) {
    case 'your_new_type':
      this.createYourNewPuzzle();
      break;
  }
}

createYourNewPuzzle() {
  // Puzzle logic here
  // Call this.completePuzzle() when done
}
```

2. **Update Chapter JSON**:
```json
{
  "puzzle": {
    "type": "your_new_type",
    "title": "Your Puzzle",
    "instructions": "How to solve",
    "customConfig": "type-specific data"
  }
}
```

### Adding Branching Narrative

Use the `branches` array in chapter JSON:

```json
{
  "branches": [
    {
      "condition": {
        "flag": "saved_architect",
        "value": true
      },
      "dialogue": {
        "opening": [
          { "speaker": "Grand Architect", "text": "You saved me..." }
        ]
      }
    }
  ]
}
```

### Adding New Companion Actions

In `GameStateManager.js`:

```javascript
performCompanionAction(companionName, action) {
  const companion = this.state.companions[companionName];
  // Implement action logic
}
```

In chapter JSON:
```json
{
  "choices": [
    {
      "text": "Send Addie ahead to scout",
      "companion": "addie",
      "action": "scout",
      "consequences": { "scouted": true }
    }
  ]
}
```

## Testing Tips

### Jump to Specific Chapter
```javascript
// In browser console
game.scene.start('ChapterScene', { chapterNumber: 7 });
```

### Inspect Game State
```javascript
// Check current state
console.log(gameStateManager.getState());

// Set a flag for testing
gameStateManager.setFlag('test_flag', true);

// Damage a companion
gameStateManager.damageCompanion('addie', 50);
```

### Test Puzzle Independently
```javascript
game.scene.start('PuzzleScene', {
  puzzleData: {
    type: 'connection',
    title: 'Test Puzzle',
    instructions: 'Test instructions',
    points: [
      { id: 'a', x: -100, y: 0, pair: 'b' },
      { id: 'b', x: 100, y: 0, pair: 'a' }
    ]
  },
  chapterNumber: 1,
  onComplete: () => console.log('Puzzle complete!')
});
```

### Clear Save Data
```javascript
// Clear all saves
localStorage.clear();

// Or specific save
saveManager.deleteSave('auto');
```

## Performance Optimization

### Asset Loading
- Use sprite sheets for characters with multiple poses
- Compress PNG files (use tools like TinyPNG)
- Keep backgrounds under 1MB
- Use OGG for better compression vs MP3

### Chapter Preloading
```javascript
// Preload next 2 chapters for smooth transitions
await chapterManager.preloadChapters([currentChapter + 1, currentChapter + 2]);
```

### Memory Management
- Destroy unused graphics in scenes
- Clear texture cache when changing acts
- Use object pooling for repeated elements

## Build Configuration

### Development Build
```bash
npm run dev
```
- Fast hot-reload
- Source maps enabled
- No minification

### Production Build
```bash
npm run build
```
- Minified code
- Optimized assets
- Output in `/dist`

### Custom Build Settings
Edit `vite.config.js`:
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          // Add more chunks as needed
        }
      }
    }
  }
});
```

## Debugging

### Common Issues

**Assets Not Loading**
- Check browser console for 404 errors
- Verify file paths are case-sensitive correct
- Ensure fetch() paths start with `/`

**Dialogue Not Advancing**
- Check for missing `onComplete` callbacks
- Verify dialogue array is not empty
- Test click zone is properly sized

**Puzzles Not Completing**
- Add console.log to completion checks
- Verify puzzle data format matches expected
- Check that `completePuzzle()` is called

**Save/Load Issues**
- Check localStorage quota in browser
- Verify JSON serialization doesn't fail
- Test in incognito for localStorage issues

## Code Style Guide

### Naming Conventions
- **Classes**: PascalCase (`GameStateManager`)
- **Variables**: camelCase (`currentChapter`)
- **Constants**: UPPER_SNAKE_CASE (`SAVE_KEY`)
- **Private methods**: Prefix with `_` (`_validateData`)

### Scene Methods Order
1. `constructor()`
2. `init(data)`
3. `preload()`
4. `create()`
5. Helper methods
6. `update()`
7. `shutdown()`

### Comments
- Use JSDoc for public methods
- Explain "why" not "what"
- Document complex algorithms
- Mark TODOs and FIXMEs

## Contributing

### Before Submitting Changes
1. Test all 14 chapters
2. Verify save/load works
3. Check all 3 puzzle types
4. Test on different browsers
5. Ensure no console errors

### Submitting Art Assets
- Follow asset specifications in README
- Include character concept if new character
- Provide background story context
- Test in-game before submitting

## Additional Resources

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

## Questions?

Check the game console for errors and warnings. Most issues will be logged there with helpful messages.

Happy developing! 🎮✨
