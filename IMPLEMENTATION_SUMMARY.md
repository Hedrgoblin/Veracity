# Implementation Summary - Veracity

## Project Status: COMPLETE — 10 CHAPTERS FULLY IMPLEMENTED

Veracity is a finished steampunk narrative puzzle adventure. All 10 chapters are playable. The game is deployed at https://hedrgoblin.github.io/Veracity/.

---

## What's Been Implemented

### Core Systems

- **GameStateManager**: Tracks chapters, companions, choices, flags, inventory, subscription status
- **SaveManager**: Auto-save, 3 manual save slots, localStorage persistence
- **AudioManager**: Music crossfading, volume control, SFX management
- **Subscription System**: Chapters 1-2 free; subscription gate before Chapter 3

### Scene Framework

- **BootScene**: Asset loading with progress bar
- **MainMenuScene**: New game, continue, settings, subscribe
- **ChapterScene**: Main gameplay — narrative, dialogue, choices, item display, all character logic
- **PuzzleScene**: All puzzle mechanics
- **SettingsScene**: Volume sliders, settings persistence
- **EndingScene**: Multiple endings based on choices, credits
- **SubscriptionScene**: Subscription page
- **SubscriptionGateScene**: Chapter 3+ gate for non-subscribers

### Puzzle Types (All Implemented)

1. **Connection Puzzle** — Click-drag line drawing between gear/spring points
   - Used in Chapter 1 (Rainie's path)

2. **Puzzle Pieces** — Drag fragments to reconstruct a torn note
   - Custom non-uniform grid (2-2-1-2 pattern)
   - Used in Chapter 2

3. **Tea Service Minigame** — Click floating items to collect ingredients
   - Simple, calming gameplay; goal tracking header
   - Used in Chapter 1 (Addie's path)

4. **Sequence Puzzle** — Perform actions in correct order (kick, hum pattern)
   - Used in Chapter 4 (open Da's safe)

5. **Moth Maze** — Follow the moth through branching paths
   - Triggered by `launchMothPuzzle` in dialogue JSON
   - Chapter 3 (first puzzle)

6. **Gear Puzzle (Clockmakers Lock)** — Solve the clockmakers gear lock
   - Triggered by `launchGearPuzzle` in dialogue JSON
   - Chapter 3 (second puzzle)

7. **Infiltration Puzzle** — Sneaking game; click each icon 3 times
   - Used in Chapters 5-6

### Character System

**Main Characters (16 expressions each):**
- Vera: `vera`, `vera_pajamas`, `vera_green`, `vera_clockworker`
- Addie: `addie`, `addie_home`, `addie_clockworker`
- Rainie: `rainie`, `rainie_pajamas`, `rainie_clockworker`
- Guildmaster: `guildmaster`, `guildmaster_black`

**Supporting Characters (8 expressions each):**
- Da: `da_default`, `da_moth`, `da_lab`
- Crone: `crone_default`
- Gentleman Paper: `gentleman_paper`
- Cultist Enforcer: `cultist_enforcer`
- Cultist Bookkeeper: `cultist_bookkeeper`
- Cultist Guard: `cultist_guard`
- Cultist Guard Staff: `cultist_guard_staff`

**NPC visibility logic:**
- `guildmaster` and `cultist_enforcer` always appear when speaking (cannot be suppressed)
- `guildmaster`, `cultist_enforcer`, `cultist_bookkeeper` are autoSolo (appear alone)
- Other NPCs must be shown via `showCharacters`

### Dialogue System

Full set of supported directives in chapter JSON:
- `expression` — change character expressions
- `background` / `crossfadeBackground` — scene transitions
- `brightenEffect` — screen brighten
- `hideCharacters` / `showCharacters` / `showOnlyVera` — character visibility
- `showItem` — dramatic item presentation
- `launchMothPuzzle` / `launchGearPuzzle` — puzzle triggers
- `slideIn` / `swapCharacters` / `moveCharacters` — character staging
- `fadeToBlack` / `blackScreen` — full-screen effects
- `suppressAutoShow` / `placeholder` — control flags

### Chapter Content

All 10 chapters implemented across 3 acts:

| # | Act | Key Content |
|---|-----|-------------|
| 1 | 1 | Vera discovers Da is missing; connection puzzle OR tea service |
| 2 | 1 | Ransacked study; torn note puzzle; notebook item reveal |
| 3 | 1 | Clockmaker's Guild; Crone NPC; moth maze + gear puzzle |
| 4 | 2 | Sequence puzzle (safe) |
| 5 | 2 | Infiltration puzzle (part 1) |
| 6 | 2 | Infiltration puzzle (part 2) |
| 7 | 2 | Narrative |
| 8 | 3 | Guildmaster confrontation; Da's secret revealed |
| 9 | 3 | Aftermath; Addie injured; mother revelation |
| 10 | 3 | Resolution; coming home |

### Art Assets (In Place)

**Backgrounds:**
- home_hallway_day, home_office_day, home_office_ransacked_day
- home_office_ransacked_day_revealed, home_office_safe_closed, home_office_safe_open
- london_alley, clockmakers_guild_door, clockmakers_guild_hall_01, clockmakers_guild_hall_02
- clockmakers_guild_maproom, northern_sanctuary_ext, train_carriage, train_ext
- puzzle_gear_01, puzzle_gear_clockmakers_01, puzzle_tea_01

**Puzzle Assets:**
- `/puzzles/gears/` — gear_01, gear_02, gear_03
- `/puzzles/notes/dear_vera/` — 7 fragments + complete note
- `/puzzles/tea/` — 12 tea item images
- `/puzzles/safe/` — kick and whistle icons

**Story Items:**
- notebook_01.png, lide_compass.png, moth.png, note_dear_vera.png, note_dear_vera_02.png

### Developer Tools

- **JUMP button** (top-left in-game): Navigate to any chapter 1-10
- **Dialogue export/import**: `npm run dialogue:export` / `npm run dialogue:import` / `npm run dialogue:watch`
- **extract-dialogue.cjs**: Export all game text to GAME_DIALOGUE.md
- **Browser console commands**: See DEVELOPER_GUIDE.md

---

## Build & Deployment

```bash
npm run dev      # Development server
npm run build    # Production build to /dist
```

Deployed to GitHub Pages at https://hedrgoblin.github.io/Veracity/

---

## File Statistics

- **Scenes**: 8 files
- **Systems**: 3 files (GameStateManager, SaveManager, AudioManager)
- **Chapter JSON**: 10 files
- **Documentation**: README.md, GAME_OVERVIEW.md, DEVELOPER_GUIDE.md, CHARACTER_ART_GUIDE.md, DIALOGUE_SYNC_GUIDE.md, TECHNICAL_DESIGN_DOCUMENT.md, IMPLEMENTATION_SUMMARY.md, GAME_DIALOGUE.md, Tea-minigame-art-assets.md, Tea-minigame-design.md

---

## Core Philosophy

**"Art assets replaceable without touching code"**
- All assets loaded from `/public/assets/`
- Asset references in chapter JSON, not hardcoded
- Hot-reload in development
- No code recompilation needed for art changes

---

## Credits

**Art Direction & Story & Game Design:** Heather Capelli
**Programming:** Claude Sonnet 4.6
**Engine:** Phaser 3
**Build Tool:** Vite
