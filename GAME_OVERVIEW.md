# VERACITY - Complete Game Overview

## Table of Contents
1. [Game Concept](#game-concept)
2. [Story & Narrative](#story--narrative)
3. [Characters](#characters)
4. [Game Mechanics](#game-mechanics)
5. [Technical Architecture](#technical-architecture)
6. [Chapter Structure](#chapter-structure)
7. [Art System](#art-system)
8. [How to Play](#how-to-play)

---

## Game Concept

**Title:** Veracity
**Genre:** Narrative Puzzle Adventure
**Platform:** Web (Mobile-optimized, 1920x1080 base — scales to fit)
**Deployed at:** https://hedrgoblin.github.io/Veracity/
**Inspiration:** Florence, Monument Valley, Gris
**Theme:** Truth, agency, family, self-discovery
**Aesthetic:** Steampunk-whimsical with emotional depth

### Core Premise
Veracity (nicknamed "Vera"), a young woman, must find her missing scientist father, Da (The Professor), who has been taken by a mysterious cult. Accompanied by two clockwork companions — Addie (a cautious bear) and Rainie (an adventurous raccoon) — she uncovers a truth about her own family she never expected.

---

## Story & Narrative

### Act Structure

**Act 1: Discovery (Chapters 1-3)**
- Chapter 1: "The Workshop" — Vera discovers her father is missing; the study door is locked
- Chapter 2: "Empty Rooms" — Finding clues in Da's ransacked study
- Chapter 3: Leaving Home — Journey to the Clockmaker's Guild; encounter with the Crone

**Act 2: Journey (Chapters 4-7)**
- Chapter 4: Safe puzzle / deeper into the mystery
- Chapters 5-6: Infiltration — sneaking past the cult's guards
- Chapter 7: Inside the sanctuary

**Act 3: Resolution (Chapters 8-10)**
- Chapter 8: Confronting the Guildmaster; Da's secret is revealed
- Chapter 9: Aftermath — escape, Addie injured, revelations about Vera's mother
- Chapter 10: Resolution — coming home, the Guildmaster's true identity

### Core Themes
- **Truth vs. Deception** (Veracity = Truth)
- **Agency & Growth** — from uncertainty to confidence
- **Chosen Family** — Addie and Rainie as steadfast companions
- **Science & Mystery** — steampunk technology meets emotional storytelling
- **Hope & Loss** — dealing with grief while finding strength

### The Antagonist
The Guildmaster (`guildmaster_black`) is a mysterious woman who leads the cult. She may be Vera's mother — aged by contact with Da's temporal anchor crystal.

---

## Characters

### Veracity ("Vera")
- **Role:** Protagonist
- **Key Traits:** Curious, determined, compassionate
- **Variants:** `vera_default`, `vera_pajamas`, `vera_green`, `vera_clockworker`
- **Expressions:** 16 expressions

### Addie (The Bear)
- **Type:** Clockwork companion
- **Personality:** Cautious, protective, risk-averse
- **Represents:** The careful path, security, caution
- **Variants:** `addie_default`, `addie_home`, `addie_clockworker`
- **Expressions:** 16 expressions

### Rainie (The Raccoon)
- **Type:** Clockwork companion
- **Personality:** Adventurous, impulsive, bold
- **Represents:** The risky path, adventure, courage
- **Variants:** `rainie_default`, `rainie_pajamas`, `rainie_clockworker`
- **Expressions:** 16 expressions

### Da / The Professor
- **Role:** Vera's missing father; brilliant inventor
- **Device:** "Temporal Resonance Device" (incomplete and dangerous)
- **Variants:** `da_default`, `da_moth`, `da_lab`
- **Expressions:** 8 expressions

### The Guildmaster
- **Role:** Primary antagonist; leader of the cult
- **Mystery:** May be Vera's mother, aged by the temporal anchor
- **Variants:** `guildmaster`, `guildmaster_black`
- **Auto-solo:** Always appears alone; cannot be suppressed by `hideCharacters: true`
- **Expressions:** 16 expressions

### Supporting NPCs
- **Crone** (`crone_default`) — encountered at the Clockmaker's Guild; horizontally flipped in-game
- **Gentleman Paper** (`gentleman_paper`) — mysterious contact; horizontally flipped in-game
- **Cultist Enforcer** (`cultist_enforcer`) — auto-solo and always shows when speaking
- **Cultist Bookkeeper** (`cultist_bookkeeper`) — auto-solo
- **Cultist Guard** (`cultist_guard`) — horizontally flipped in-game
- **Cultist Guard Staff** (`cultist_guard_staff`) — horizontally flipped in-game
- All supporting NPCs: 8 expressions

### NPC Auto-Show Rules
- `guildmaster` and `cultist_enforcer` always appear when speaking (cannot be suppressed)
- `guildmaster`, `cultist_enforcer`, and `cultist_bookkeeper` are autoSolo — they appear alone, hiding others
- Other NPCs must be shown via `showCharacters` in the dialogue JSON

---

## Game Mechanics

### 1. Dialogue System
- **Typewriter Effect:** Text appears character-by-character (30ms delay)
- **Speaker Labels:** Character names shown above dialogue
- **Tap to Continue:** Player advances at their pace
- **Expression System:** Characters display emotions via layered sprites

### 2. Choice System
- **Binary Choices:** Two options per decision point
- **Companion-Based:** Choices align with Addie (careful) or Rainie (bold)
- **Consequences:** Tracked in game state, affect narrative

### 3. Puzzle Types

#### A. Connection Puzzle
- Draw lines between matching gear/spring points
- Chapter 1 (Rainie's path): repair the study door lock
- Background: `puzzle_gear_01.png`
- Assets: `gear_01.png`, `gear_02.png`, `gear_03.png`

#### B. Puzzle Pieces
- Drag torn fragments to reconstruct a complete image
- Chapter 2: reconstruct the torn note from Da
- Custom non-uniform grid layout (2-2-1-2 pattern)

#### C. Tea Service Minigame
- Click floating items to collect ingredients
- Chapter 1 (Addie's path): brew tea before searching
- Background: `puzzle_tea_01.png`
- Assets in `/puzzles/tea/`

#### D. Moth Maze
- Chapter 3: follow the moth through branching paths
- Launched via `launchMothPuzzle` directive

#### E. Gear Puzzle (Clockmakers Lock)
- Chapter 3: second puzzle after the moth maze
- Launched via `launchGearPuzzle` directive

#### F. Sequence Puzzle
- Perform actions in correct order (kick, hum pattern)
- Chapter 4: open Da's safe (kick 3x, hum 3x, kick 1x)

#### G. Infiltration Puzzle
- Chapters 5-6: sneaking game — click each icon 3 times to get past guards

### 4. Save/Load System
- Auto-save after each chapter
- Manual save slots (3)
- localStorage with JSON serialization

---

## Technical Architecture

### Technology Stack
- **Game Engine:** Phaser 3.88.2
- **Language:** JavaScript (ES6+)
- **Build Tool:** Vite 5.4.21
- **Deployment:** GitHub Pages (https://hedrgoblin.github.io/Veracity/)

### Project Structure
```
steampunk-journey/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── characters/      # All character variant folders
│   │   │   ├── backgrounds/     # 1920x1080 scene backgrounds
│   │   │   ├── puzzles/         # Puzzle assets
│   │   │   └── items/           # Story items
│   │   └── audio/
│   └── data/
│       └── chapters/            # chapter_01.json – chapter_10.json
├── src/
│   ├── main.js
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── MainMenuScene.js
│   │   ├── ChapterScene.js
│   │   ├── PuzzleScene.js
│   │   ├── SettingsScene.js
│   │   ├── EndingScene.js
│   │   ├── SubscriptionScene.js
│   │   └── SubscriptionGateScene.js
│   ├── systems/
│   │   ├── GameStateManager.js
│   │   ├── SaveManager.js
│   │   └── AudioManager.js
│   └── components/
│       └── BackButton.js
└── index.html
```

### Key Systems

#### GameStateManager (Singleton)
```javascript
state = {
  currentChapter: 1,
  completedChapters: [],
  currentAct: 1,
  companions: {
    addie: { health: 100, met: true },
    rainie: { health: 100, met: true }
  },
  choices: [],
  storyFlags: {},
  inventory: [],
  subscriptionActive: false
}
```

#### ChapterScene Flow
1. **preload()** — Load chapter JSON, determine character folders, load assets
2. **create()** — Set up background, characters, UI
3. **startNarrative()** — Show opening dialogue
4. **checkForChoices()** — Display decision points
5. **checkForPuzzle()** — Launch puzzle scene
6. **completeChapter()** — Save progress, advance to next

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

  "choices": [
    {
      "text": "Safe option",
      "companion": "addie",
      "consequences": { "careful_approach": true },
      "puzzle": { /* optional per-choice puzzle */ }
    }
  ],

  "storyFlags": {
    "chapter1_complete": true
  },

  "nextChapter": 2
}
```

### Chapter List (10 Chapters)
| # | Title | Act | Puzzle |
|---|-------|-----|--------|
| 1 | The Workshop | 1 | Connection OR Tea service |
| 2 | Empty Rooms | 1 | Puzzle pieces (torn note) |
| 3 | Leaving Home | 1 | Moth maze + Gear puzzle |
| 4 | — | 2 | Sequence puzzle (safe) |
| 5 | — | 2 | Infiltration puzzle |
| 6 | — | 2 | Infiltration puzzle (continued) |
| 7 | — | 2 | Narrative |
| 8 | — | 3 | Narrative |
| 9 | Aftermath | 3 | Narrative |
| 10 | — | 3 | Narrative |

### Subscription Gate
The subscription gate appears before Chapter 3. Chapters 1-2 are free.

---

## Art System

### Character Art Specifications
- **Format:** PNG with transparency
- **System:** Modular (body + expression overlay layers)
- **Recommended dimensions:** 512x512px per file

### File Naming Convention
```
{variant}_body.png          # Base body (no face)
{variant}_neutral.png       # Default expression
{variant}_happy.png
{variant}_sad.png
{variant}_surprised.png
{variant}_calm.png
{variant}_angry.png
{variant}_smirk.png
# ... up to 16 expressions for main characters
```

### Character Scales (in-game)
- **Vera:** 0.299
- **Addie:** 0.358
- **Rainie:** 0.239

### Background Specifications
- **Dimensions:** 1920x1080px
- **Format:** PNG
- **Location:** `/assets/images/backgrounds/`

### Dialogue Directives (Chapter JSON)
| Directive | Description |
|-----------|-------------|
| `hideCharacters` | Array of character names to hide, or `true` for all |
| `showCharacters` | Array of character names to show |
| `showOnlyVera` | Show only Vera (10% scale increase) |
| `expression` | Map of character → expression name |
| `background` | Switch background |
| `crossfadeBackground` | Cross-fade to new background |
| `brightenEffect` | Screen brighten effect |
| `slideIn` | Slide character in from off-screen |
| `swapCharacters` | Swap visible characters |
| `moveCharacters` | Move characters to new positions |
| `showItem` | Display story item dramatically |
| `launchMothPuzzle` | Launch moth maze puzzle |
| `launchGearPuzzle` | Launch clockmakers gear puzzle |
| `fadeToBlack` | Fade screen to black |
| `blackScreen` | Instant black screen |
| `suppressAutoShow` | Prevent auto-show of speaking character |
| `placeholder` | Placeholder dialogue marker |

---

## How to Play

### For Players

1. Open the game at https://hedrgoblin.github.io/Veracity/
2. Click "New Game" to start Chapter 1
3. Tap the dialogue box to advance text
4. Make choices at decision points
5. Solve puzzles to continue the story
6. The game auto-saves after each chapter

### For Developers

```bash
npm install
npm run dev       # Start dev server at localhost:3000
npm run build     # Production build to /dist
```

#### Debug Tools
- **JUMP Button** (top-left in-game): Navigate to any chapter 1-10
- Browser console: `game.scene.start('ChapterScene', { chapterNumber: 3 })`

---

## Credits

**Art Direction & Story & Game Design:** Heather Capelli
**Programming:** Claude Sonnet 4.6
**Engine:** Phaser 3
**Build Tool:** Vite

---

*Last Updated: 2026-03-20*
