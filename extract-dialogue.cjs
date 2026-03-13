const fs = require('fs');
const path = require('path');

// Helper function to format expression data
function formatExpressions(expressionObj) {
  const expressions = [];
  for (const [character, emotion] of Object.entries(expressionObj)) {
    // Map character keys to readable names
    const charName = character === 'vera' ? 'Vera' :
                     character === 'girl' ? 'Vera' :
                     character === 'addie_home' ? 'Addie' :
                     character === 'addie' ? 'Addie' :
                     character === 'rainie' ? 'Rainie' : character;
    expressions.push(`${charName}: ${emotion}`);
  }
  return expressions.join(', ');
}

let output = '# VERACITY - Complete Game Dialogue\n';
output += '## A Journey of Discovery and Courage\n\n';
output += '---\n\n';

for (let i = 1; i <= 14; i++) {
  const chapterNum = String(i).padStart(2, '0');
  const filePath = path.join('public/data/chapters', `chapter_${chapterNum}.json`);

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    output += `## CHAPTER ${i}: ${data.title}\n`;
    output += `**Act ${data.act}**\n`;
    output += `*${data.description}*\n\n`;

    // Opening dialogue
    if (data.dialogue && data.dialogue.opening) {
      output += '### Opening Scene\n\n';
      data.dialogue.opening.forEach(line => {
        if (line.speaker === 'Narrator') {
          output += `*${line.text}*\n`;
          // Add emotional states if present
          if (line.expression) {
            output += `  *[Expressions: ${formatExpressions(line.expression)}]*\n`;
          }
          output += '\n';
        } else {
          output += `**${line.speaker}:** ${line.text}\n`;
          // Add emotional states if present
          if (line.expression) {
            output += `  *[Expressions: ${formatExpressions(line.expression)}]*\n`;
          }
          output += '\n';
        }
      });
    }

    // Main puzzle (appears after opening dialogue)
    if (data.puzzle) {
      output += `### 🎮 PUZZLE: ${data.puzzle.title}\n`;
      output += `**Type:** ${data.puzzle.type}\n`;
      output += `**Instructions:** ${data.puzzle.instructions}\n\n`;
    }

    // Midpoint dialogue (if exists)
    if (data.dialogue && data.dialogue.midpoint) {
      output += '### Midpoint Scene\n\n';
      data.dialogue.midpoint.forEach(line => {
        if (line.speaker === 'Narrator') {
          output += `*${line.text}*\n`;
          if (line.expression) {
            output += `  *[Expressions: ${formatExpressions(line.expression)}]*\n`;
          }
          output += '\n';
        } else {
          output += `**${line.speaker}:** ${line.text}\n`;
          if (line.expression) {
            output += `  *[Expressions: ${formatExpressions(line.expression)}]*\n`;
          }
          output += '\n';
        }
      });
    }

    // Desk puzzle (appears after midpoint dialogue)
    if (data.deskPuzzle) {
      output += `### 🎮 PUZZLE: ${data.deskPuzzle.title}\n`;
      output += `**Type:** ${data.deskPuzzle.type}\n`;
      output += `**Instructions:** ${data.deskPuzzle.instructions}\n\n`;
    }

    // Choices
    if (data.choices && data.choices.length > 0) {
      output += '### Player Choices\n\n';
      data.choices.forEach((choice, idx) => {
        output += `${idx + 1}. [${choice.companion ? choice.companion.toUpperCase() : 'CHOICE'}] ${choice.text}\n`;
        // If choice has a puzzle, show it
        if (choice.puzzle) {
          output += `   → Leads to puzzle: **${choice.puzzle.title}** (${choice.puzzle.type})\n`;
        }
      });
      output += '\n';
    }

    // Closing dialogue
    if (data.dialogue && data.dialogue.closing) {
      output += '### Closing Scene\n\n';
      data.dialogue.closing.forEach(line => {
        if (line.speaker === 'Narrator') {
          output += `*${line.text}*\n`;
          // Add emotional states if present
          if (line.expression) {
            output += `  *[Expressions: ${formatExpressions(line.expression)}]*\n`;
          }
          output += '\n';
        } else {
          output += `**${line.speaker}:** ${line.text}\n`;
          // Add emotional states if present
          if (line.expression) {
            output += `  *[Expressions: ${formatExpressions(line.expression)}]*\n`;
          }
          output += '\n';
        }
      });
    }

    output += '---\n\n';

  } catch (err) {
    console.error(`Error reading chapter ${i}: ${err.message}`);
  }
}

fs.writeFileSync('GAME_DIALOGUE.md', output, 'utf8');
console.log('✓ Created GAME_DIALOGUE.md with all game dialogue');
