# Character Art Guide - Modular System

## Overview

The game uses a **modular character system** with separate body and expression layers. This makes it easy to create characters with multiple expressions without redrawing the entire character each time.

## Character Specifications

### Dimensions
- **Size**: 512 x 512 pixels (recommended)
- **Format**: PNG with transparency
- **Color Mode**: RGB

### Characters

#### Main Characters (16 expressions each)
1. **Vera** (protagonist, Veracity)
   - Variants: `vera_default`, `vera_pajamas`, `vera_green`, `vera_clockworker`
2. **Addie** (bear companion)
   - Variants: `addie_default`, `addie_home`, `addie_clockworker`
3. **Rainie** (raccoon companion)
   - Variants: `rainie_default`, `rainie_pajamas`, `rainie_clockworker`
4. **Guildmaster** (antagonist)
   - Variants: `guildmaster`, `guildmaster_black`
   - Horizontally flipped in-game, centered positioning
   - Auto-solo: always appears alone when speaking

#### Supporting NPCs (8 expressions each)
5. **Crone** (`crone_default`) — Chapter 3+; horizontally flipped in-game, centered positioning
6. **Gentleman Paper** (`gentleman_paper`) — horizontally flipped in-game, centered positioning
7. **Cultist Enforcer** (`cultist_enforcer`) — centered positioning; auto-solo and always shows when speaking
8. **Cultist Bookkeeper** (`cultist_bookkeeper`) — horizontally flipped in-game, centered positioning; auto-solo
9. **Cultist Guard** (`cultist_guard`) — horizontally flipped in-game, centered positioning
10. **Cultist Guard Staff** (`cultist_guard_staff`) — horizontally flipped in-game, centered positioning
11. **Da** (Vera's father, The Professor) — horizontally flipped in-game, centered positioning
    - Variants: `da_default`, `da_moth`, `da_lab`

## How It Works

### Body Layer
- Contains the character's body and outfit
- **No facial features** (eyes, mouth, eyebrows)
- Everything except the head/face

### Expression Layer
- **Transparent PNG** (only the face/head visible)
- Contains head with facial features in different expressions
- Overlays on top of the body at the same position
- Expressions swap dynamically during dialogue

### In-Game Rendering
The game displays:
1. Body layer as base
2. Expression layer on top at the same position
3. Expressions can change mid-dialogue via the `expression` directive in chapter JSON

## File Naming Convention

```
{variant}_body.png          # Base body layer (required)
{variant}_neutral.png       # Default expression (required)
{variant}_happy.png
{variant}_sad.png
{variant}_surprised.png
{variant}_calm.png
{variant}_angry.png
{variant}_smirk.png
{variant}_thinking.png
# ... up to 16 total for main characters
```

Examples:
- `vera_pajamas_body.png`
- `vera_pajamas_happy.png`
- `addie_home_neutral.png`
- `guildmaster_black_angry.png`

## Character Positioning (In-Game)

| Character | X Position | Depth | Notes |
|-----------|-----------|-------|-------|
| Vera | width/2 (centered) | 10 | Main character |
| Addie | width/2 - 75 (left) | 5 | Behind Vera |
| Rainie | width/2 + 90 (right) | 15 | In front |
| NPCs | width/2 (centered) | 12 | Between Vera and Rainie |

NPCs with `setFlipX(true)`: Crone, Guildmaster, Bookkeeper, Gentleman Paper, Guards

## Character Scales (In-Game)

| Character | Scale | Notes |
|-----------|-------|-------|
| Vera | 0.299 | +10% when alone (showOnlyVera) |
| Addie | 0.358 | |
| Rainie | 0.239 | |
| NPCs | Varies | Centered on screen |

## NPC Visibility Rules

- **guildmaster** and **cultist_enforcer**: Always appear when speaking; cannot be hidden by `hideCharacters: true`
- **guildmaster**, **cultist_enforcer**, **cultist_bookkeeper**: autoSolo — appear alone, hiding all other characters
- **All other NPCs**: Must be shown explicitly via `showCharacters: ["npc_name"]` in dialogue JSON
