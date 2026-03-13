# Steampunk Journey

A Florence-inspired narrative puzzle game about a 10-year-old girl whose scientist father has been kidnapped by a dark cult seeking his time travel device. With her robot companions (Addie the protective bear and Rainie the adventurous raccoon), she must solve puzzles, meet strangers, and find her own agency while discovering who she truly is.

## 🎮 Game Features

- **14 Planned Chapters** across 3 acts with branching narrative (Chapters 1-2 fully implemented, Chapter 3 partially implemented)
- **Multiple Puzzle Types**: Connection (gears), Puzzle Pieces (fragments), Collection Game (tea brewing), Sequence (ordered actions)
- **Subscription System**: Chapter 1 free, subscription required for Chapter 2+ (placeholder implementation)
- **Companion System**: Choices between cautious Addie (bear) and adventurous Rainie (raccoon)
- **Dynamic Expressions**: Characters react with different emotions
- **Item Display**: Dramatic presentation of story items (journal, artifacts, compass)
- **Save/Load System**: Auto-save and manual save slots
- **Asset Replacement**: Easily swap art without touching code
- **Mobile-Optimized**: Touch controls and responsive design
- **Dialogue Export**: Extract all game text to markdown file

## 🚀 Quick Start

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

## 🎨 Art Asset Replacement Workflow

**This is a key feature:** You can replace all art assets without modifying any code!

### Step-by-Step Guide

1. **Navigate to the assets folder**
   ```
   /public/assets/images/
   ```

2. **Find the asset category you want to replace**
   - `backgrounds/` - Chapter background images (1920x1080px recommended)
   - `characters/` - Character sprites organized by character and context
     - `vera/` - Main character (Veracity) expressions (happy, sad, neutral, surprised, smirk)
     - `addie_home/` - Addie at home (calm, neutral)
     - `rainie/` - Rainie expressions (happy, sad, neutral, surprised)
     - `crone/` - Crone character (Chapter 3 NPC, horizontally flipped, centered)
   - `ui/` - UI elements (variable sizes)
   - `puzzles/` - Puzzle-specific graphics
     - `gears/` - Gear images for connection puzzles
     - `notes/` - Note fragment images for puzzle pieces
     - `tea/` - Tea item images for merge game (teacups, leaves, sugar, cream)
   - `effects/` - Visual effects

3. **Replace the PNG file with your own**
   - **IMPORTANT**: Keep the exact same filename
   - Example: Replace `placeholder_bg.png` with your art, but name it `placeholder_bg.png`

4. **Refresh your browser**
   - Changes appear immediately in development mode
   - No code compilation needed
   - No config files to edit

### Asset Specifications

| Asset Type | Dimensions | Format | Notes |
|------------|-----------|--------|-------|
| Backgrounds | 1920x1080px | PNG | Full screen scenes |
| Characters | 512x512px | PNG | Transparent background |
| UI Elements | Variable | PNG | Transparent background |
| Audio Music | Any | MP3/OGG | Background music |
| Audio SFX | Any | MP3/OGG | Sound effects |

### Adding New Assets

To add completely new assets (not replacements):

1. Add your PNG file to the appropriate folder
2. Open the chapter JSON file in `/public/data/chapters/`
3. Update the `assets` section:

```json
{
  "assets": {
    "background": "your_new_background_name",
    "music": "your_new_music_name",
    "characters": ["vera", "addie", "rainie"]
  }
}
```

No code changes required!

## 📁 Project Structure

```
steampunk-journey/
├── public/
│   ├── assets/
│   │   ├── images/
│   │   │   ├── backgrounds/     # Chapter scenes (home_hallway_day, etc.)
│   │   │   ├── characters/      # Character sprites with expressions
│   │   │   │   ├── vera/        # Main character (Veracity)
│   │   │   │   ├── addie_home/  # Addie at home
│   │   │   │   ├── rainie/      # Rainie
│   │   │   │   └── crone/       # Crone NPC (Chapter 3)
│   │   │   ├── puzzles/
│   │   │   │   ├── gears/       # gear_01.png, gear_02.png, gear_03.png
│   │   │   │   ├── notes/       # dear_vera/*.png fragments
│   │   │   │   └── tea/         # Tea collection game items
│   │   │   ├── items/           # Story items (notebook_01.png, lide_compass.png, etc.)
│   │   │   └── ui/              # UI elements
│   │   └── audio/
│   │       ├── music/           # Background music
│   │       └── sfx/             # Sound effects
│   └── data/
│       └── chapters/            # Chapter JSON files (chapter_01.json, etc.)
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
│   │   └── SubscriptionGateScene.js  # Chapter 2+ gate for non-subscribers
│   ├── systems/
│   │   ├── GameStateManager.js  # Global state management
│   │   ├── SaveManager.js       # localStorage save/load
│   │   └── AudioManager.js      # Music and SFX
│   └── components/
│       ├── BackButton.js        # Reusable back button
│       └── DialogueBox.js       # Dialogue display (planned)
└── index.html
```

## 🎯 Gameplay

### Implemented Chapters

**Chapter 1: The Workshop**
- Wake up in father's home to find his study door locked
- The gear mechanism has been disconnected
- **Choice**: Have tea first (Addie) or fix the gears immediately (Rainie)
- **Puzzle**: Connection (gears) OR Merge (tea brewing)
- Discover father is missing and the study has been ransacked

**Chapter 2: Empty Rooms**
- Explore the ransacked study
- Find torn pieces of a note addressed to Veracity
- **Puzzle**: Piece together the torn note fragments
- **Choice**: Prepare carefully for journey (Addie) or leave immediately (Rainie)
- Discover secret compartment with father's journal and moth symbol box

**Chapter 3: Clockmaker's Guild** (Partially Implemented)
- Opening sequence at the Clockmaker's Guild
- Encounter with the Crone (new NPC character)
- Discover the compass with lid
- **Puzzle**: Sequence puzzle - perform actions in correct order (kick safe 3x, hum 3x, kick 1x)
- Learn about the guild's secrets and your father's work

### Chapter Structure

Each chapter follows this flow:
1. **Opening Narrative** - Story setup with character dialogue
2. **Player Choice** - Choose between Addie's cautious path or Rainie's adventurous path
3. **Puzzle** - Solve the chapter's puzzle (may vary based on choice)
4. **Closing Narrative** - Story conclusion and transition

### Puzzle Types

#### 1. Connection Puzzles
Draw lines connecting matching points (gears, springs, mechanisms).
- Click and drag between connection points
- Connect matching pairs to unlock mechanisms
- **Chapter 1**: Repair the study door lock by connecting gears and springs
- Gears rotate and glow on hover for visual feedback

#### 2. Puzzle Pieces
Arrange torn fragments to reveal the complete image.
- Drag pieces to their correct positions
- Pieces snap into place when positioned correctly
- **Chapter 2**: Reconstruct a torn note from father
- Custom grid layouts (not all pieces are square)
- Click completed image to continue

#### 3. Collection Game (Tea Brewing)
Click to collect floating items.
- Click on items to collect them
- Collect all required items to complete the puzzle
- **Chapter 1 (Alternative)**: Make tea by collecting ingredients
- Items: Teacups, tea leaves, sugar, cream
- Simple, calming gameplay
- Progress bar shows collection status

#### 4. Sequence Puzzles
Perform actions in the correct order to solve the puzzle.
- Click action buttons in the correct sequence
- Visual feedback shows progress
- Actions must be performed in specific order
- **Chapter 2**: Safe/desk puzzle - kick, whistle/hum pattern
- Example: Kick 3 times, hum 3 times, kick 1 time
- Progress tracking shows completed steps

#### 5. Gather & Sort (Planned)
Collect scattered items and arrange them correctly.
- Drag items to matching slots
- Organize by category
- Used for: Repairs, organizing clues, inventory management

#### 6. Rhythm & Breath (Planned)
Tap patterns in rhythm with visual/audio cues.
- Watch the pulsing indicator
- Tap at the right moment
- Used for: Calming exercises, music synchronization, machine timing

### Companion System

Your choices shape the story:
- **Addie (Bear)**: Cautious, protective, safe paths → Builds **Confidence**
  - Suggests careful preparation and safety
  - Example: "No point in trying to start the day on an empty stomach. Who's for a cup of tea?"
- **Rainie (Raccoon)**: Adventurous, risky, bold actions → Builds **Agency**
  - Suggests immediate action and curiosity
  - Example: "No time for tea! Look, the gears are disconnected."

Your choice balance determines your ending!

### Character Expressions

Characters display emotions through different sprite variations:
- **Vera (Veracity)**: happy, sad, neutral, surprised, smirk
- **Addie**: calm, neutral, sad
- **Rainie**: happy, sad, neutral, surprised
- **Crone**: neutral (horizontally flipped in-game, centered positioning)

Expressions change dynamically during dialogue to enhance storytelling.

### Advanced Dialogue Features

- **Expression Changes**: Characters react with different emotions mid-conversation
- **Character Visibility**: Show/hide characters for dramatic effect
  - `hideCharacters: ["crone"]` - Fade out specific characters
  - `showCharacters: ["vera", "addie"]` - Show only specific characters
  - `showOnlyVera: true` - Show only the main character (scales up 10% for emphasis)
- **Midpoint Sections**: Dialogue can have opening, midpoint, and closing sections for better story pacing
- **Background Changes**: Switch backgrounds mid-dialogue for scene transitions
- **Character Folders**: Different sprite sets for different contexts (e.g., `addie_home` vs `addie_outside`)
- **Item Display**: Show story items with dramatic presentation
  - `showItem: "item_key"` - Display item with dimmed background and hidden characters
  - Standard items scale to 90% of screen
  - Special items (compass/lid) scale to 72% and position at 40% height above dialogue
  - Automatically fades in with overlay effect

### Subscription System

The game includes a placeholder subscription system:
- **Chapter 1**: Free to play for all users
- **Chapter 2+**: Requires subscription (placeholder - one-click to activate)
- **Main Menu**: Subscribe button shows subscription status
- **Subscription persists** across sessions via save system

This is a placeholder implementation for future monetization.

## 🎮 Controls

### Game Controls
- **Mouse/Touch**: All interactions (mobile-optimized)
- **Click/Tap**: Select, advance dialogue, make choices
- **Click & Drag**: Connection puzzles, merge game, puzzle pieces
- **Click (Timed)**: Rhythm puzzles (planned)

### Debug Controls (Development)
- **JUMP Button** (top-left): Navigate to any chapter
- **JP Button** (next to JUMP): Test individual puzzles
- **Back Button** (in puzzles): Skip puzzle and return to chapter

## 💾 Save System

- **Auto-save**: Automatically saves after each chapter
- **Manual Save**: Available in settings (3 slots)
- **Continue**: Resume from last checkpoint
- **New Game**: Start fresh (keeps save files)

## 🔧 Development

### Extracting All Dialogue

To export all game dialogue to a single readable file:

```bash
node extract-dialogue.cjs
```

This creates `GAME_DIALOGUE.md` containing:
- All chapter titles and descriptions
- All narrator text and character dialogue
- All player choices
- Organized by chapter with clear formatting

Perfect for reviewing, editing, or sharing the complete game script.

### Editing Chapter Content

Chapter content is stored in JSON files at `/public/data/chapters/`

#### Full Chapter Structure:
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
      "addie": "addie_home"
    }
  },

  "companions": ["addie", "rainie"],

  "dialogue": {
    "opening": [
      {
        "speaker": "Narrator",
        "text": "You find yourself standing in the front hall..."
      },
      {
        "speaker": "Veracity",
        "text": "I did, thank you, but I thought I heard strange noises...",
        "expression": {
          "vera": "happy"
        }
      }
    ],
    "midpoint": [
      {
        "speaker": "Narrator",
        "text": "Optional midpoint section for story pacing..."
      }
    ],
    "closing": [
      {
        "speaker": "Narrator",
        "text": "The gears click into place...",
        "background": "home_office_ransacked_day",
        "hideCharacters": ["vera", "addie"]
      }
    ]
  },

  "choices": [
    {
      "text": "We should check the house carefully...",
      "companion": "addie",
      "consequences": {
        "careful_approach": true
      },
      "puzzle": {
        "type": "connection",
        "title": "The Study Lock",
        "instructions": "Connect the gears..."
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

#### Special Dialogue Properties:
- `expression`: Change character expressions (e.g., `{"vera": "sad", "rainie": "surprised"}`)
- `background`: Switch background mid-dialogue
- `hideCharacters`: Fade out specific characters (array, e.g., `["crone"]`)
- `showCharacters`: Show only specific characters (array, e.g., `["vera", "addie"]`)
- `showOnlyVera`: Show only main character with 10% scale increase (true)
- `showItem`: Display story item with dramatic effect (e.g., `"notebook_01"`, `"lide_compass"`)

#### Puzzle Types:
- `connection` - Connect matching points
- `puzzle_pieces` - Arrange fragments
- `match_three` - Collection game (tea brewing)
- `sequence` - Perform actions in correct order (kick, whistle/hum pattern)
- `gather_sort` - Drag items to slots (planned)
- `rhythm` - Tap timing patterns (planned)

#### Item Assets:
Items displayed via `showItem` should be placed in `/public/assets/images/items/`:
- Example: `notebook_01.png` (Chapter 2 journal)

Edit these files directly—no code changes needed!

### Configuring the Merge Game

The tea merge game uses images from `/public/assets/images/puzzles/tea/`:

**Required Assets:**
- Teacups: `teacup_white.png`, `teacup_metal.png`, `teacup_floral.png`
- Tea Leaves: `tealeaves_01.png`, `tealeaves_02.png`, `tealeaves_03.png`
- Sugar: `sugar_01.png`, `sugar_02.png`, `sugar_03.png`
- Cream: `cream_01.png`, `cream_02.png`, `cream_03.png`

**Background:** `puzzle_tea_01.png` in `/public/assets/images/backgrounds/`

**Chapter JSON Configuration:**
```json
{
  "puzzle": {
    "type": "match_three",
    "title": "Brewing Comfort",
    "instructions": "Match items to collect ingredients!",
    "collectibles": {
      "teacup": 1,
      "tea_leaf": 1,
      "sugar": 1,
      "cream": 1
    }
  }
}
```

The game automatically:
- Shows tutorial on first play (stored in save data)
- Tracks completed goals in header bar
- Allows storage of items in satchel
- Spawns new items periodically

### Adding Audio

1. Place MP3/OGG files in `/public/assets/audio/`
2. Update chapter JSON:
```json
{
  "assets": {
    "music": "your_music_file_name"
  }
}
```

### Testing Features

**In-Game Debug Tools:**
- **JUMP Button** (top-left): Quick navigation to any chapter or puzzle
- **JP Button** (next to JUMP): Direct access to puzzle testing menu

**In Browser Console:**
```javascript
// Jump to specific chapter
game.scene.start('ChapterScene', { chapterNumber: 2 });

// Test specific puzzle
game.scene.start('PuzzleScene', {
  chapterNumber: 1,
  puzzleData: {
    type: 'connection',  // or 'puzzle_pieces', 'match_three', etc.
    title: 'Test Puzzle',
    instructions: 'Test instructions'
  }
});

// Reset game state
gameStateManager.resetState();

// Check current state
console.log(gameStateManager.getState());

// Check completed chapters
console.log(gameStateManager.getCompletedChapters());

// View/modify story flags
console.log(gameStateManager.getFlags());
gameStateManager.setFlag('merge_tutorial_seen', false); // Reset tutorial
```

## 📝 Story Synopsis

### Act 1: Discovery (Chapters 1-4)
The girl discovers her father has been kidnapped by the Order of Temporal Ascension, a cult seeking his time travel device invention.

### Act 2: Journey (Chapters 5-10)
She travels north to the cult's sanctuary, infiltrates it, finds her father, and learns the device is incomplete and dangerous.

### Act 3: Resolution (Chapters 11-14)
She destroys the device, saves her father, returns home, grows in confidence and agency, and discovers her mother may still be alive.

## 🎨 Art Direction

### Steampunk-Whimsical Aesthetic
- Gears, brass, copper tones
- Victorian-era technology
- Warm color palette: #8b5c31 (copper), #c4a575 (brass), #4a5f7a (steel blue)
- Whimsical character designs
- Elements of darkness and hope

### Recommended Style
- Hand-drawn or painted look
- Florence game visual style as reference
- Focus on emotional storytelling through visuals
- Contrast between warm workshop scenes and cold cult environments

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Output will be in `/dist` folder.

### Deploy to Hosting Platforms

**Netlify:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Itch.io:**
1. Run `npm run build`
2. Zip the `dist` folder
3. Upload to itch.io as HTML5 game

## 🐛 Troubleshooting

### Assets Not Loading
- Check file names match exactly (case-sensitive)
- Ensure files are in correct folders under `/public/assets/`
- Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- Check browser console for 404 errors
- Verify PNG format (not JPG renamed to PNG)

### Character Expressions Not Showing
- Check character folder structure: `/characters/girl/`, `/characters/addie_home/`, etc.
- Verify expression files exist: `happy.png`, `sad.png`, `neutral.png`, etc.
- Check `characterFolders` mapping in chapter JSON
- Default folder name is character name (e.g., `girl`, `addie`, `rainie`)

### Puzzle Not Working
- Mobile drag issues: Use two fingers to scroll page, one finger to drag items
- Connection puzzle: Click and hold on gear, drag to matching gear
- Merge game: Drag items onto each other (same type + same level)
- Puzzle pieces: Drag near correct position (snaps within 60px)

### Tutorial Keeps Showing
Reset tutorial flag in browser console:
```javascript
gameStateManager.setFlag('merge_tutorial_seen', false);
```

### Save Not Working
- Check browser's localStorage is enabled
- Private/incognito mode may block localStorage
- Check browser console for quota exceeded errors
- Try clearing other site data to free space

### Performance Issues
- Optimize large image files (recommended: backgrounds 1920x1080, characters 512x512)
- Convert images to compressed PNG
- Use browser DevTools Performance tab to profile
- Reduce number of simultaneous tweens/animations

## 📄 License

This project was created as part of a game development exercise. Feel free to use, modify, and build upon it for your own projects.

## 🙏 Credits

**Game Design & Story**: [Your Name]
**Programming**: Claude Sonnet 4.5
**Engine**: Phaser 3
**Build Tool**: Vite

## 🎮 Have Fun!

This game is about discovery, courage, and the bonds between a girl and her companions. May your journey be filled with wonder!

---

For technical questions or issues, check the browser console for error messages.
