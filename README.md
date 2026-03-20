# Veracity

A steampunk narrative puzzle adventure about a young woman named Veracity (Vera) whose scientist father has gone missing. With her clockwork companions Addie (a bear) and Rainie (a raccoon), she must solve puzzles, navigate secrets, and confront a truth about her own family she never expected.

Deployed at: https://hedrgoblin.github.io/Veracity/

## Game Features

- **10 Chapters** across 3 acts with branching narrative
- **Multiple Puzzle Types**: Connection (gears), Puzzle Pieces (fragments), Tea service minigame, Moth maze, Gear puzzle, Infiltration puzzle, Sequence puzzle
- **Subscription System**: Chapters 1-2 free, subscription required for Chapter 3+
- **Companion System**: Choices between cautious Addie (bear) and adventurous Rainie (raccoon)
- **Dynamic Expressions**: Characters react with different emotions (up to 16 expressions for main characters)
- **Item Display**: Dramatic presentation of story items
- **Save/Load System**: Auto-save and manual save slots
- **Asset Replacement**: Easily swap art without touching code
- **Mobile-Optimized**: Touch controls and responsive design
- **Dialogue Export**: Extract all game text to markdown file

## Quick Start

### Installation

```bash
# Clone or download the project
cd steampunk-journey

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

The game will open in your browser at `http://localhost:3000`

## Art Asset Replacement Workflow

**This is a key feature:** You can replace all art assets without modifying any code.

### Step-by-Step Guide

1. **Navigate to the assets folder**
   ```
   /public/assets/images/
   ```

2. **Find the asset category you want to replace**
   - `backgrounds/` - Chapter background images (1920x1080px recommended)
   - `characters/` - Character sprites organized by character and variant
     - `vera/`, `vera_pajamas/`, `vera_green/`, `vera_clockworker/`
     - `addie/`, `addie_home/`, `addie_clockworker/`
     - `rainie/`, `rainie_pajamas/`, `rainie_clockworker/`
     - `guildmaster/`, `guildmaster_black/`
     - `da_default/`, `da_moth/`, `da_lab/`
     - `crone_default/`, `gentleman_paper/`
     - `cultist_bookkeeper/`, `cultist_enforcer/`, `cultist_guard/`, `cultist_guard_staff/`
   - `ui/` - UI elements
   - `puzzles/` - Puzzle-specific graphics
     - `gears/` - Gear images for connection puzzles
     - `notes/` - Note fragment images for puzzle pieces
     - `tea/` - Tea item images for the tea service minigame
   - `items/` - Story items (notebook, compass, moth, etc.)

3. **Replace the PNG file with your own**
   - **IMPORTANT**: Keep the exact same filename

4. **Refresh your browser**
   - Changes appear immediately in development mode
   - No code compilation needed

### Asset Specifications

| Asset Type | Dimensions | Format | Notes |
|------------|-----------|--------|-------|
| Backgrounds | 1920x1080px | PNG | Full screen scenes |
| Characters | 512x512px | PNG | Transparent background |
| UI Elements | Variable | PNG | Transparent background |
| Audio Music | Any | MP3/OGG | Background music |
| Audio SFX | Any | MP3/OGG | Sound effects |

## Project Structure

```
steampunk-journey/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── backgrounds/     # Chapter scenes
│   │   │   ├── characters/      # Character sprites with expressions
│   │   │   ├── puzzles/
│   │   │   │   ├── gears/       # gear_01.png, gear_02.png, gear_03.png
│   │   │   │   ├── notes/       # dear_vera/*.png fragments
│   │   │   │   └── tea/         # Tea service game items
│   │   │   ├── items/           # Story items (notebook_01.png, lide_compass.png, etc.)
│   │   │   └── ui/              # UI elements
│   │   └── audio/
│   │       ├── music/           # Background music
│   │       └── sfx/             # Sound effects
│   └── data/
│       └── chapters/            # Chapter JSON files (chapter_01.json – chapter_10.json)
├── src/
│   ├── main.js                  # Phaser game configuration
│   ├── scenes/
│   │   ├── BootScene.js              # Asset loading
│   │   ├── MainMenuScene.js          # Main menu with subscribe button
│   │   ├── ChapterScene.js           # Main chapter gameplay
│   │   ├── PuzzleScene.js            # All puzzle mechanics
│   │   ├── SettingsScene.js          # Settings menu
│   │   ├── EndingScene.js            # Game endings
│   │   ├── SubscriptionScene.js      # Placeholder subscription page
│   │   └── SubscriptionGateScene.js  # Chapter 3+ gate for non-subscribers
│   ├── systems/
│   │   ├── GameStateManager.js  # Global state management
│   │   ├── SaveManager.js       # localStorage save/load
│   │   └── AudioManager.js      # Music and SFX
│   └── components/
│       └── BackButton.js        # Reusable back button
└── index.html
```

## Gameplay

### Chapter & Act Structure

**Act 1: Chapters 1-3**
- Chapter 1: The Workshop — Vera discovers her father is missing
- Chapter 2: Empty Rooms — Finding clues in Da's ransacked study
- Chapter 3: Clockmaker's Guild — Encounter with the Crone; moth maze and gear puzzle

**Act 2: Chapters 4-7**
- Chapter 4: Sequence puzzle / safe
- Chapters 5-6: Infiltration puzzle (sneaking game)
- Chapter 7: Narrative chapter

**Act 3: Chapters 8-10**
- Chapters 8-10: Resolution — confronting the Guildmaster, rescuing Da, returning home

### Puzzles

| Chapter | Puzzle |
|---------|--------|
| 1 | Connection puzzle (gear/spring lock) OR Tea service minigame |
| 2 | Puzzle pieces (torn note) |
| 3 | Moth maze + Gear puzzle (clockmakers lock) |
| 4 | Sequence puzzle (safe) |
| 5-6 | Infiltration puzzle (click each icon 3 times) |
| 7-10 | Narrative only |

### Companion System

Your choices shape the story:
- **Addie (Bear)**: Cautious, protective — suggests careful preparation
- **Rainie (Raccoon)**: Adventurous, bold — suggests immediate action

### Character Expressions

Characters display emotions through sprite expression layers. Main characters (Vera, Addie, Rainie, Guildmaster, guildmaster_black) have 16 expressions. Supporting NPCs have 8 expressions.

### Subscription System

- **Chapters 1-2**: Free to play
- **Chapter 3+**: Requires subscription (placeholder implementation)

## Controls

- **Mouse/Touch**: All interactions (mobile-optimized)
- **Click/Tap**: Select, advance dialogue, make choices
- **Click & Drag**: Puzzle interactions

## Debug Controls (Development)

- **JUMP Button** (top-left): Navigate to any chapter (chapters 1-10)

## Save System

- **Auto-save**: Automatically saves after each chapter
- **Manual Save**: Available in settings (3 slots)
- **Continue**: Resume from last checkpoint

## Development

### Extracting All Dialogue

```bash
node extract-dialogue.cjs
```

Creates `GAME_DIALOGUE.md` with all narrator text, character dialogue, and player choices organized by chapter.

### Dialogue Sync

```bash
npm run dialogue:watch    # Auto-sync both directions
npm run dialogue:export   # JSON → Markdown
npm run dialogue:import   # Markdown → JSON
```

### Editing Chapter Content

Chapter content is stored in JSON files at `/public/data/chapters/`

#### Key Dialogue Properties
- `expression`: Change character expressions — `{"vera": "sad", "rainie": "neutral"}`
- `background`: Switch background mid-dialogue
- `crossfadeBackground`: Cross-fade to new background
- `hideCharacters`: Fade out characters — `["crone"]`
- `showCharacters`: Show specific characters — `["vera", "addie"]`
- `showOnlyVera`: Show only Vera (scales up 10%)
- `showItem`: Display story item — `"notebook_01"`
- `launchMothPuzzle`: Launch the moth maze puzzle
- `launchGearPuzzle`: Launch the clockmakers gear puzzle
- `slideIn`: Slide character in from off-screen
- `swapCharacters`: Swap visible characters
- `moveCharacters`: Move characters to new positions
- `fadeToBlack` / `blackScreen`: Full-screen fade effects
- `suppressAutoShow`: Prevent auto-show of speaking character
- `placeholder`: Placeholder dialogue marker

#### Puzzle Types
- `connection` - Connect matching gear/spring points
- `puzzle_pieces` - Arrange torn fragments
- `match_three` - Tea service collection minigame
- `sequence` - Perform actions in correct order
- `maze` - Moth maze navigation
- `infiltration` - Click each icon 3 times to sneak past

## Story Synopsis

### Act 1: Discovery (Chapters 1-3)
Vera discovers her father (Da, The Professor) is missing. She explores his ransacked study, finds cryptic notes, and visits the Clockmaker's Guild where she meets the Crone.

### Act 2: Journey (Chapters 4-7)
Vera travels north toward the cult's sanctuary, infiltrating past guards with Addie and Rainie's help.

### Act 3: Resolution (Chapters 8-10)
Vera confronts the Guildmaster — a mysterious woman who may be her mother. She rescues her father and returns home, changed.

## Art Direction

### Steampunk-Whimsical Aesthetic
- Gears, brass, copper tones
- Victorian-era technology
- Warm color palette: #8b5c31 (copper), #c4a575 (brass), #4a5f7a (steel blue)
- Contrast between warm home scenes and cold cult environments

## Deployment

### Build for Production

```bash
npm run build
```

Output will be in `/dist` folder. Deployed to GitHub Pages at https://hedrgoblin.github.io/Veracity/

## Troubleshooting

### Assets Not Loading
- Check file names match exactly (case-sensitive)
- Ensure files are in correct folders under `/public/assets/`
- Clear browser cache and hard refresh (Cmd+Shift+R)
- Check browser console for 404 errors

### Character Expressions Not Showing
- Check character folder exists under `/characters/`
- Verify expression files exist (e.g., `vera_happy.png`)
- Check `characterFolders` mapping in chapter JSON

### Puzzle Not Working
- Connection puzzle: Click and hold on gear, drag to matching gear
- Tea service: Click items to collect
- Puzzle pieces: Drag near correct position (snaps within 60px)

### Save Not Working
- Check browser's localStorage is enabled
- Private/incognito mode may block localStorage

## Credits

**Art Direction & Story & Game Design**: Heather Capelli
**Programming**: Claude Sonnet 4.6
**Engine**: Phaser 3
**Build Tool**: Vite
