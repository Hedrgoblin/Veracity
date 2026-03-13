# Character Art Guide - Modular System

## Overview

The game uses a **modular character system** with separate body and expression layers. This makes it easy to create characters with multiple expressions without redrawing the entire character each time.

## Character Specifications

### Dimensions
- **Size**: 1062 x 1674 pixels (portrait format)
- **Format**: PNG with transparency
- **Color Mode**: RGB

### Characters
1. **Vera** (protagonist, Veracity) - 8 expressions, 3 versions
2. **Addie** (bear companion) - 8 expressions, 3 versions
3. **Rainie** (raccoon companion) - 8 expressions, 3 versions
4. **Crone** (NPC, Chapter 3+) - 8 expressions, horizontally flipped in-game, centered positioning
5. **Cultist_bookkeeper** (NPC, Chapter 4+) - 8 expressions, horizontally flipped in-game, centered positioning
6. **Cultist_enforcer** (NPC, Chapter 4+) - 8 expressions, centered positioning
7. **Gentleman** (NPC, Chapter 5+) - 8 expressions, horizontally flipped in-game, centered positioning
8. **Cultist_guard** (NPC, Chapter 7+) - 8 expressions, horizontally flipped in-game, centered positioning
9. **Cultist_guard_staff** (NPC, Chapter 7+) - 8 expressions, horizontally flipped in-game, centered positioning
10. **Da** (NPC, Chapter 7+) - 8 expressions, horizontally flipped in-game, centered positioning, 2 versions
11. **Guildmaster** (NPC, Chapter 8) - 8 expressions, horizontally flipped in-game, centered positioning



## How It Works

### Body Layer
- Contains the character's body, outfit,
- **No facial features** (eyes, mouth, eyebrows)
- Everything except the head

### Expression Layer
- **Transparent PNG** (only the head visible)
- Contains head with facial features in different expressions
- Overlays on top of the body
- Positioned to align with the body layer

### In-Game Rendering
The game displays:
1. Body layer as base
2. Expression layer on top at the same position
3. Expressions can change dynamically during dialogue
