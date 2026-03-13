# VERACITY - Complete Game Overview

## Table of Contents
1. [Game Concept](#game-concept)
2. [Story & Narrative](#story--narrative)
3. [Characters](#characters)
4. [Game Mechanics](#game-mechanics)
5. [Technical Architecture](#technical-architecture)
6. [Chapter Structure](#chapter-structure)
7. [Art System](#art-system)
8. [Development Roadmap](#development-roadmap)
9. [How to Play](#how-to-play)

---

## Game Concept

**Genre:** Narrative Puzzle Adventure
**Platform:** Web (Mobile-optimized for iPhone X - 375x812)
**Inspiration:** Florence, Monument Valley, Gris
**Theme:** Truth, agency, family, self-discovery
**Aesthetic:** Steampunk-whimsical with emotional depth

### Core Premise
Veracity (nicknamed "Vera"), a 10-year-old girl, must rescue her scientist father who has been kidnapped by a mysterious cult seeking his incomplete time travel device. Accompanied by two robot companions—Addie (a cautious bear) and Rainie (an adventurous raccoon)—she embarks on a journey that transforms her from a dependent child into a confident young person who discovers her own agency.

### Current Implementation Status
**Chapters 1-2 Fully Implemented** | **Subscription System Active** | **Item Display System** | **Dialogue Export Tool**

**Key Features Now Available:**
- ✅ Complete Chapter 1 & 2 with branching narrative
- ✅ Three puzzle types: Connection (gears), Puzzle Pieces (note), Collection (tea)
- ✅ Subscription system (Chapter 1 free, placeholder for Chapter 2+)
- ✅ Dynamic character expressions with folder system (e.g., addie_home)
- ✅ Item display system (notebook reveals with dramatic presentation)
- ✅ Character scaling (Vera 10% larger when alone for emphasis)
- ✅ Save/Load system with subscription persistence
- ✅ Dialogue extraction tool (`extract-dialogue.cjs`)
- ✅ Terminology updates (companions call father "the professor")

---

## Story & Narrative

### The Mystery Arc

**Act 1: Discovery (Chapters 1-5)**
- Chapter 1: "The Workshop" - Veracity discovers her father ("Da") missing
- Chapter 2: "The Empty Study" - Finding clues in Da's research
- Chapter 3: "The Missing Papers" - Discovery of the kidnapping
- Chapter 4: "The Stranger's Warning" - A mysterious stranger offers cryptic help
- Chapter 5: "Into the Unknown" - Beginning the search beyond home

**Act 2: Journey (Chapters 6-10)**
- Chapter 6: "The Order's Territory" - Discovering the cult's headquarters
- Chapter 7: "Inside the Compound" - Infiltrating the Order
- Chapter 8: "The Incomplete Device" - Learning the truth about Da's invention
- Chapter 9: "The Moth's Secret" - Discovering the missing component
- Chapter 10: "Breaking Point" - Veracity faces her greatest challenge

**Act 3: Resolution (Chapters 11-14)**
- Chapter 11: "The Rescue" - Saving Da from the Order
- Chapter 12: "The Device Destroyed" - Preventing the cult's plans
- Chapter 13: "Home Again" - Returning to normalcy, changed
- Chapter 14: "The Music Box" - A mysterious ending suggesting mother might be alive

### Core Themes
- **Truth vs. Deception** (Veracity = Truth)
- **Agency & Growth** - From dependent child to confident individual
- **Chosen Family** - Addie and Rainie as surrogate family
- **Science & Mystery** - Steampunk technology meets emotional storytelling
- **Hope & Loss** - Dealing with grief while finding strength

---

## Characters

### Veracity ("Vera")
- **Age:** 10 years old
- **Role:** Protagonist
- **Character Arc:** Grows from dependent to confident, discovers agency
- **Key Traits:** Curious, determined, compassionate
- **Art:** Individual expression images (happy, sad, neutral, surprised, smirk)
- **Folder:** `/assets/images/characters/girl/`
- **Code Reference:** "girl" (dialogue uses "Veracity")

### Addie (The Bear)
- **Type:** Robot companion
- **Personality:** Cautious, protective, risk-averse
- **Voice:** Gentle, caring, worried
- **Represents:** The safe path, security, caution
- **Art Variants:**
  - Default: `/assets/images/characters/addie/`
  - At Home: `/assets/images/characters/addie_home/`
- **Size:** 0.2205 scale (75% bigger than base)

### Rainie (The Raccoon)
- **Type:** Robot companion
- **Personality:** Adventurous, impulsive, bold
- **Voice:** Excited, playful, reckless
- **Represents:** The risky path, adventure, courage
- **Art:** `/assets/images/characters/rainie/`
- **Size:** 0.189 scale (50% bigger than base)

### Da (The Father)
- **Role:** Captured scientist, catalyst for journey
- **Backstory:** Brilliant inventor working on time travel
- **Device:** "Temporal Resonance Device" (incomplete)
- **Status:** Kidnapped by the Order

### The Order (Antagonists)
- **Type:** Dark cult
- **Goal:** Force Da to complete his time travel device
- **Aesthetic:** Gray uniforms, industrial compound
- **Motivation:** Power through temporal manipulation

---

## Game Mechanics

### 1. Dialogue System
- **Typewriter Effect:** Text appears character-by-character (30ms delay)
- **Speaker Labels:** Character names shown above dialogue
- **Tap to Continue:** Player advances dialogue at their pace
- **Narration:** Concise, atmospheric text from "Narrator"
- **Expression System:** Characters display emotions via overlays

### 2. Choice System
- **Binary Choices:** Two options per decision point
- **Companion-Based:** Choices align with Addie (safe) or Rainie (risky)
- **Consequences:** Tracked in game state, affect narrative branches
- **Visual Design:** Colored labels (Addie: copper, Rainie: blue)

### 3. Implemented Puzzle Types

#### A. Connection Puzzles ✅
- **Mechanic:** Draw lines between matching points
- **Theme:** Gears, springs, mechanisms
- **Implementation:** Click-drag line drawing with validation
- **Assets:** Custom gear images (gear_01, gear_02, gear_03 at 120px)
- **Background:** puzzle_gear_01.png
- **Features:** Gears rotate and glow on hover
- **Example:** "The Study Lock" (Chapter 1 - Rainie's path)

#### B. Puzzle Pieces ✅
- **Mechanic:** Drag torn fragments to reconstruct complete image
- **Theme:** Torn notes, fragmented memories, broken documents
- **Implementation:** Custom grid layouts, snap-to-place with distance detection
- **Assets:** Individual fragment PNGs + complete image reveal
- **Features:** Non-uniform grids (e.g., 2-2-1-2 pattern), click to continue after completion
- **Example:** "Piece Together the Note" (Chapter 2)

#### C. Merge Game ✅
- **Mechanic:** Combine matching items (Level 1 + Level 1 = Level 2)
- **Theme:** Tea brewing, crafting, alchemy
- **Implementation:** 5x5 grid, drag-to-merge, periodic spawning
- **Assets:** Image-based items (teacups, tea leaves, sugar, cream)
- **Background:** puzzle_tea_01.png
- **Features:**
  - Tutorial system (shown on first play, saved to game state)
  - Satchel storage for temporary item removal
  - Goal tracking with visual progress
  - No timer - zen-like gameplay
- **Example:** "Brewing Comfort" (Chapter 1 - Addie's path)

#### D. Rhythm Puzzles ⏳ (Planned)
- **Mechanic:** Tap patterns in time with visual/audio cues
- **Theme:** Breathing exercises, music boxes, synchronization
- **Implementation:** Timing-based input with tolerance windows
- **Feedback:** Visual pulse circle with hit detection

#### E. Gather & Sort Puzzles ⏳ (Framework Exists)
- **Mechanic:** Drag items to correct slots
- **Theme:** Repair tasks, organizing clues, inventory
- **Implementation:** Drag-and-drop with slot validation

### 4. Companion Health System
- **Health Tracking:** Addie and Rainie can be damaged
- **Consequences:** Low health affects narrative options
- **Repair Quests:** Side puzzles to fix damaged companions
- **Status:** Displayed in game state manager

### 5. Save/Load System
- **Auto-Save:** After each chapter completion
- **Manual Save:** Available from main menu
- **Storage:** localStorage with JSON serialization
- **Data Saved:**
  - Current chapter
  - Completed chapters
  - Companion health
  - Player choices
  - Story flags
  - Inventory items

---

## Technical Architecture

### Technology Stack
- **Game Engine:** Phaser 3 (v3.80.1)
- **Language:** JavaScript (ES6+)
- **Build Tool:** Vite (v5.0.0)
- **Deployment:** Static web hosting (Netlify/Vercel/itch.io)

### Project Structure
```
steampunk-journey/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── characters/
│   │   │   │   ├── vera/           # Protagonist
│   │   │   │   ├── addie/          # Bear (default)
│   │   │   │   ├── addie_home/     # Bear (at home variant)
│   │   │   │   └── rainie/         # Raccoon
│   │   │   ├── backgrounds/        # 375x812 or 750x1624 PNG
│   │   │   └── puzzles/
│   │   │       └── gears/          # Connection puzzle assets
│   │   └── audio/
│   │       ├── music/
│   │       └── sfx/
│   └── data/
│       └── chapters/               # chapter_01.json to chapter_14.json
├── src/
│   ├── main.js                     # Entry point
│   ├── scenes/
│   │   ├── BootScene.js           # Asset loading
│   │   ├── MainMenuScene.js       # Main menu
│   │   ├── ChapterScene.js        # Main gameplay
│   │   ├── PuzzleScene.js         # Puzzle mechanics
│   │   ├── SettingsScene.js       # Settings
│   │   └── EndingScene.js         # Game complete
│   ├── systems/
│   │   ├── GameStateManager.js    # Global state (singleton)
│   │   ├── SaveManager.js         # localStorage save/load
│   │   ├── ChapterManager.js      # Chapter loading
│   │   └── AudioManager.js        # Music/SFX
│   └── components/
│       └── BackButton.js          # Reusable back button
└── index.html
```

### Key Systems

#### GameStateManager (Singleton)
```javascript
state = {
  currentChapter: 1,
  completedChapters: [],
  companions: {
    addie: { name: 'Addie', health: 100, isDamaged: false },
    rainie: { name: 'Rainie', health: 100, isDamaged: false }
  },
  girl: { confidence: 0, agency: 0 },
  choices: [],
  storyFlags: {},
  inventory: [],
  completedPuzzles: []
}
```

#### ChapterScene Flow
1. **preload()** - Load chapter JSON, determine character folders, load assets
2. **create()** - Set up background, characters, UI
3. **startNarrative()** - Show opening dialogue
4. **checkForChoices()** - Display decision points
5. **checkForPuzzle()** - Launch puzzle scene
6. **completeChapter()** - Save progress, advance to next

#### Character Loading System
- **Modular Art:** Body + expression overlays (1062x1674px)
- **Dynamic Folders:** Supports location variants (e.g., addie_home)
- **Fallback System:** Sprite sheets → Individual images → Placeholder
- **Expression Mapping:** 10 expressions (neutral, calm, happy_subtle, happy, sad, angry, disgusted, surprised, asleep, smirk)

---

## Chapter Structure

### JSON Format
```json
{
  "chapterNumber": 1,
  "title": "The Workshop",
  "act": 1,
  "description": "Brief chapter description",

  "assets": {
    "background": "home_hallway_day",
    "music": null,
    "characters": ["girl", "addie", "rainie"],
    "characterFolders": {
      "addie": "addie_home"  // Optional: override character folder
    }
  },

  "companions": ["addie", "rainie"],

  "dialogue": {
    "opening": [
      {
        "speaker": "Narrator",
        "text": "Concise narration text."
      },
      {
        "speaker": "Veracity",
        "text": "Character dialogue."
      }
    ],
    "closing": [...]
  },

  "choices": [
    {
      "text": "Safe option text",
      "companion": "addie",
      "consequences": {
        "careful_approach": true
      }
    }
  ],

  "puzzle": {
    "type": "connection",
    "title": "The Morning Clockwork",
    "instructions": "Connect the matching gears.",
    "points": [...]
  },

  "teaPuzzle": {
    "type": "gather_sort",
    "title": "Brewing Comfort",
    "instructions": "Place ingredients in correct order.",
    "slots": ["kettle", "leaves", "honey"]
  },

  "storyFlags": {
    "chapter1_complete": true
  },

  "nextChapter": 2
}
```

### Chapter List
1. **The Workshop** - Discovery at home
2. **The Empty Study** - Finding clues
3. **The Missing Papers** - Kidnapping revealed
4. **The Stranger's Warning** - Mysterious help
5. **Into the Unknown** - Journey begins
6. **The Order's Territory** - Cult discovered
7. **Inside the Compound** - Infiltration
8. **The Incomplete Device** - Truth revealed
9. **The Moth's Secret** - Missing component
10. **Breaking Point** - Veracity's challenge
11. **The Rescue** - Saving Da
12. **The Device Destroyed** - Stopping the cult
13. **Home Again** - Changed return
14. **The Music Box** - Mysterious ending

---

## Art System

### Character Art Specifications
- **Dimensions:** 1062 x 1674 pixels (portrait)
- **Format:** PNG with transparency
- **System:** Modular (body + expression overlays)

### File Naming Convention
```
{character}_body.png          # Base character without face
{character}_neutral.png        # Default expression
{character}_calm.png          # Peaceful, serene
{character}_happy_subtle.png  # Gentle smile
{character}_happy.png         # Big smile
{character}_sad.png           # Worried, sad
{character}_angry.png         # Frustrated, angry
{character}_disgusted.png     # Disturbed (also: disgust.png)
{character}_surprised.png     # Shocked
{character}_asleep.png        # Sleeping
{character}_smirk.png         # Sly smile
```

### Character Scales (Mobile-Optimized)
- **Veracity:** 0.27 (50% bigger than base)
- **Addie:** 0.2205 (75% bigger than base)
- **Rainie:** 0.189 (50% bigger than base)

### Character Positioning
- **Alignment:** Bottom of sprites aligns with top of dialogue box
- **Dialogue Box Top:** `height - 190`
- **Center Calculation:** `dialogueBoxTop - (spriteHeight * scale / 2)`

### Background Specifications
- **Mobile Size:** 375 x 812 pixels
- **High-Res Size:** 750 x 1624 pixels (2x, automatically scaled)
- **Format:** PNG
- **Location:** `/assets/images/backgrounds/`

### Puzzle Assets
- **Gears:** 3 variants (gear_01.png, gear_02.png, gear_03.png)
- **Scale:** 0.30 (100% bigger than base)
- **Hover Scale:** 0.34
- **Effects:** Yellow tint on hover

---

## Development Roadmap

### ✅ Phase 1: Foundation (Complete)
- [x] Vite + Phaser 3 setup
- [x] Mobile optimization (375x812)
- [x] Core scene framework
- [x] Asset loading system
- [x] Connection puzzle mechanic
- [x] Dialogue system with typewriter effect
- [x] Chapter 1 playable

### ✅ Phase 2: Core Systems (Complete)
- [x] Save/Load with localStorage
- [x] Connection puzzle mechanic
- [x] Puzzle Pieces mechanic
- [x] Merge Game mechanic
- [x] Chapter manager (JSON-based)
- [x] Audio manager (implemented)
- [x] Character component system
- [x] Choice panel with consequences
- [x] Settings scene with volume controls
- [x] Mobile-optimized touch controls
- [x] Debug tools (JUMP, JP buttons)

### 🚧 Phase 3: Content (In Progress - 2 of 14 Chapters)
- [x] Chapter 1: The Workshop (complete with narrative and puzzles)
- [x] Chapter 2: Empty Rooms (complete with narrative and puzzle)
- [x] Dialogue branching system
- [x] Choice consequence tracking
- [x] Character expression system
- [x] Character visibility controls (hideCharacters, showOnlyVera)
- [x] Location-based character variants (addie_home)
- [ ] Chapters 3-14 (planned)
- [ ] Complete narrative arc
- [ ] Multiple endings based on choices

### ✅ Phase 4: Art Integration (Partially Complete)
- [x] Character art for Chapters 1-2:
  - girl folder (happy, sad, neutral, surprised, smirk)
  - addie_home folder (calm, neutral, sad)
  - rainie folder (happy, sad, neutral, surprised)
- [x] Background images:
  - home_hallway_day.png
  - home_office_ransacked_day.png
  - puzzle_gear_01.png
  - puzzle_tea_01.png
- [x] Puzzle assets:
  - Gears (gear_01, gear_02, gear_03)
  - Note fragments (dear_vera_01 through 07 + complete)
  - Tea items (15 PNG files for merge game)
- [ ] Additional backgrounds for Chapters 3-14
- [ ] Additional character contexts as needed
- [ ] UI polish elements

### 📋 Phase 5: Polish & Testing (Partial)
- [x] Chapters 1-2 playthrough tested
- [x] All 3 puzzle types tested
- [x] Mobile touch controls verified
- [x] Settings menu (volume sliders)
- [x] Performance optimization (60fps)
- [x] Development hot-reload
- [x] Debug navigation tools
- [ ] Full 14-chapter playthrough
- [ ] Audio implementation (music + SFX)
- [ ] Companion health/damage system (planned)
- [ ] Repair side quest mechanics (planned)
- [ ] Chapter select menu
- [ ] Accessibility features

### 🚀 Phase 6: Deployment (Future)
- [ ] Production build optimization
- [ ] Asset compression
- [ ] Web hosting deployment
- [ ] itch.io publishing
- [ ] Player documentation
- [ ] Developer documentation

---

## How to Play

### For Players

#### Starting the Game
1. Open the game in a web browser (optimized for mobile)
2. Click "New Game" to start Chapter 1
3. Use "Continue" to resume from your last save

#### Controls
- **Tap dialogue box** - Advance text
- **Tap choices** - Make decisions
- **Connection puzzles** - Drag between matching points
- **Rhythm puzzles** - Tap in time with the pulse
- **Gather & Sort** - Drag items to correct slots
- **Back button** - Return to main menu (top-left)

#### Tips
- Pay attention to Addie's cautious advice and Rainie's bold suggestions
- Your choices affect the story and companion health
- Puzzles can be skipped via the back button if needed
- The game auto-saves after each chapter

### For Developers

#### Running the Game
```bash
npm install
npm run dev
```

#### Replacing Art Assets
1. Navigate to `/public/assets/images/characters/{character}/`
2. Replace PNG files (keep exact filenames)
3. For location variants, create new folder (e.g., `addie_home`)
4. Update chapter JSON with `characterFolders` override
5. Refresh browser - changes appear instantly!

#### Adding New Chapters
1. Create `chapter_##.json` in `/public/data/chapters/`
2. Follow the JSON structure template
3. Update `ChapterManager.js` if needed
4. Add background image to `/public/assets/images/backgrounds/`

#### Modifying Dialogue
1. Edit chapter JSON files in `/public/data/chapters/`
2. Update "dialogue" → "opening" or "closing" arrays
3. Change speaker to "Narrator", "Veracity", "Addie", or "Rainie"
4. Refresh browser to see changes

#### Creating New Puzzles
1. Add puzzle configuration to chapter JSON
2. Extend `PuzzleScene.js` with new puzzle type
3. Create assets in `/public/assets/images/puzzles/`
4. Test with back button for skip functionality

---

## Technical Details

### Screen Specifications
- **Target Device:** iPhone X (375 x 812)
- **Scale Mode:** Phaser.Scale.FIT
- **Orientation:** Portrait
- **Center Mode:** Phaser.Scale.CENTER_BOTH

### Performance Optimization
- Texture existence checks before creating sprites
- Lazy loading of chapter assets
- Silent fallback for missing assets
- Minimal placeholder generation

### Asset Loading Strategy
1. Check for sprite sheets → Use if available
2. Check for individual images → Load from subfolders
3. Check for custom folder overrides → Use chapter-specific variants
4. Fallback to simple shapes if all else fails

### Dialogue Box Specifications
- **Height:** 180px
- **Position:** `height - 190` (10px margin)
- **Background:** Black (85% opacity)
- **Border:** 2px copper (#8b5c31)
- **Text Style:** Courier New, white
- **Speaker Style:** Courier New, copper, bold

---

## Game Philosophy

### Design Principles
1. **Story First** - Narrative drives gameplay
2. **Emotional Resonance** - Players should feel Veracity's journey
3. **Agency Through Mechanics** - Puzzles reflect character growth
4. **Accessible Depth** - Simple to play, meaningful to experience
5. **Art as Expression** - Visual style enhances emotional impact

### Narrative Approach
- **Show, Don't Tell** - Actions over exposition
- **Concise Writing** - Every word counts (50% reduction)
- **Character Voice** - Distinct personalities for each companion
- **Mystery & Revelation** - Gradual story unfolding
- **Emotional Beats** - Hope, loss, triumph, growth

### Player Experience Goals
- Feel connected to Veracity's emotional journey
- Experience meaningful choices with consequences
- Engage with puzzles that feel thematically relevant
- Discover a satisfying mystery with hints of more to come
- Leave feeling empowered and hopeful

---

## Credits & License

**Game Title:** Veracity
**Original Concept:** Heather Capelli
**Development:** Claude Sonnet 4.5 (AI Assistant)
**Engine:** Phaser 3
**Inspiration:** Florence (Mountains), Monument Valley (ustwo games)

---

## Quick Reference

### File Locations
- **Chapters:** `/public/data/chapters/chapter_##.json`
- **Character Art:** `/public/assets/images/characters/{character}/`
- **Backgrounds:** `/public/assets/images/backgrounds/`
- **Puzzles:** `/public/assets/images/puzzles/`
- **Main Code:** `/src/scenes/ChapterScene.js`

### Key Values
- **Mobile Resolution:** 375 x 812
- **Character Sprite Size:** 1062 x 1674
- **Dialogue Box Height:** 180px
- **Gear Scale:** 0.30 (normal), 0.34 (hover)
- **Typewriter Speed:** 30ms per character

### Character Scales
- Veracity: 0.27
- Addie: 0.2205
- Rainie: 0.189

---

*Last Updated: 2026-02-27*
