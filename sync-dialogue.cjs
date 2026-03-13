/**
 * Both-way dialogue sync system
 * Usage: node sync-dialogue.cjs [watch|import|export]
 */
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Export: JSON → Markdown (existing functionality)
function exportToMarkdown() {
  console.log('📝 Exporting dialogue to GAME_DIALOGUE.md...');

  // Run the existing extraction script
  const { execSync } = require('child_process');
  execSync('node extract-dialogue.cjs', { stdio: 'inherit' });

  console.log('✓ Export complete');
}

// Import: Markdown → JSON
function importFromMarkdown() {
  console.log('📥 Importing dialogue from GAME_DIALOGUE.md...');

  try {
    const markdown = fs.readFileSync('GAME_DIALOGUE.md', 'utf8');
    const chapters = parseMarkdown(markdown);

    // Update each chapter JSON file
    let updatedCount = 0;
    chapters.forEach(chapter => {
      const chapterNum = String(chapter.number).padStart(2, '0');
      const filePath = path.join('public/data/chapters', `chapter_${chapterNum}.json`);

      if (fs.existsSync(filePath)) {
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Update dialogue sections while preserving other data
        if (chapter.opening) {
          jsonData.dialogue.opening = mergeDialogue(jsonData.dialogue.opening, chapter.opening);
        }
        if (chapter.midpoint) {
          jsonData.dialogue.midpoint = mergeDialogue(jsonData.dialogue.midpoint || [], chapter.midpoint);
        }
        if (chapter.closing) {
          jsonData.dialogue.closing = mergeDialogue(jsonData.dialogue.closing, chapter.closing);
        }

        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
        updatedCount++;
        console.log(`✓ Updated chapter ${chapter.number}`);
      }
    });

    console.log(`✓ Import complete - ${updatedCount} chapters updated`);
  } catch (err) {
    console.error('✗ Import failed:', err.message);
  }
}

// Parse markdown back to structured data
function parseMarkdown(markdown) {
  const chapters = [];
  const lines = markdown.split('\n');

  let currentChapter = null;
  let currentSection = null;
  let currentDialogue = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Chapter header: ## CHAPTER 1: Title
    if (line.match(/^## CHAPTER (\d+):/)) {
      // Save previous section before starting new chapter
      if (currentChapter && currentSection && currentDialogue.length > 0) {
        currentChapter[currentSection] = currentDialogue;
      }

      if (currentChapter) {
        chapters.push(currentChapter);
      }

      const number = parseInt(line.match(/## CHAPTER (\d+):/)[1]);
      currentChapter = { number, opening: null, midpoint: null, closing: null };
      currentSection = null;
      currentDialogue = [];
    }

    // Section header: ### Opening Scene
    else if (line === '### Opening Scene') {
      // Save previous section if it exists
      if (currentSection && currentDialogue.length > 0 && currentChapter) {
        currentChapter[currentSection] = currentDialogue;
      }
      currentSection = 'opening';
      currentDialogue = [];
    }
    else if (line === '### Midpoint Scene') {
      // Save previous section if it exists
      if (currentSection && currentDialogue.length > 0 && currentChapter) {
        currentChapter[currentSection] = currentDialogue;
      }
      currentSection = 'midpoint';
      currentDialogue = [];
    }
    else if (line === '### Closing Scene') {
      // Save previous section if it exists
      if (currentSection && currentDialogue.length > 0 && currentChapter) {
        currentChapter[currentSection] = currentDialogue;
      }
      currentSection = 'closing';
      currentDialogue = [];
    }

    // Dialogue line: **Speaker:** text
    else if (line.match(/^\*\*(.+?):\*\* (.+)$/)) {
      const match = line.match(/^\*\*(.+?):\*\* (.+)$/);
      const speaker = match[1];
      const text = match[2];

      // Skip puzzle marker lines (Type, Instructions, etc.)
      if (speaker === 'Type' || speaker === 'Instructions') {
        continue;
      }

      // Check next line for expressions
      let expressions = null;
      if (i + 1 < lines.length && lines[i + 1].trim().match(/^\*\[Expressions: (.+)\]\*$/)) {
        const exprMatch = lines[i + 1].trim().match(/^\*\[Expressions: (.+)\]\*$/);
        expressions = parseExpressions(exprMatch[1]);
        i++; // Skip the expression line
      }

      currentDialogue.push({ speaker, text, expression: expressions });
    }

    // Narrator line: *text*
    else if (line.match(/^\*(.+)\*$/) && !line.match(/^\*\[Expressions/)) {
      const text = line.match(/^\*(.+)\*$/)[1];

      // Check next line for expressions
      let expressions = null;
      if (i + 1 < lines.length && lines[i + 1].trim().match(/^\*\[Expressions: (.+)\]\*$/)) {
        const exprMatch = lines[i + 1].trim().match(/^\*\[Expressions: (.+)\]\*$/);
        expressions = parseExpressions(exprMatch[1]);
        i++; // Skip the expression line
      }

      currentDialogue.push({ speaker: 'Narrator', text, expression: expressions });
    }

    // End of section
    else if (line === '---' && currentSection && currentDialogue.length > 0) {
      if (currentChapter) {
        currentChapter[currentSection] = currentDialogue;
        currentDialogue = [];
      }
    }
  }

  // Add last chapter
  if (currentChapter) {
    if (currentSection && currentDialogue.length > 0) {
      currentChapter[currentSection] = currentDialogue;
    }
    chapters.push(currentChapter);
  }

  return chapters;
}

// Parse expression string: "Vera: sad, Rainie: happy" → {vera: "sad", rainie: "happy"}
function parseExpressions(exprString) {
  const expressions = {};
  const parts = exprString.split(',').map(s => s.trim());

  parts.forEach(part => {
    const [name, emotion] = part.split(':').map(s => s.trim());
    const key = name === 'Vera' ? 'vera' :
                name === 'Addie' ? 'addie_home' :
                name.toLowerCase();
    expressions[key] = emotion;
  });

  return Object.keys(expressions).length > 0 ? expressions : null;
}

// Merge dialogue while preserving special properties (showItem, hideCharacters, etc.)
function mergeDialogue(oldDialogue, newDialogue) {
  return newDialogue.map((newLine, index) => {
    const oldLine = oldDialogue[index] || {};

    // Keep special properties from old dialogue
    return {
      speaker: newLine.speaker,
      text: newLine.text,
      ...(newLine.expression && { expression: newLine.expression }),
      ...(oldLine.showItem && { showItem: oldLine.showItem }),
      ...(oldLine.hideCharacters !== undefined && { hideCharacters: oldLine.hideCharacters }),
      ...(oldLine.showOnlyVera && { showOnlyVera: oldLine.showOnlyVera }),
      ...(oldLine.background && { background: oldLine.background })
    };
  });
}

// Watch mode: auto-sync on file changes
function watchMode() {
  console.log('👀 Watch mode started - monitoring for changes...');
  console.log('   - JSON changes → auto-export to markdown');
  console.log('   - Markdown changes → auto-import to JSON');
  console.log('   Press Ctrl+C to stop\n');

  let isProcessing = false;

  // Watch chapter JSON files
  const jsonWatcher = chokidar.watch('public/data/chapters/chapter_*.json', {
    persistent: true,
    ignoreInitial: true
  });

  jsonWatcher.on('change', (filePath) => {
    if (isProcessing) return;
    isProcessing = true;

    console.log(`\n📄 ${path.basename(filePath)} changed`);
    exportToMarkdown();

    setTimeout(() => { isProcessing = false; }, 1000);
  });

  // Watch markdown file
  const mdWatcher = chokidar.watch('GAME_DIALOGUE.md', {
    persistent: true,
    ignoreInitial: true
  });

  mdWatcher.on('change', () => {
    if (isProcessing) return;
    isProcessing = true;

    console.log('\n📝 GAME_DIALOGUE.md changed');
    importFromMarkdown();

    setTimeout(() => { isProcessing = false; }, 1000);
  });
}

// Main
const command = process.argv[2] || 'help';

switch (command) {
  case 'export':
    exportToMarkdown();
    break;
  case 'import':
    importFromMarkdown();
    break;
  case 'watch':
    watchMode();
    break;
  default:
    console.log('Dialogue Sync System\n');
    console.log('Usage:');
    console.log('  node sync-dialogue.cjs export  - Export JSON to markdown');
    console.log('  node sync-dialogue.cjs import  - Import markdown to JSON');
    console.log('  node sync-dialogue.cjs watch   - Auto-sync on file changes');
    console.log('\nNote: Import preserves special properties (showItem, etc.)');
}
