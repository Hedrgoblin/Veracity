/**
 * Character Sheet Generator
 * Combines individual character PNG files into a single sprite sheet
 *
 * Usage: node scripts/create-character-sheet.js <character-name>
 * Example: node scripts/create-character-sheet.js addie
 */

import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

const CHARACTER_WIDTH = 1062;
const CHARACTER_HEIGHT = 1674;

// Expression order (must match game expectations)
const EXPRESSIONS = [
  'neutral',
  'calm',
  'happy_subtle',
  'happy',
  'sad',
  'angry',
  'disgusted',
  'surprised',
  'asleep'
];

async function createCharacterSheet(characterName) {
  console.log(`Creating character sheet for: ${characterName}`);

  const assetsPath = path.join(process.cwd(), 'public/assets/images/characters');
  const outputPath = path.join(assetsPath, `${characterName}_sheet.png`);

  // Calculate sheet dimensions (body + expressions in a row)
  const sheetWidth = CHARACTER_WIDTH * (EXPRESSIONS.length + 1); // +1 for body
  const sheetHeight = CHARACTER_HEIGHT;

  // Create canvas
  const canvas = createCanvas(sheetWidth, sheetHeight);
  const ctx = canvas.getContext('2d');

  // Clear canvas with transparency
  ctx.clearRect(0, 0, sheetWidth, sheetHeight);

  let currentX = 0;

  try {
    // Load and draw body
    console.log(`Loading ${characterName}_body.png...`);
    const bodyPath = path.join(assetsPath, `${characterName}_body.png`);

    if (fs.existsSync(bodyPath)) {
      const bodyImage = await loadImage(bodyPath);
      ctx.drawImage(bodyImage, currentX, 0, CHARACTER_WIDTH, CHARACTER_HEIGHT);
      console.log(`✓ Body added at x:${currentX}`);
      currentX += CHARACTER_WIDTH;
    } else {
      console.warn(`⚠ Body file not found: ${bodyPath}`);
      // Draw placeholder
      ctx.fillStyle = '#4a5f7a';
      ctx.fillRect(currentX, 0, CHARACTER_WIDTH, CHARACTER_HEIGHT);
      currentX += CHARACTER_WIDTH;
    }

    // Load and draw each expression
    for (const expression of EXPRESSIONS) {
      const expressionPath = path.join(assetsPath, `${characterName}_${expression}.png`);

      if (fs.existsSync(expressionPath)) {
        console.log(`Loading ${characterName}_${expression}.png...`);
        const expressionImage = await loadImage(expressionPath);
        ctx.drawImage(expressionImage, currentX, 0, CHARACTER_WIDTH, CHARACTER_HEIGHT);
        console.log(`✓ ${expression} added at x:${currentX}`);
      } else {
        console.log(`- Skipping ${expression} (not found)`);
        // Leave transparent
      }

      currentX += CHARACTER_WIDTH;
    }

    // Save the sprite sheet
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`\n✅ Character sheet created: ${outputPath}`);
    console.log(`   Dimensions: ${sheetWidth}x${sheetHeight}`);
    console.log(`   Frames: ${EXPRESSIONS.length + 1} (body + ${EXPRESSIONS.length} expressions)`);

    // Create metadata JSON
    const metadataPath = path.join(assetsPath, `${characterName}_sheet.json`);
    const metadata = {
      character: characterName,
      frameWidth: CHARACTER_WIDTH,
      frameHeight: CHARACTER_HEIGHT,
      frames: ['body', ...EXPRESSIONS],
      totalFrames: EXPRESSIONS.length + 1
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ Metadata created: ${metadataPath}`);

  } catch (error) {
    console.error('❌ Error creating character sheet:', error);
    process.exit(1);
  }
}

// Get character name from command line
const characterName = process.argv[2];

if (!characterName) {
  console.error('❌ Please provide a character name');
  console.log('Usage: node scripts/create-character-sheet.js <character-name>');
  console.log('Example: node scripts/create-character-sheet.js addie');
  process.exit(1);
}

createCharacterSheet(characterName);
