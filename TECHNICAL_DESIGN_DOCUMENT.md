# Veracity - Technical Design Document
## Master Reference for the Complete Game

**Version:** 1.1
**Last Updated:** 2026-03-20
**Engine:** Phaser 3 + Vite
**Language:** JavaScript (ES6+)
**Deployed at:** https://hedrgoblin.github.io/Veracity/

---

## Table of Contents
1. [Game Overview](#game-overview)
2. [Technical Architecture](#technical-architecture)
3. [Core Systems](#core-systems)
4. [Character System](#character-system)
5. [Puzzle Mechanics](#puzzle-mechanics)
6. [Dialogue System](#dialogue-system)
7. [Chapter Structure](#chapter-structure)
8. [Asset Specifications](#asset-specifications)
9. [UI/UX Layout](#uiux-layout)
10. [Code Patterns](#code-patterns)
11. [Complete Game Flow](#complete-game-flow)

---

## Game Overview

### Concept
A steampunk narrative puzzle adventure about Veracity ("Vera"), a young woman whose scientist father (Da, The Professor) has gone missing. With her clockwork companions Addie (a bear) and Rainie (a raccoon), she must solve puzzles, confront the Guildmaster, and discover a truth about her own family.

### Key Features
- 10 chapters across 3 acts
- Branching narrative based on companion choices
- Multiple puzzle types (Connection, Puzzle Pieces, Tea Service, Moth Maze, Gear Puzzle, Sequence, Infiltration)
- Dynamic character expressions (16 for main characters, 8 for NPCs)
- NPC auto-show and auto-solo logic
- Asset replacement without code changes
- Save/load system with auto-save
- Mobile-optimized touch controls
- Subscription gate before Chapter 3

### Story Structure
- **Act 1 (Chapters 1-3):** Discovery — Da is missing; Clockmaker's Guild
- **Act 2 (Chapters 4-7):** Journey — Travels north, infiltrates the sanctuary
- **Act 3 (Chapters 8-10):** Resolution — Confronts the Guildmaster, rescues Da

---

## Technical Architecture

### Project Structure
```
steampunk-journey/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── characters/           # Character sprites (body + expressions)
│   │   │   │   ├── vera/             # Main character default
│   │   │   │   ├── vera_pajamas/     # Chapter 1 variant
│   │   │   │   ├── vera_clockworker/ # Later chapters variant
│   │   │   │   ├── addie/            # Addie default
│   │   │   │   ├── addie_home/       # Home variant
│   │   │   │   ├── addie_clockworker/# Guild variant
│   │   │   │   ├── rainie/           # Rainie default
│   │   │   │   ├── rainie_pajamas/   # Chapter 1 variant
│   │   │   │   ├── rainie_clockworker/# Guild variant
│   │   │   │   ├── crone/            # NPC
│   │   │   │   ├── cultist_bookkeeper/
│   │   │   │   ├── cultist_enforcer/
│   │   │   │   └── gentleman_paper/
│   │   │   ├── backgrounds/          # 1920x1080 scene backgrounds
│   │   │   ├── puzzles/              # Puzzle-specific assets
│   │   │   ├── items/                # Story items
│   │   │   └── ui/                   # UI elements
│   │   └── audio/
│   │       ├── music/
│   │       └── sfx/
│   └── data/
│       └── chapters/                 # chapter_01.json - chapter_10.json
├── src/
│   ├── main.js                       # Phaser config & game entry
│   ├── scenes/
│   │   ├── BootScene.js              # Asset loading
│   │   ├── MainMenuScene.js          # Main menu
│   │   ├── ChapterScene.js           # Core gameplay (dialogue, choices)
│   │   ├── PuzzleScene.js            # All puzzle types
│   │   ├── SettingsScene.js          # Settings menu
│   │   ├── EndingScene.js            # Game endings
│   │   ├── SubscriptionScene.js      # Subscription placeholder
│   │   └── SubscriptionGateScene.js  # Chapter 2+ gate
│   ├── systems/
│   │   ├── GameStateManager.js       # Global state (singleton)
│   │   ├── SaveManager.js            # localStorage save/load
│   │   └── AudioManager.js           # Music/SFX management
│   └── components/
│       └── BackButton.js             # Reusable UI component
├── extract-dialogue.cjs              # Export dialogue to markdown
├── sync-dialogue.cjs                 # Bidirectional dialogue sync
├── package.json
├── vite.config.js
└── index.html
```

### Technology Stack
- **Game Engine:** Phaser 3.88.2
- **Build Tool:** Vite 5.4.21
- **Language:** JavaScript ES6+
- **Data Format:** JSON for chapters, PNG for images, MP3/OGG for audio
- **Storage:** localStorage for saves
- **Deployment:** GitHub Pages (https://hedrgoblin.github.io/Veracity/)

### Build Commands
```bash
npm run dev          # Development server (hot reload)
npm run build        # Production build to /dist
npm run preview      # Preview production build
npm run dialogue:export   # JSON → Markdown
npm run dialogue:import   # Markdown → JSON
npm run dialogue:watch    # Auto-sync dialogue
```

---

## Core Systems

### 1. GameStateManager (Singleton)

**Location:** `src/systems/GameStateManager.js`

**State Structure:**
```javascript
{
  currentChapter: 1,
  completedChapters: [1, 2, 3],
  currentAct: 1,
  companions: {
    addie: { health: 100, met: true },
    rainie: { health: 100, met: true }
  },
  choices: [
    { chapter: 1, companion: 'addie', text: '...' }
  ],
  storyFlags: {
    chapter1_complete: true,
    met_companions: true,
    found_journal: true
    // ... chapter-specific flags
  },
  inventory: [],
  subscriptionActive: false
}
```

**Key Methods:**
```javascript
GameStateManager.getInstance()           // Get singleton instance
.getState()                              // Get full state
.setState(newState)                      // Set full state
.getCurrentChapter()                     // Get current chapter number
.setCurrentChapter(num)                  // Set chapter
.completeChapter(num)                    // Mark chapter complete
.getCompletedChapters()                  // Get array of completed chapters
.addChoice(chapter, companion, text)     // Record player choice
.getChoices()                            // Get all choices
.setFlag(key, value)                     // Set story flag
.getFlag(key)                            // Get story flag value
.getFlags()                              // Get all flags
.resetState()                            // Clear all data
```

**Implementation Notes:**
- Must be initialized before any scene uses it
- State changes trigger localStorage auto-save
- Subscribe to state changes for reactive UI updates

### 2. SaveManager

**Location:** `src/systems/SaveManager.js`

**Save Data Structure:**
```javascript
{
  version: '1.0.0',
  timestamp: 1234567890,
  gameState: { /* GameStateManager state */ },
  metadata: {
    chapterTitle: 'The Workshop',
    playTime: 3600,
    saveSlot: 'slot1' // or 'autosave'
  }
}
```

**Key Methods:**
```javascript
SaveManager.autoSave()                   // Save to 'autosave' slot
SaveManager.saveToSlot(slotName)         // Save to specific slot (slot1/slot2/slot3)
SaveManager.loadFromSlot(slotName)       // Load from slot
SaveManager.getSaveInfo(slotName)        // Get save metadata without loading
SaveManager.deleteSave(slotName)         // Delete save
SaveManager.getAllSaves()                // Get all save metadata
```

**Implementation Notes:**
- Auto-save triggers after each chapter completion
- Version checking prevents incompatible save loads
- localStorage keys: `veracity_save_autosave`, `veracity_save_slot1`, etc.

### 3. ChapterManager

**Location:** Embedded in `ChapterScene.js` (no separate file)

**Functionality:**
- Loads chapter JSON from `/public/data/chapters/`
- Caches loaded chapters for performance
- Handles narrative branching based on choices
- Determines next chapter based on story flags

**Chapter Loading:**
```javascript
// In ChapterScene.js preload()
this.load.json(`chapter_${num}`, `/data/chapters/chapter_${num}.json`);

// In create()
this.chapterData = this.cache.json.get(`chapter_${num}`);
```

### 4. AudioManager

**Location:** `src/systems/AudioManager.js`

**Features:**
- Background music with crossfading
- Sound effect management
- Volume control (music/SFX separate)
- Persistence of volume settings

**Key Methods:**
```javascript
AudioManager.playMusic(key, loop = true)      // Play background music
AudioManager.stopMusic(fadeOut = true)        // Stop music with fade
AudioManager.playSFX(key, volume = 1.0)       // Play sound effect
AudioManager.setMusicVolume(volume)           // 0.0 - 1.0
AudioManager.setSFXVolume(volume)             // 0.0 - 1.0
```

---

## Character System

### Character Architecture

**Layered System:**
- Each character consists of 2 sprites: `body` + `expression`
- Both rendered at same position with different depths
- Expression sprite swaps textures for different emotions

**Character Variants:**
Characters can have multiple variants for different contexts:
- Vera: `vera`, `vera_pajamas`, `vera_green`, `vera_clockworker`
- Addie: `addie`, `addie_home`, `addie_clockworker`
- Rainie: `rainie`, `rainie_pajamas`, `rainie_clockworker`
- Guildmaster: `guildmaster`, `guildmaster_black`
- Da: `da_default`, `da_moth`, `da_lab`
- NPCs: `crone_default`, `gentleman_paper`, `cultist_bookkeeper`, `cultist_enforcer`, `cultist_guard`, `cultist_guard_staff`

### Asset Structure

**Folder Organization:**
```
/characters/
  vera/
    vera_body.png          # 512x512, transparent
    vera_neutral.png       # Expression: neutral face
    vera_happy.png         # Expression: happy face
    vera_sad.png
    vera_surprised.png
    vera_calm.png
    vera_angry.png
    vera_smirk.png
    vera_thinking.png
  vera_pajamas/
    vera_pajamas_body.png
    vera_pajamas_neutral.png
    vera_pajamas_happy.png
    # ... same expressions as base
```

### Character Loading

**Preload Phase:**
```javascript
// Load all variants at boot
loadCharacterImages('vera', 'vera');
loadCharacterImagesWithPrefix('vera_pajamas', 'vera_pajamas');
loadCharacterImagesWithPrefix('vera_clockworker', 'vera_clockworker');
// ... repeat for all variants
```

**Create Phase:**
```javascript
// Determine variant from chapter data
const veraVariant = this.chapterData.assets?.characterFolders?.vera || 'vera';
const veraBodyKey = `${veraVariant}_body`;
const veraNeutralKey = `${veraVariant}_neutral`;

// Create layered sprites
this.characters.vera_body = this.add.image(x, y, veraBodyKey)
  .setScale(0.299)
  .setAlpha(0)
  .setDepth(10);

this.characters.vera_expression = this.add.image(x, y, veraNeutralKey)
  .setScale(0.299)
  .setAlpha(0)
  .setDepth(11); // Slightly in front of body

this.characters.vera = this.characters.vera_body; // Reference
```

### Character Positioning

**Screen Layout (1920x1080 assumed):**
```
Vera:   width/2, girlY (centered)       - Depth 10
Addie:  width/2 - 75 (left)             - Depth 5  (behind Vera)
Rainie: width/2 + 90 (right)            - Depth 15 (in front)
```

**Vertical Positioning:**
```javascript
const dialogueBoxTop = height - 190;
const charHeight = 1674; // Character sprite height
const verticalOffset = 90; // Move down from dialogue box

const girlY = dialogueBoxTop - (charHeight * charScale / 2) + verticalOffset;
const addieY = dialogueBoxTop - (charHeight * addieScale / 2) + verticalOffset;
const rainieY = dialogueBoxTop - (charHeight * rainieScale / 2) + verticalOffset;
```

**Scales:**
- Vera: 0.299 (500px tall target)
- Addie: 0.358 (600px tall target)
- Rainie: 0.239 (400px tall target)

### Character Expressions

**Expression System:**
```javascript
setCharacterExpression(character, expression) {
  // Get variant folder name
  const variant = this.chapterData.assets?.characterFolders?.[character] || character;

  // Build texture key: variant_expression
  const expressionKey = `${variant}_${expression}`;

  // Change expression sprite texture
  const expressionSprite = this.characters[`${character}_expression`];
  if (expressionSprite && this.textures.exists(expressionKey)) {
    expressionSprite.setTexture(expressionKey);
  }
}
```

**Expression Mapping:**
- Main characters (vera variants, addie variants, rainie variants, guildmaster, guildmaster_black): 16 expressions defined in the `CHARACTER_EXPRESSIONS` constant
- Supporting NPCs (cultists, da variants, crone, gentleman_paper): 8 expressions
- Each expression = separate PNG file
- Must exist for each variant: `vera_pajamas_happy.png`, `vera_happy.png`, etc.

### Character Visibility

**Show/Hide Methods:**
```javascript
hideAllCharacters()                          // Fade all to alpha 0
showAllCharacters()                          // Fade all to alpha 1
showOnlyVera()                               // Show only Vera, hide companions
showCharacter(charName)                      // Show specific character
hideCharacter(charName)                      // Hide specific character
```

**Dialogue Properties:**
```json
{
  "hideCharacters": true,                    // Hide all
  "showCharacters": ["vera", "addie"],       // Show specific ones
  "showOnlyVera": true                       // Show only Vera
}
```

**Character Introduction (Companions):**
- Addie starts off-screen left (x = -200)
- Rainie starts off-screen right (x = width + 200)
- Slide in with tween when first speaking (introduceCompanion)

### NPC Characters

**Special Handling:**
- Crone, Guildmaster, Bookkeeper, Gentleman Paper, Guards: Centered (width/2), horizontally flipped (setFlipX(true))
- Cultist Enforcer: Centered (width/2), no flip
- All NPCs: Depth 12 (between Vera and Rainie)

**Auto-Show / Auto-Solo Rules:**
- `guildmaster` and `cultist_enforcer`: Always appear when speaking; cannot be suppressed by `hideCharacters: true`
- `guildmaster`, `cultist_enforcer`, `cultist_bookkeeper`: autoSolo — appear alone, hiding all other characters
- Other NPCs: Must be shown via `showCharacters` in dialogue JSON

---

## Puzzle Mechanics

### 1. Connection Puzzle

**Type:** `connection`
**Description:** Draw lines connecting matching points (gears, springs)

**Configuration:**
```json
{
  "type": "connection",
  "title": "The Study Lock",
  "instructions": "Connect the gears to unlock the door.",
  "points": [
    {
      "id": "gear1",
      "x": -200,      // Relative to center
      "y": -100,
      "pair": "gear2"  // Which point this connects to
    },
    {
      "id": "gear2",
      "x": 200,
      "y": -100,
      "pair": "gear1"
    }
  ]
}
```

**Visual Assets:**
- Background: Chapter-specific (e.g., `puzzle_gear_01.png`)
- Point graphics: `gear_01.png`, `gear_02.png`, `gear_03.png`
- 3 variants to visually differentiate connection types

**Interaction:**
1. Click and hold on a point
2. Drag to create line
3. Release on matching pair point
4. Line turns green if correct, red if incorrect
5. Puzzle completes when all pairs connected

**Implementation Notes:**
- Lines drawn with Phaser graphics.lineBetween()
- Snap distance: Points must be within 50px to connect
- Points rotate and glow on hover for feedback
- Completed lines: green (0x00ff00), failed lines: red (0xff0000)

### 2. Puzzle Pieces

**Type:** `puzzle_pieces`
**Description:** Drag torn fragments to reconstruct complete image

**Configuration:**
```json
{
  "type": "puzzle_pieces",
  "title": "Piece Together the Note",
  "instructions": "Arrange the torn pieces to read the full message.",
  "pieceCount": 7,
  "finalImage": "note_dear_vera"  // Shows when complete
}
```

**Asset Organization:**
```
/puzzles/notes/note_dear_vera/
  piece_01.png  (individual fragments)
  piece_02.png
  ...
  piece_07.png
/items/
  note_dear_vera.png  (final complete image)
```

**Layout System:**
```javascript
// Custom grid layout (not uniform)
const layout = [
  { row: 0, pieces: 2 },  // Top row: 2 pieces
  { row: 1, pieces: 2 },  // Second row: 2 pieces
  { row: 2, pieces: 1 },  // Middle row: 1 piece
  { row: 3, pieces: 2 }   // Bottom row: 2 pieces
];
```

**Interaction:**
1. Pieces scattered randomly on screen
2. Drag piece near correct position
3. Snaps into place if within 60px of target
4. Locked in place after snapping
5. Complete image revealed when all pieces placed
6. Click anywhere to continue

**Implementation Notes:**
- Pieces start randomized within play area bounds
- Snap threshold: 60px from target position
- Visual feedback: Pieces slightly transparent until snapped
- Completed puzzle shows final image with dim background

### 3. Collection Game

**Type:** `match_three` (legacy name, actually just collection)
**Description:** Click floating items to collect them

**Configuration:**
```json
{
  "type": "match_three",
  "title": "Brewing Comfort",
  "instructions": "Collect ingredients before the water boils!",
  "collectibles": {
    "teacup": 3,    // Need to collect 3 teacups
    "tea_leaf": 3,
    "sugar": 3,
    "cream": 3
  }
}
```

**Asset Organization:**
```
/puzzles/tea/
  teacup_white.png
  teacup_metal.png
  teacup_floral.png
  tealeaves_01.png
  tealeaves_02.png
  tealeaves_03.png
  sugar_01.png
  sugar_02.png
  sugar_03.png
  cream_01.png
  cream_02.png
  cream_03.png
```

**Visual Elements:**
- Custom background: `puzzle_tea_01.png`
- Header bar shows collection progress
- Items float and gently animate
- Collected items briefly scale up then disappear

**Interaction:**
1. Items spawn randomly on screen
2. Click item to collect
3. Progress updates in header
4. New items spawn periodically
5. Completes when all goals met

**Implementation Notes:**
- Item spawn rate: Every 2000ms
- Max items on screen: 12
- Float animation: sin wave movement
- Tutorial overlay on first play (stored in save data)

### 4. Sequence Puzzle

**Type:** `sequence`
**Description:** Perform actions in correct order (kick, whistle/hum)

**Configuration:**
```json
{
  "type": "sequence",
  "title": "The Secret Panel",
  "instructions": "Follow Da's secret sequence to open the hidden compartment.",
  "steps": [
    { "action": "kick", "count": 3, "label": "Kick" },
    { "action": "hum", "count": 3, "label": "Hum" },
    { "action": "kick", "count": 1, "label": "Kick" }
  ]
}
```

**Visual Elements:**
- Background: Changes to safe/desk background during puzzle
- Action buttons: kick_01.png, whistle.png icons
- Progress display: "Kick 1/3" text
- Visual feedback: Flash and "kick" text animation on action

**Interaction:**
1. Tap action button (kick or hum)
2. Visual feedback (flash, text animation)
3. Progress counter updates
4. Moves to next step when count reached
5. Completes when all steps done
6. Background changes to safe_open.png

**Implementation Notes:**
- Only active buttons shown (hide inactive ones)
- Instructions at bottom with semi-transparent background
- Special: 3rd whistle shows 8 notes instead of 3, longer duration
- Kick flash: 400ms duration
- Flying "kick" text: white, 0.7 alpha, moves to top-right
- Completion: Hide all UI, show "Click to continue"

### 5. Moth Maze

**Type:** `maze`
**Description:** Navigate a branching moth maze
**Chapter:** 3 (first of two Chapter 3 puzzles)
**Triggered by:** `launchMothPuzzle` directive in dialogue JSON

### 6. Gear Puzzle (Clockmakers Lock)

**Type:** `gear` (clockmakers)
**Description:** Solve the clockmakers gear lock
**Chapter:** 3 (second of two Chapter 3 puzzles)
**Triggered by:** `launchGearPuzzle` directive in dialogue JSON

### 7. Infiltration Puzzle

**Type:** `infiltration`
**Description:** Sneaking game — click each icon 3 times to get past guards
**Chapters:** 5-6

---

## Dialogue System

### Dialogue Structure

**Three-Section Format:**
```json
{
  "dialogue": {
    "opening": [ /* dialogue lines */ ],
    "midpoint": [ /* optional middle section */ ],
    "closing": [ /* dialogue lines */ ]
  }
}
```

**Puzzle Placement:**
- Main puzzle appears after `opening` section
- Optional second puzzle (e.g., `deskPuzzle`) after `midpoint`
- `closing` section shows after all puzzles complete

### Dialogue Line Schema

**Basic Line:**
```json
{
  "speaker": "Narrator",  // or character name
  "text": "The dialogue text here."
}
```

**With Expression:**
```json
{
  "speaker": "Veracity",
  "text": "I'm worried about father.",
  "expression": {
    "vera": "sad",           // Character: emotion
    "rainie": "neutral"      // Multiple characters can change
  }
}
```

**With Special Properties:**
```json
{
  "speaker": "Narrator",
  "text": "You step into the darkness.",
  "background": "clockmakers_guild_hall_01",  // Change background
  "crossfadeBackground": "new_bg_key",         // Cross-fade to new background
  "brightenEffect": true,                      // Screen brighten effect
  "hideCharacters": true,                      // Hide all characters
  "showCharacters": ["vera", "addie"],         // Show specific ones
  "hideCharacters": ["crone"],                 // Hide specific one (array form)
  "showOnlyVera": true,                        // Show only Vera
  "showItem": "notebook_01",                   // Display story item
  "slideIn": "addie",                          // Slide character in from off-screen
  "swapCharacters": ["vera", "rainie"],        // Swap visible characters
  "moveCharacters": { "vera": "left" },        // Move characters
  "launchMothPuzzle": true,                    // Launch moth maze
  "launchGearPuzzle": true,                    // Launch clockmakers gear puzzle
  "fadeToBlack": true,                         // Fade to black
  "blackScreen": true,                         // Instant black screen
  "suppressAutoShow": true,                    // Prevent auto-show of speaker
  "placeholder": true                          // Placeholder marker
}
```

### Dialogue Processing

**Flow:**
1. Display speaker name and text
2. Apply expression changes (if specified)
3. Change background (if specified)
4. Show/hide characters (if specified)
5. Show item (if specified)
6. Ensure speaking character visible (unless hidden)
7. Type out text with 30ms delay per character
8. Wait for click to advance

**Speaker Mapping:**
```javascript
const speakerMap = {
  'narrator': null,                          // No character sprite
  'veracity': 'vera',
  'vera': 'vera',
  'addie': 'addie',
  'rainie': 'rainie',
  'crone': 'crone_default',
  'guildmaster': 'guildmaster',
  'cultist_bookkeeper': 'cultist_bookkeeper',
  'cultist_enforcer': 'cultist_enforcer',
  'cultist_guard': 'cultist_guard',
  'cultist_guard_staff': 'cultist_guard_staff',
  'gentleman_paper': 'gentleman_paper',
  'father': 'da_default',
  'da': 'da_default'
};
```

### Item Display

**Item Positioning:**
```javascript
// Special case: Compass/lid
if (itemKey === 'lide_compass') {
  itemX = width / 2;
  itemY = height * 0.4;        // Above dialogue box
  maxWidth = width * 0.72;      // 20% smaller than normal
  maxHeight = height * 0.72;
}
// Normal items
else {
  itemX = width / 2;
  itemY = height / 2;           // Centered
  maxWidth = width * 0.9;
  maxHeight = height * 0.9;
}
```

**Item Display Effects:**
- Dimmed background overlay (0.7 alpha black)
- Characters hidden
- Item fades in over 600ms
- Click anywhere to dismiss

### Dialogue Export/Import

**Bidirectional Sync:**
```bash
node sync-dialogue.cjs export  # JSON → GAME_DIALOGUE.md
node sync-dialogue.cjs import  # GAME_DIALOGUE.md → JSON
node sync-dialogue.cjs watch   # Auto-sync both ways
```

**Markdown Format:**
```markdown
## CHAPTER 1: The Workshop

### Opening Scene

*Narrator text in italics*
  *[Expressions: Vera: sad, Rainie: happy]*

**Character Name:** Dialogue text
  *[Expressions: Vera: neutral]*

### Closing Scene

*More text...*
```

**Import Rules:**
- Syncs: speaker, text, expressions
- Preserves: showItem, hideCharacters, background, showOnlyVera
- Filters out puzzle markers (Type:, Instructions:)
- Matches by line position (line 1 → line 1)

---

## Chapter Structure

### Chapter JSON Schema

**Complete Structure:**
```json
{
  "chapterNumber": 1,
  "title": "The Workshop",
  "act": 1,
  "description": "Brief chapter description",

  "assets": {
    "background": "home_hallway_day",
    "music": null,
    "characters": ["vera", "addie", "rainie"],
    "characterFolders": {
      "vera": "vera_pajamas",
      "addie": "addie_home",
      "rainie": "rainie_pajamas"
    }
  },

  "companions": ["addie", "rainie"],

  "dialogue": {
    "opening": [ /* dialogue lines */ ],
    "midpoint": [ /* optional */ ],
    "closing": [ /* dialogue lines */ ]
  },

  "puzzle": {
    "type": "connection",
    "title": "Puzzle Title",
    "instructions": "Instructions...",
    /* type-specific config */
  },

  "deskPuzzle": {
    /* optional second puzzle */
  },

  "choices": [
    {
      "text": "Choice text...",
      "companion": "addie",
      "consequences": {
        "careful_approach": true
      },
      "puzzle": {
        /* optional puzzle override */
      }
    }
  ],

  "storyFlags": {
    "chapter1_complete": true,
    "met_companions": true
  },

  "nextChapter": 2
}
```

### Chapter Flow

**Standard Flow:**
1. Load chapter JSON
2. Set background, music, create characters
3. Show opening dialogue
4. Present player choice (if exists)
5. Show puzzle (specific to choice or default)
6. Show midpoint dialogue (if exists)
7. Show second puzzle (if exists)
8. Show closing dialogue
9. Mark chapter complete, proceed to next

**Choice System:**
```json
{
  "choices": [
    {
      "text": "Careful approach (Addie)",
      "companion": "addie",
      "consequences": { "careful_approach": true },
      "puzzle": { /* Addie's puzzle */ }
    },
    {
      "text": "Bold action (Rainie)",
      "companion": "rainie",
      "consequences": { "bold_action": true },
      "puzzle": { /* Rainie's puzzle */ }
    }
  ]
}
```

### Character Variant System

**Mapping:**
```json
"characterFolders": {
  "vera": "vera_pajamas",      // Use pajamas variant
  "addie": "addie_home",        // Use home variant
  "rainie": "rainie_clockworker" // Use clockworker variant
}
```

**Expression Lookup:**
- Expression key in dialogue: `"vera": "happy"`
- Variant folder: `vera_pajamas` (from characterFolders)
- Texture loaded: `vera_pajamas_happy`

**If No Variant Specified:**
- Falls back to base: `vera`, `addie`, `rainie`
- Texture loaded: `vera_happy`

---

## Asset Specifications

### Character Assets

**File Structure:**
```
/characters/
  {character_name}/
    {character_name}_body.png       # Required
    {character_name}_neutral.png    # Required
    {character_name}_happy.png      # Optional expressions
    {character_name}_sad.png
    {character_name}_surprised.png
    {character_name}_calm.png
    {character_name}_angry.png
    {character_name}_smirk.png
    {character_name}_thinking.png
```

**Specifications:**
- **Format:** PNG with transparency
- **Dimensions:** 512x512px recommended
- **Character Height:** 1674px in-world (before scaling)
- **Naming:** Must match folder name prefix

**Required Files (Minimum):**
- `{name}_body.png`
- `{name}_neutral.png`

### Background Assets

**Location:** `/public/assets/images/backgrounds/`

**Specifications:**
- **Format:** PNG
- **Dimensions:** 1920x1080px (16:9 aspect ratio)
- **Naming:** Descriptive snake_case (e.g., `home_hallway_day.png`)

**Current Backgrounds:**
- home_hallway_day
- home_office_day
- home_office_ransacked_day
- home_office_ransacked_day_revealed
- home_office_safe_closed
- home_office_safe_open
- london_alley
- clockmakers_guild_door
- clockmakers_guild_hall_01
- clockmakers_guild_hall_02
- clockmakers_guild_maproom
- northern_sanctuary_ext
- train_carraige
- train_ext
- puzzle_gear_01
- puzzle_gear_clockmakers_01
- puzzle_tea_01

### Item Assets

**Location:** `/public/assets/images/items/`

**Items:**
- notebook_01.png - Father's journal
- lide_compass.png - Tracking compass in box lid
- moth.png - Mechanical moth
- note_dear_vera.png - Complete note (after puzzle)
- note_dear_vera_02.png - Second note

### Puzzle Assets

**Gears (Connection Puzzle):**
```
/puzzles/gears/
  gear_01.png  (128x128)
  gear_02.png
  gear_03.png
```

**Note Fragments (Puzzle Pieces):**
```
/puzzles/notes/{note_name}/
  piece_01.png
  piece_02.png
  ...
```

**Tea Items (Collection Puzzle):**
```
/puzzles/tea/
  teacup_{variant}.png    (3 variants)
  tealeaves_{num}.png     (3 variants)
  sugar_{num}.png         (3 variants)
  cream_{num}.png         (3 variants)
```

**Sequence Puzzle:**
```
/puzzles/safe/
  kick_01.png
  kick_02.png   (flash version)
  whistle.png
  musical_note.png
```

### Audio Assets (Planned)

**Location:** `/public/assets/audio/`

**Music:** `/audio/music/`
- Background tracks per chapter/act
- Format: MP3 or OGG
- Loop-friendly (clean start/end)

**SFX:** `/audio/sfx/`
- UI sounds (click, hover)
- Puzzle sounds (success, fail, connect)
- Ambient sounds per scene

---

## UI/UX Layout

### Screen Dimensions
- **Base Resolution:** 1920x1080 (16:9)
- **Responsive:** Scales to fit viewport
- **Camera:** Phaser camera with auto-scaling

### Dialogue Box

**Position:**
```javascript
const dialogueBoxY = height - 190;  // Bottom of screen
const dialogueBoxHeight = 150;
const padding = 20;
```

**Layout:**
- Background: Semi-transparent black (0.7 alpha) with brown border
- Speaker name: Top-left, white text, 32px font
- Dialogue text: Below speaker, white text, 28px font
- Click zone: Full box clickable to advance

### Character Positions

**Detailed Positioning:**
```javascript
// Vertical anchor point (bottom of dialogue box + offset)
const dialogueBoxTop = height - 190;
const charHeight = 1674;
const verticalOffset = 90;

// Calculate Y positions (center of sprite)
const veraY = dialogueBoxTop - (charHeight * 0.299 / 2) + verticalOffset;
const addieY = dialogueBoxTop - (charHeight * 0.358 / 2) + verticalOffset;
const rainieY = dialogueBoxTop - (charHeight * 0.239 / 2) + verticalOffset;

// X positions
const veraX = width / 2;          // Centered
const addieX = width / 2 - 75;    // Left of center
const rainieX = width / 2 + 90;   // Right of center

// Depths
const addieDepth = 5;   // Back
const veraDepth = 10;   // Middle
const rainieDepth = 15; // Front
```

### Chapter Title

**Position:**
```javascript
const titleY = 60;  // Top of screen
const titleX = width / 2;  // Centered
```

**Style:**
- Font: 48px bold
- Color: Brown (#8b5c31)
- Fade in on chapter start
- Fade out after 3000ms

### Puzzle UI

**Connection Puzzle:**
- Points positioned relative to center
- Lines drawn dynamically
- Instructions: Top center, semi-transparent background

**Puzzle Pieces:**
- Title: Top center
- Instructions: Below title
- Play area: Full screen except top 150px
- Completed image: Centered with dim overlay

**Collection Game:**
- Header bar: Top, shows progress icons
- Instructions: Below header
- Items: Spawn in main play area
- Tutorial overlay: First-time only

**Sequence Puzzle:**
- Title: Top center
- Instructions: Bottom center with dialog box
- Progress: Below title (e.g., "Kick 2/3")
- Action buttons: Center-left and center-right, large (150x150)

### Main Menu

**Layout:**
- Title: Top center
- Buttons: Centered column
  - Continue (if save exists)
  - New Game
  - Settings
  - Subscribe (shows status)
- Button style: Brown background, white text

### Settings Menu

**Elements:**
- Music volume slider
- SFX volume slider
- Back button
- Values persist to localStorage

---

## Code Patterns

### Scene Lifecycle

**Every Scene:**
```javascript
class MyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MyScene' });
  }

  init(data) {
    // Receive data from previous scene
    this.passedData = data;
  }

  preload() {
    // Load assets
    this.load.image('key', 'path');
  }

  create() {
    // Setup scene
    // Create game objects
    // Add event listeners
  }

  update(time, delta) {
    // Game loop (optional)
  }
}
```

### Scene Transitions

**Pattern:**
```javascript
// From Scene A to Scene B with data
this.scene.start('SceneB', {
  chapterNumber: 2,
  someData: value
});

// Pause current scene, launch overlay
this.scene.pause();
this.scene.launch('OverlayScene');

// Resume from overlay
this.scene.resume('MainScene');
this.scene.stop('OverlayScene');
```

### Tweens (Animations)

**Fade In:**
```javascript
this.tweens.add({
  targets: sprite,
  alpha: 1,
  duration: 400,
  ease: 'Linear'
});
```

**Slide In:**
```javascript
this.tweens.add({
  targets: sprite,
  x: targetX,
  duration: 800,
  ease: 'Power2'
});
```

**Scale Pulse:**
```javascript
this.tweens.add({
  targets: sprite,
  scaleX: 1.1,
  scaleY: 1.1,
  duration: 200,
  yoyo: true,
  repeat: 0
});
```

### Input Handling

**Click/Tap:**
```javascript
sprite.setInteractive({ useHandCursor: true });
sprite.on('pointerdown', () => {
  // Handle click
});

// Click zone (invisible)
const zone = this.add.rectangle(x, y, width, height)
  .setInteractive()
  .on('pointerdown', callback);
```

**Drag:**
```javascript
sprite.setInteractive({ draggable: true });
this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
  gameObject.x = dragX;
  gameObject.y = dragY;
});
```

### Graphics Drawing

**Line:**
```javascript
const graphics = this.add.graphics();
graphics.lineStyle(4, 0x00ff00); // width, color
graphics.lineBetween(x1, y1, x2, y2);
```

**Rectangle:**
```javascript
const rect = this.add.rectangle(x, y, width, height, color, alpha);
```

**Circle:**
```javascript
const circle = this.add.circle(x, y, radius, color, alpha);
```

### Text Handling

**Create Text:**
```javascript
const text = this.add.text(x, y, 'Text', {
  fontFamily: 'Georgia, serif',
  fontSize: '32px',
  color: '#ffffff',
  align: 'center',
  wordWrap: { width: 800 }
}).setOrigin(0.5);
```

**Typewriter Effect:**
```javascript
let currentChar = 0;
const fullText = "The full dialogue text";
const timer = this.time.addEvent({
  delay: 30,
  repeat: fullText.length - 1,
  callback: () => {
    currentChar++;
    textObject.setText(fullText.substring(0, currentChar));
  }
});
```

---

## Complete Game Flow

### Boot Sequence

1. **index.html loads**
2. **main.js initializes Phaser**
   ```javascript
   const config = {
     type: Phaser.AUTO,
     width: 1920,
     height: 1080,
     scene: [BootScene, MainMenuScene, ChapterScene, PuzzleScene, ...]
   };
   const game = new Phaser.Game(config);
   ```
3. **BootScene runs**
   - Shows loading bar
   - Preloads common assets
   - Loads all character variants
   - Loads all backgrounds
   - Initializes GameStateManager
4. **Transition to MainMenuScene**

### Main Menu Flow

**MainMenuScene:**
1. Check for existing save
2. Show Continue button if save exists
3. Show New Game, Settings, Subscribe buttons
4. User clicks Continue → Load save, go to saved chapter
5. User clicks New Game → Reset state, go to Chapter 1
6. User clicks Settings → Launch SettingsScene overlay

### Chapter Flow

**ChapterScene:**
1. **Init:** Receive `{ chapterNumber }`
2. **Preload:** Load chapter JSON
3. **Create:**
   - Set background
   - Create character sprites (using variant folders)
   - Setup dialogue box
   - Show chapter title
4. **Show opening dialogue**
   - Process each line with expressions/visibility
5. **Present choice** (if exists)
   - Show choice buttons with companion icons
   - User selects → Record choice, set consequences
6. **Transition to PuzzleScene**
   - Pass puzzle config and chapter number
7. **Return from puzzle**
   - Show midpoint dialogue (if exists)
   - Show second puzzle (if exists)
8. **Show closing dialogue**
9. **Complete chapter:**
   - Mark chapter complete in GameStateManager
   - Auto-save
   - Transition to next chapter

### Puzzle Flow

**PuzzleScene:**
1. **Init:** Receive `{ chapterNumber, puzzleData }`
2. **Create:** Setup based on puzzle type
   - connection → Create points, enable line drawing
   - puzzle_pieces → Scatter pieces, enable dragging
   - match_three → Spawn collectible items
   - sequence → Create action buttons, track progress
3. **User interaction loop**
4. **Puzzle complete:**
   - Show success feedback
   - Record puzzle completion
   - Return to ChapterScene

### Save System Flow

**Auto-Save (After Chapter):**
```javascript
GameStateManager.completeChapter(chapterNum);
SaveManager.autoSave();
```

**Manual Save (Settings Menu):**
```javascript
SaveManager.saveToSlot('slot1');
```

**Load Save:**
```javascript
const saveData = SaveManager.loadFromSlot('slot1');
GameStateManager.setState(saveData.gameState);
this.scene.start('ChapterScene', {
  chapterNumber: saveData.gameState.currentChapter
});
```

### Ending Flow

**After Chapter 10:**
1. Calculate ending based on choices
2. Transition to EndingScene
3. Show ending narrative
4. Show credits
5. Return to main menu
6. Save completion flag

---

## Implementation Status

### Completed
- [x] Vite + Phaser 3 project setup
- [x] All 10 chapter JSON files
- [x] GameStateManager, SaveManager, AudioManager
- [x] All scene types (BootScene, MainMenuScene, ChapterScene, PuzzleScene, SettingsScene, EndingScene, SubscriptionScene, SubscriptionGateScene)
- [x] Full character variant system with expression layers
- [x] Dialogue system with typewriter, expressions, visibility controls
- [x] All dialogue directives (hideCharacters, showCharacters, showOnlyVera, showItem, crossfadeBackground, slideIn, swapCharacters, moveCharacters, launchMothPuzzle, launchGearPuzzle, fadeToBlack, blackScreen, suppressAutoShow, placeholder)
- [x] NPC auto-show and auto-solo logic
- [x] Connection puzzle
- [x] Puzzle Pieces puzzle
- [x] Tea service minigame (Collection)
- [x] Sequence puzzle
- [x] Moth maze puzzle
- [x] Gear puzzle (clockmakers lock)
- [x] Infiltration puzzle (chapters 5-6)
- [x] Subscription gate (before Chapter 3)
- [x] Save/load system (auto + 3 manual slots)
- [x] JUMP debug button (chapters 1-10)
- [x] Dialogue export/import sync tools
- [x] Production build — deployed to GitHub Pages

---

## Quick Reference

### Common Commands
```bash
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run dialogue:export        # Export dialogue
npm run dialogue:import        # Import dialogue
```

### Key File Locations
```
Chapter data:    /public/data/chapters/chapter_XX.json
Characters:      /public/assets/images/characters/{name}/
Backgrounds:     /public/assets/images/backgrounds/
Main game logic: /src/scenes/ChapterScene.js
Puzzles:         /src/scenes/PuzzleScene.js
State:           /src/systems/GameStateManager.js
```

### Debug Shortcuts
```javascript
// Jump to chapter
game.scene.start('ChapterScene', { chapterNumber: 3 });

// Reset state
gameStateManager.resetState();

// Test puzzle
game.scene.start('PuzzleScene', {
  chapterNumber: 2,
  puzzleData: { type: 'connection', ... }
});
```

### Important Constants
```javascript
DIALOGUE_BOX_Y = height - 190
CHARACTER_SCALE_VERA = 0.299
CHARACTER_SCALE_ADDIE = 0.358
CHARACTER_SCALE_RAINIE = 0.239
DEPTH_ADDIE = 5
DEPTH_VERA = 10
DEPTH_RAINIE = 15
TYPEWRITER_DELAY = 30ms
```

---

## Version History

- **v1.0** (2026-02-27): Initial comprehensive technical design document
- **v1.1** (2026-03-20): Updated to reflect finished 10-chapter game; removed chapters 11-14; added all NPC characters, full puzzle list, new dialogue directives

---

**This document reflects the finished state of Veracity — a 10-chapter steampunk narrative puzzle adventure.**

**Credits:** Art Direction & Story & Game Design: Heather Capelli | Programming: Claude Sonnet 4.6
