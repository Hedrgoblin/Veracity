# Dialogue Sync System Guide

## Overview

The dialogue sync system allows you to edit game dialogue in either format:
- **Markdown** (`GAME_DIALOGUE.md`) - Easy to read/edit
- **JSON** (`chapter_XX.json`) - Used by the game

Changes sync automatically in watch mode!

---

## Quick Start

### Option 1: Auto-Sync (Recommended)

Run watch mode in a separate terminal:

```bash
npm run dialogue:watch
```

Now edit either:
- `GAME_DIALOGUE.md` → Auto-imports to JSON files
- Any chapter JSON → Auto-exports to markdown

**Leave this running while you work!**

---

### Option 2: Manual Sync

**After editing JSON files:**
```bash
npm run dialogue:export
```

**After editing GAME_DIALOGUE.md:**
```bash
npm run dialogue:import
```

---

## What Gets Synced

### ✅ Synced Automatically:
- Speaker names
- Dialogue text
- Character expressions/emotions
- Narrator text

### ✅ Preserved During Import:
Special properties from JSON are kept:
- `showItem` (item displays)
- `hideCharacters` (array of character names to hide)
- `showCharacters` (array of character names to show)
- `showOnlyVera` (solo character)
- `background` (scene changes)

### ✅ Filtered Automatically:
The dialogue sync system filters out puzzle markers:
- Lines starting with "Type:" are excluded
- Lines starting with "Instructions:" are excluded
- This keeps the markdown clean and focused on actual dialogue

### ❌ Not Included in Markdown:
These stay in JSON files only:
- Puzzles
- Choices
- Asset references
- Story flags
- Chapter metadata

---

## Editing in Markdown

### Format:

```markdown
## CHAPTER 1: Title

### Opening Scene

*Narrator text in italics*
  *[Expressions: Vera: sad, Rainie: happy]*

**Character Name:** Dialogue text here
  *[Expressions: Vera: neutral]*

### Midpoint Scene

*Additional narrator text for story pacing...*

### Closing Scene

*More narrator text...*
```

### Rules:

1. **Keep the structure** - Don't change headers
2. **Speaker format** - `**Name:** text`
3. **Narrator format** - `*text*`
4. **Expressions** - Next line after dialogue
5. **Character names** - Use: Vera, Addie, Rainie, Crone (not girl, vera_body, etc.)
6. **Midpoint sections** - Optional middle section between opening and closing

---

## Workflow Examples

### Example 1: Quick Dialogue Fix

1. Start watch mode: `npm run dialogue:watch`
2. Open `GAME_DIALOGUE.md`
3. Find and edit the dialogue line
4. Save file
5. **Auto-imported!** Game updated immediately

### Example 2: Adding New Dialogue

⚠️ **Add new lines in JSON first**, then sync:

1. Edit `chapter_02.json` - add new dialogue
2. Run `npm run dialogue:export`
3. Now it appears in markdown for easy reference

### Example 3: Batch Editing

1. Open `GAME_DIALOGUE.md`
2. Use find/replace for character names, phrases, etc.
3. Save file
4. Run `npm run dialogue:import`
5. All chapters updated at once!

---

## Important Notes

### Line Matching
- Import matches dialogue by **position** (line 1 → line 1, etc.)
- Adding/removing lines works, but be careful with alignment
- Always verify changes in-game after import

### Special Properties
- If you edit markdown, `showItem` and other special properties are preserved
- To add special properties, edit the JSON directly

### Safety
- JSON files are your source of truth
- Make git commits before big markdown edits
- Test in-game after importing from markdown

---

## Troubleshooting

**Problem:** Watch mode not detecting changes
- **Solution:** Make sure the file is actually saved (check timestamp)

**Problem:** Import doesn't update the game
- **Solution:** Hard refresh browser (`Cmd+Shift+R`)

**Problem:** Expressions not importing correctly
- **Solution:** Check format: `*[Expressions: Vera: sad, Rainie: happy]*`

**Problem:** Lost special properties (showItem, etc.)
- **Solution:** These are preserved - check the JSON file directly

---

## Advanced: Direct JSON Editing

For complete control, edit JSON files directly:

```json
{
  "speaker": "Veracity",
  "text": "Your dialogue here",
  "expression": {
    "vera": "sad",
    "rainie": "neutral"
  },
  "showItem": "notebook_01",
  "showCharacters": ["vera", "addie"],
  "hideCharacters": ["crone"]
}
```

Then export to markdown:
```bash
npm run dialogue:export
```

---

## Summary

**Best Workflow:**
1. Run `npm run dialogue:watch` in a terminal
2. Run `npm run dev` in another terminal
3. Edit GAME_DIALOGUE.md or JSON files
4. Changes sync automatically
5. Refresh browser to see updates in-game

**Quick Commands:**
- `npm run dialogue:watch` - Auto-sync (recommended)
- `npm run dialogue:export` - JSON → Markdown
- `npm run dialogue:import` - Markdown → JSON

Happy writing! ✍️
