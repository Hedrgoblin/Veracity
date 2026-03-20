# Developer Guide - Veracity

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
  - Version checking

**Key Methods**:
```javascript
saveManager.save(slotName)
saveManager.load(slotName)
saveManager.autoSave()
saveManager.hasSave(slotName)
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
- New Game / Continue / Settings / Subscribe
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
1. `init(data)` — Receive chapter number
2. `create()` — Load chapter, setup scene
3. `startNarrative()` — Show opening dialogue
4. `checkForChoices()` — Present choices
5. `checkForPuzzle()` — Launch puzzle if exists
6. `onPuzzleComplete()` — Show closing dialogue
7. `completeChapter()` — Save and transition

### PuzzleScene
- Handles all puzzle types
- Spawned as overlay on ChapterScene
- Returns control when complete

**Puzzle Types**:
1. `connection` — Connect matching points with lines
2. `puzzle_pieces` — Drag torn fragments to reconstruct image
3. `match_three` — Tea service collection minigame
4. `sequence` — Perform actions in correct order
5. `maze` — Moth maze navigation
6. `infiltration` — Click each icon 3 times

### SubscriptionGateScene
- Appears before Chapter 3 for non-subscribers
- Chapters 1-2 are free; Chapter 3+ requires subscription

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
    "characters": ["vera", "addie", "rainie"],
    "characterFolders": {
      "vera": "vera_pajamas",
      "addie": "addie_home",
      "rainie": "rainie_pajamas"
    }
  },

  "companions": ["addie", "rainie"],

  "dialogue": {
    "opening": [
      {
        "speaker": "Name",
        "text": "Dialogue text",
        "expression": { "vera": "sad", "rainie": "neutral" },
        "background": "new_background_key",
        "hideCharacters": ["crone"],
        "showCharacters": ["vera", "addie"],
        "showOnlyVera": true,
        "showItem": "notebook_01",
        "launchMothPuzzle": true,
        "launchGearPuzzle": true,
        "fadeToBlack": true,
        "blackScreen": true,
        "suppressAutoShow": true,
        "placeholder": true
      }
    ],
    "midpoint": [ /* optional middle section */ ],
    "closing": [ /* dialogue lines */ ]
  },

  "choices": [
    {
      "text": "Choice description",
      "companion": "addie",
      "consequences": {
        "flag_name": true
      },
      "puzzle": { /* optional per-choice puzzle override */ }
    }
  ],

  "puzzle": {
    "type": "connection",
    "title": "Puzzle Title",
    "instructions": "Instructions..."
  },

  "storyFlags": {
    "flag_name": true
  },

  "nextChapter": 2
}
```

## Character System

### Character Variants
Each character has one or more variant folders:
- `vera`, `vera_pajamas`, `vera_green`, `vera_clockworker`
- `addie`, `addie_home`, `addie_clockworker` (note: `addie` is the default, not `addie_default` in folders)
- `rainie`, `rainie_pajamas`, `rainie_clockworker`
- `guildmaster`, `guildmaster_black`
- `da_default`, `da_moth`, `da_lab`
- `crone_default`, `gentleman_paper`
- `cultist_bookkeeper`, `cultist_enforcer`, `cultist_guard`, `cultist_guard_staff`

### Expression System
Defined in the `CHARACTER_EXPRESSIONS` constant in `ChapterScene.js`:
- Main characters (vera variants, addie variants, rainie variants, guildmaster, guildmaster_black): 16 expressions
- Supporting NPCs (cultists, da variants, crone, gentleman_paper): 8 expressions

Each expression is a separate PNG file: `{variant}_{expression}.png`

### NPC Auto-Show Rules
- `guildmaster` and `cultist_enforcer` always appear when speaking — they cannot be suppressed by `hideCharacters: true`
- `guildmaster`, `cultist_enforcer`, and `cultist_bookkeeper` are autoSolo — they appear alone, hiding other characters
- Other NPCs must be explicitly shown via `showCharacters` in the dialogue JSON

### Character Positioning
- Vera: centered (width/2), depth 10
- Addie: left of center (width/2 - 75), depth 5 (behind Vera)
- Rainie: right of center (width/2 + 90), depth 15 (in front)
- NPCs (Crone, Cultists, etc.): centered (width/2), depth 12
- Crone, Bookkeeper, Gentleman, Guards: horizontally flipped (setFlipX(true))

### Character Scales
- Vera: 0.299
- Addie: 0.358
- Rainie: 0.239

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
    "instructions": "How to solve"
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
        "flag": "some_flag",
        "value": true
      },
      "dialogue": {
        "opening": [
          { "speaker": "Veracity", "text": "Alternate dialogue..." }
        ]
      }
    }
  ]
}
```

## Testing Tips

### Jump to Specific Chapter
```javascript
// In browser console
game.scene.start('ChapterScene', { chapterNumber: 5 });
```

### Inspect Game State
```javascript
console.log(gameStateManager.getState());
gameStateManager.setFlag('test_flag', true);
```

### Clear Save Data
```javascript
localStorage.clear();
```

### Reset Tutorial Flag
```javascript
gameStateManager.setFlag('merge_tutorial_seen', false);
```

## Build Configuration

### Development Build
```bash
npm run dev
```
- Fast hot-reload
- Source maps enabled

### Production Build
```bash
npm run build
```
- Minified code
- Output in `/dist`
- Deploy to GitHub Pages

## Debugging

### Common Issues

**Assets Not Loading**
- Check browser console for 404 errors
- Verify file paths are case-sensitive correct
- Ensure fetch() paths start with `/`

**Dialogue Not Advancing**
- Check for missing `onComplete` callbacks
- Verify dialogue array is not empty

**Puzzles Not Completing**
- Add console.log to completion checks
- Verify puzzle data format matches expected
- Check that `completePuzzle()` is called

**Save/Load Issues**
- Check localStorage quota in browser
- Test in incognito for localStorage issues

## Code Style Guide

### Naming Conventions
- **Classes**: PascalCase (`GameStateManager`)
- **Variables**: camelCase (`currentChapter`)
- **Constants**: UPPER_SNAKE_CASE (`SAVE_KEY`)

### Scene Methods Order
1. `constructor()`
2. `init(data)`
3. `preload()`
4. `create()`
5. Helper methods
6. `update()`
7. `shutdown()`

## Contributing

### Before Submitting Changes
1. Test all 10 chapters
2. Verify save/load works
3. Check all puzzle types function
4. Test on different browsers
5. Ensure no console errors

## Additional Resources

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

## Credits

**Art Direction & Story & Game Design:** Heather Capelli
**Programming:** Claude Sonnet 4.6
