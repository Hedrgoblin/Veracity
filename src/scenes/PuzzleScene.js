/**
 * PuzzleScene - Handles all puzzle mechanics
 */
import Phaser from 'phaser';
import gameStateManager from '../systems/GameStateManager.js';
import BackButton from '../components/BackButton.js';

const BASE = import.meta.env.BASE_URL;

export default class PuzzleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PuzzleScene' });
  }

  init(data) {
    this.puzzleData = data.puzzleData;
    this.chapterNumber = data.chapterNumber;
    this.onCompleteCallback = data.onComplete;
    this.currentPuzzle = null;
  }

  preload() {
    // Load puzzle backgrounds
    if (!this.textures.exists('puzzle_gear_01')) {
      this.load.image('puzzle_gear_01', `${BASE}assets/images/backgrounds/puzzle_gear_01.png`);
    }
    if (!this.textures.exists('puzzle_tea_01')) {
      this.load.image('puzzle_tea_01', `${BASE}assets/images/backgrounds/puzzle_tea_01.png`);
    }
    if (!this.textures.exists('home_office_safe_closed')) {
      this.load.image('home_office_safe_closed', `${BASE}assets/images/backgrounds/home_office_safe_closed.png`);
    }
    if (!this.textures.exists('home_office_safe_open')) {
      this.load.image('home_office_safe_open', `${BASE}assets/images/backgrounds/home_office_safe_open.png`);
    }

    // Load gear images for connection puzzles
    if (!this.textures.exists('gear_01')) {
      this.load.image('gear_01', `${BASE}assets/images/puzzles/gears/gear_01.png`);
    }
    if (!this.textures.exists('gear_02')) {
      this.load.image('gear_02', `${BASE}assets/images/puzzles/gears/gear_02.png`);
    }
    if (!this.textures.exists('gear_03')) {
      this.load.image('gear_03', `${BASE}assets/images/puzzles/gears/gear_03.png`);
    }

    // Load note puzzle pieces (if they exist)
    for (let i = 1; i <= 7; i++) {
      const key = `note_piece_${i}`;
      if (!this.textures.exists(key)) {
        const num = i.toString().padStart(2, '0');
        this.load.image(key, `${BASE}assets/images/puzzles/notes/dear_vera/dear_vera_${num}.png`);
      }
    }

    // Load final note image
    if (!this.textures.exists('note_dear_vera')) {
      this.load.image('note_dear_vera', `${BASE}assets/images/puzzles/notes/dear_vera/note_dear_vera.png`);
    }

    // Load sequence puzzle items
    if (!this.textures.exists('kick_01')) {
      this.load.image('kick_01', `${BASE}assets/images/items/kick_01.png`);
    }
    if (!this.textures.exists('kick_02')) {
      this.load.image('kick_02', `${BASE}assets/images/items/kick_02.png`);
    }
    if (!this.textures.exists('whistle_vera')) {
      this.load.image('whistle_vera', `${BASE}assets/images/items/whistle_vera.png`);
    }

    // Load tea puzzle items
    const teaItems = [
      'cream_01', 'cream_02', 'cream_03',
      'sugar_01', 'sugar_02', 'sugar_03',
      'tealeaves_01', 'tealeaves_02', 'tealeaves_03',
      'teacup_white', 'teacup_metal', 'teacup_floral',
      'lemon_slice', 'lemon_slice2', 'lemon_pile'
    ];

    teaItems.forEach(item => {
      if (!this.textures.exists(item)) {
        this.load.image(item, `${BASE}assets/images/puzzles/tea/${item}.png`);
      }
    });

    // Load tea service equipment and ingredient icons
    ['icon_faucet', 'icon_ice', 'icon_trash',
     'icon_tea_black', 'icon_trea_herbal', 'icon_creamer', 'icon_lemon', 'icon_sugar',
     'icon_teapot_bear', 'icon_teapot_bird', 'icon_teapot_green'].forEach(key => {
      if (!this.textures.exists(key)) {
        this.load.image(key, `${BASE}assets/images/puzzles/tea_items/${key}.png`);
      }
    });
    ['addie', 'cultist_bookkeeper', 'cultist_enforcer',
     'cultist_guard', 'cultist_guard_staff', 'da',
     'gentleman_paper', 'guildmaster', 'rainie', 'vera'].forEach(char => {
      const key = `tea_teacup_${char}`;
      if (!this.textures.exists(key)) {
        this.load.image(key, `${BASE}assets/images/puzzles/tea_items/icon_teacup_${char}.png`);
      }
    });
    ['addie_default', 'cultist_bookkeeper', 'cultist_enforcer', 'cultist_guard',
     'cultist_guard_staff', 'da_default', 'genlteman_paper', 'rainie_default', 'vera_default'].forEach(char => {
      ['happy', 'neutral', 'irritated'].forEach(state => {
        const key = `tea_char_${char}_${state}`;
        if (!this.textures.exists(key)) {
          this.load.image(key, `${BASE}assets/images/puzzles/tea_character_icons/icon_${char}_${state}.png`);
        }
      });
    });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Semi-transparent background overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(50);

    // Puzzle container (in front of characters)
    this.puzzleContainer = this.add.container(width / 2, height / 2);
    this.puzzleContainer.setDepth(100);

    // Add back button
    this.backButton = new BackButton(this, () => {
      console.log('Back button clicked - skipping puzzle');
      // Return to chapter without completing puzzle
      if (this.onCompleteCallback) {
        this.onCompleteCallback();
      }
    });

    // Create puzzle based on type
    switch (this.puzzleData.type) {
      case 'connection':
        this.createConnectionPuzzle();
        break;
      case 'rhythm':
        this.createRhythmPuzzle();
        break;
      case 'gather_sort':
        this.createGatherSortPuzzle();
        break;
      case 'puzzle_pieces':
        this.createPuzzlePiecesPuzzle();
        break;
      case 'match_three':
        this.createMatchThreePuzzle();
        break;
      case 'tea_service':
        this.createTeaServicePuzzle();
        break;
      case 'maze':
        this.createMazePuzzle();
        break;
      case 'sequence':
        this.createSequencePuzzle();
        break;
      default:
        console.error(`Unknown puzzle type: ${this.puzzleData.type}`);
        this.completePuzzle();
    }
  }

  createConnectionPuzzle() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add gear puzzle background (close-up of door)
    const gearBg = this.add.image(width / 2, height / 2, 'puzzle_gear_01');

    // Scale background to fit screen width while maintaining aspect ratio
    const bgScale = width / gearBg.width;
    gearBg.setScale(bgScale);
    gearBg.setDepth(95); // Behind puzzle container but in front of dark overlay

    // Title (mobile-optimized, positioned at top)
    const title = this.add.text(0, -350, this.puzzleData.title || 'Connect the Points', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold',
      wordWrap: { width: width - 40 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(title);

    // Instructions (mobile-optimized)
    const instructions = this.add.text(0, -310, this.puzzleData.instructions || 'Draw lines to connect matching points', {
      fontSize: '13px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      wordWrap: { width: width - 60 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(instructions);

    // Gear positions - use chapter data if available, otherwise fall back to hardcoded Chapter 1 positions
    let gearPositions;

    if (this.puzzleData.points && this.puzzleData.points.length > 0) {
      // Use points from chapter JSON (center-relative coordinates)
      gearPositions = this.puzzleData.points.map(point => ({
        id: point.id,
        x: point.x,
        y: point.y,
        pair: point.pair,
        isRelativeToCenter: true
      }));
    } else {
      // Fall back to hardcoded Chapter 1 positions (background native coordinates)
      gearPositions = [
        { id: 'gear1', nativeX: 188, nativeY: 247, pair: 'gear2' },
        { id: 'gear2', nativeX: 540, nativeY: 247, pair: 'gear1' },
        { id: 'spring1', nativeX: 188, nativeY: 1324, pair: 'spring2' },
        { id: 'spring2', nativeX: 540, nativeY: 1324, pair: 'spring1' }
      ];
    }

    this.connectionPoints = {};
    this.connections = [];
    this.currentLine = null;
    this.graphics = this.add.graphics();
    this.graphics.setDepth(96); // Above background

    gearPositions.forEach((pointData, index) => {
      // Use different gear images for variety
      const gearKey = `gear_0${(index % 3) + 1}`;

      let screenX, screenY;

      if (pointData.isRelativeToCenter) {
        // New format: coordinates relative to screen center
        // Scale coordinates to fit smaller screens and spread vertically
        const scaleX = Math.min(width / 600, 1); // Horizontal scale

        // Vertical positioning - spread gears to use more vertical space
        // Map y: -100 to top area, y: 100 to bottom area
        const verticalSpread = height * 0.35; // Use 35% of screen height from center
        const normalizedY = pointData.y / 100; // -1 for top, +1 for bottom

        screenX = width / 2 + (pointData.x * scaleX);
        screenY = height / 2 + (normalizedY * verticalSpread);
      } else {
        // Old format: native background coordinates
        const scaledX = pointData.nativeX * bgScale;
        const scaledY = pointData.nativeY * bgScale;

        const bgLeft = width / 2 - (gearBg.width * bgScale) / 2;
        const bgTop = height / 2 - (gearBg.height * bgScale) / 2;

        screenX = bgLeft + scaledX;
        screenY = bgTop + scaledY;
      }

      const point = this.add.image(screenX, screenY, gearKey);

      // Calculate scale to make gears approximately 120px square
      const targetSize = 120;
      const gearScale = targetSize / point.width;
      point.setScale(gearScale);

      point.setInteractive({ useHandCursor: true, draggable: false });
      point.setData('pointData', pointData);
      point.setData('rotationTween', null); // Store rotation tween reference
      point.setData('baseScale', gearScale); // Store base scale for hover effect
      point.setDepth(97); // Above graphics

      // Hover effect - light up and rotate
      point.on('pointerover', () => {
        point.setTint(0xffed4e); // Light up (golden glow)
        point.setScale(gearScale * 1.1); // Slightly bigger (10% larger)

        // Start slow rotation
        const rotationTween = this.tweens.add({
          targets: point,
          angle: 360,
          duration: 3000, // 3 seconds for full rotation
          repeat: -1, // Infinite loop
          ease: 'Linear'
        });
        point.setData('rotationTween', rotationTween);
      });

      point.on('pointerout', () => {
        point.clearTint(); // Remove glow
        point.setScale(gearScale); // Return to normal size

        // Stop and reset rotation
        const rotationTween = point.getData('rotationTween');
        if (rotationTween) {
          rotationTween.stop();
          point.setData('rotationTween', null);
        }

        // Smoothly return to 0 rotation
        this.tweens.add({
          targets: point,
          angle: 0,
          duration: 300,
          ease: 'Cubic.out'
        });
      });

      // Start connection
      point.on('pointerdown', () => {
        this.startConnection(point);
      });

      // Don't add to puzzle container - using absolute positioning
      this.connectionPoints[pointData.id] = point;
    });

    // Handle drag for drawing line
    this.input.on('pointermove', (pointer) => {
      if (this.currentLine) {
        this.updateConnectionLine(pointer);
      }
    });

    this.input.on('pointerup', (pointer) => {
      if (this.currentLine) {
        this.endConnection(pointer);
      }
    });
  }

  startConnection(point) {
    this.currentLine = {
      startPoint: point,
      startX: point.x,
      startY: point.y
    };
  }

  updateConnectionLine(pointer) {
    if (!this.currentLine) return;

    this.graphics.clear();

    // Draw existing connections with glow effect
    this.connections.forEach(conn => {
      this.drawGlowingLine(conn.p1.x, conn.p1.y, conn.p2.x, conn.p2.y);
    });

    // Draw current line with glow effect (using screen coordinates)
    this.drawGlowingLine(
      this.currentLine.startX,
      this.currentLine.startY,
      pointer.x,
      pointer.y
    );
  }

  drawGlowingLine(x1, y1, x2, y2) {
    // Draw outer glow (thicker, semi-transparent)
    this.graphics.lineStyle(12, 0x87ceeb, 0.3); // Pale blue glow
    this.graphics.lineBetween(x1, y1, x2, y2);

    // Draw middle glow
    this.graphics.lineStyle(6, 0x87ceeb, 0.6); // Brighter pale blue
    this.graphics.lineBetween(x1, y1, x2, y2);

    // Draw core line
    this.graphics.lineStyle(3, 0xadd8e6, 1.0); // Bright pale blue core
    this.graphics.lineBetween(x1, y1, x2, y2);
  }

  endConnection(pointer) {
    if (!this.currentLine) return;

    // Check if pointer is over another point (using screen coordinates)
    let endPoint = null;

    Object.values(this.connectionPoints).forEach(point => {
      const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, point.x, point.y);
      if (distance < 50 && point !== this.currentLine.startPoint) {
        endPoint = point;
      }
    });

    if (endPoint) {
      const startData = this.currentLine.startPoint.getData('pointData');
      const endData = endPoint.getData('pointData');

      // Check if this is a valid connection
      if (startData.pair === endData.id) {
        this.connections.push({
          p1: this.currentLine.startPoint,
          p2: endPoint,
          valid: true
        });

        // Visual feedback
        this.tweens.add({
          targets: [this.currentLine.startPoint, endPoint],
          scale: 1.2,
          duration: 200,
          yoyo: true
        });
      }
    }

    this.currentLine = null;
    this.graphics.clear();

    // Redraw all connections with glow effect
    this.connections.forEach(conn => {
      this.drawGlowingLine(conn.p1.x, conn.p1.y, conn.p2.x, conn.p2.y);
    });

    // Check if puzzle is complete
    this.checkConnectionPuzzleComplete();
  }

  checkConnectionPuzzleComplete() {
    const requiredConnections = (this.puzzleData.points?.length || 4) / 2;

    if (this.connections.length >= requiredConnections) {
      this.time.delayedCall(500, () => {
        this.completePuzzle();
      });
    }
  }

  createRhythmPuzzle() {
    const width = this.cameras.main.width;

    // Title (mobile-optimized)
    const title = this.add.text(0, -300, this.puzzleData.title || 'Rhythm Pattern', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold',
      wordWrap: { width: width - 40 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(title);

    // Instructions (mobile-optimized)
    const instructions = this.add.text(0, -250, this.puzzleData.instructions || 'Tap the pattern when the circle aligns', {
      fontSize: '13px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      wordWrap: { width: width - 60 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(instructions);

    // Create rhythm target
    const targetCircle = this.add.circle(0, 0, 80, 0x8b5c31, 0.3);
    targetCircle.setStrokeStyle(4, 0x8b5c31);
    this.puzzleContainer.add(targetCircle);

    // Create pulsing circle
    const pulseCircle = this.add.circle(0, 0, 10, 0xffd700);
    this.puzzleContainer.add(pulseCircle);

    // Rhythm pattern (times in ms)
    const pattern = this.puzzleData.pattern || [1000, 2000, 3000, 4500];
    let currentBeat = 0;
    let successfulHits = 0;

    // Pulse animation
    const pulseTween = this.tweens.add({
      targets: pulseCircle,
      scale: 8,
      alpha: 0.5,
      duration: 1000,
      ease: 'Power2',
      repeat: -1,
      onRepeat: () => {
        pulseCircle.setScale(1);
        pulseCircle.setAlpha(1);
      }
    });

    // Handle tap input
    const tapZone = this.add.rectangle(0, 0, 200, 200, 0xffffff, 0.001);
    tapZone.setInteractive({ useHandCursor: true });
    this.puzzleContainer.add(tapZone);

    tapZone.on('pointerdown', () => {
      // Check if tap is within tolerance window
      const currentTime = this.time.now;
      const targetTime = pattern[currentBeat];
      const tolerance = 200; // ms

      if (Math.abs((currentTime % 5000) - targetTime) < tolerance) {
        // Successful hit
        successfulHits++;
        currentBeat++;

        // Visual feedback
        this.tweens.add({
          targets: pulseCircle,
          scale: 2,
          duration: 100,
          yoyo: true
        });

        // Check if pattern complete
        if (currentBeat >= pattern.length) {
          pulseTween.stop();
          this.time.delayedCall(500, () => {
            this.completePuzzle();
          });
        }
      } else {
        // Missed beat - visual feedback
        this.cameras.main.shake(100, 0.005);
      }
    });
  }

  createGatherSortPuzzle() {
    const width = this.cameras.main.width;

    // Title (mobile-optimized)
    const title = this.add.text(0, -220, this.puzzleData.title || 'Gather and Sort', {
      fontSize: '18px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold',
      wordWrap: { width: width - 40 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(title);

    // Instructions (mobile-optimized)
    const instructions = this.add.text(0, -180, this.puzzleData.instructions || 'Drag items to the correct slots', {
      fontSize: '12px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      wordWrap: { width: width - 60 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(instructions);

    // Create slots
    const slots = this.puzzleData.slots || ['gear', 'spring', 'bolt'];
    this.slots = {};

    // Adjust spacing for mobile (more compact)
    const slotSpacing = Math.min(110, (width - 80) / slots.length);

    slots.forEach((slotType, index) => {
      const x = -(slotSpacing * (slots.length - 1) / 2) + index * slotSpacing;
      const y = 50;

      const slot = this.add.rectangle(x, y, 100, 100, 0x333333);
      slot.setStrokeStyle(3, 0x8b5c31);
      slot.setData('slotType', slotType);
      slot.setData('filled', false);

      const label = this.add.text(x, y + 70, slotType.toUpperCase(), {
        fontSize: '14px',
        fontFamily: 'Courier New',
        color: '#8b5c31'
      }).setOrigin(0.5);

      this.puzzleContainer.add([slot, label]);
      this.slots[slotType] = slot;
    });

    // Create draggable items
    const items = [...slots].sort(() => Math.random() - 0.5); // Shuffle
    this.items = [];

    items.forEach((itemType, index) => {
      const x = -(slotSpacing * (items.length - 1) / 2) + index * slotSpacing;
      const y = -80;

      const item = this.add.rectangle(x, y, 90, 90, 0xffd700);
      item.setStrokeStyle(3, 0x8b5c31);
      item.setData('itemType', itemType);
      item.setData('originalX', x);
      item.setData('originalY', y);
      item.setInteractive({ useHandCursor: true });

      const itemLabel = this.add.text(x, y, itemType.charAt(0).toUpperCase(), {
        fontSize: '32px',
        fontFamily: 'Courier New',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      item.setData('label', itemLabel);

      // Drag events
      item.on('drag', (pointer, dragX, dragY) => {
        // Convert world coordinates to container local coordinates
        const containerBounds = this.puzzleContainer.getBounds();
        const localX = dragX - containerBounds.x - this.puzzleContainer.x;
        const localY = dragY - containerBounds.y - this.puzzleContainer.y;

        item.x = localX;
        item.y = localY;
        itemLabel.x = localX;
        itemLabel.y = localY;
      });

      item.on('dragend', () => {
        this.checkItemPlacement(item);
      });

      this.puzzleContainer.add([item, itemLabel]);
      this.items.push(item);

      // Enable dragging after adding to container
      this.input.setDraggable(item);
    });
  }

  checkItemPlacement(item) {
    const itemType = item.getData('itemType');
    let placed = false;

    // Check if item is over correct slot
    Object.values(this.slots).forEach(slot => {
      const distance = Phaser.Math.Distance.Between(item.x, item.y, slot.x, slot.y);

      if (distance < 60 && slot.getData('slotType') === itemType && !slot.getData('filled')) {
        // Correct placement
        item.x = slot.x;
        item.y = slot.y;
        item.getData('label').x = slot.x;
        item.getData('label').y = slot.y;
        item.disableInteractive();
        slot.setData('filled', true);
        placed = true;

        // Visual feedback
        this.tweens.add({
          targets: item,
          scale: 1.2,
          duration: 200,
          yoyo: true
        });
      }
    });

    if (!placed) {
      // Return to original position
      this.tweens.add({
        targets: [item, item.getData('label')],
        x: item.getData('originalX'),
        y: item.getData('originalY'),
        duration: 300,
        ease: 'Back.out'
      });
    } else {
      // Check if all items are placed
      this.checkGatherSortComplete();
    }
  }

  checkGatherSortComplete() {
    const allFilled = Object.values(this.slots).every(slot => slot.getData('filled'));

    if (allFilled) {
      this.time.delayedCall(500, () => {
        this.completePuzzle();
      });
    }
  }

  createPuzzlePiecesPuzzle() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title
    const title = this.add.text(0, -300, this.puzzleData.title || 'Arrange the Pieces', {
      fontSize: '18px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold',
      wordWrap: { width: width - 40 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(title);

    // Instructions
    const instructions = this.add.text(0, -260, this.puzzleData.instructions || 'Drag pieces to their correct positions', {
      fontSize: '12px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      wordWrap: { width: width - 60 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(instructions);

    const pieceCount = this.puzzleData.pieceCount || 7;
    this.puzzlePieces = [];
    this.puzzleSlots = [];
    this.correctPlacements = 0;

    // Create slots with custom layout:
    // Row 1: pieces 1, 2 (2 pieces)
    // Row 2: pieces 3, 4 (2 pieces)
    // Row 3: piece 5 (1 piece, centered)
    // Row 4: pieces 6, 7 (2 pieces)
    const slotWidth = 100;
    const slotHeight = 70;
    const slotSpacing = 10;
    const rowSpacing = 10;
    const startY = -150;

    const slotPositions = [
      // Row 1: pieces 1, 2
      { x: -(slotWidth / 2 + slotSpacing / 2), y: startY },
      { x: (slotWidth / 2 + slotSpacing / 2), y: startY },
      // Row 2: pieces 3, 4
      { x: -(slotWidth / 2 + slotSpacing / 2), y: startY + slotHeight + rowSpacing },
      { x: (slotWidth / 2 + slotSpacing / 2), y: startY + slotHeight + rowSpacing },
      // Row 3: piece 5 (centered)
      { x: 0, y: startY + 2 * (slotHeight + rowSpacing) },
      // Row 4: pieces 6, 7
      { x: -(slotWidth / 2 + slotSpacing / 2), y: startY + 3 * (slotHeight + rowSpacing) },
      { x: (slotWidth / 2 + slotSpacing / 2), y: startY + 3 * (slotHeight + rowSpacing) }
    ];

    // Create slots
    for (let i = 0; i < pieceCount; i++) {
      const pos = slotPositions[i];

      const slot = this.add.rectangle(pos.x, pos.y, slotWidth, slotHeight, 0x333333, 0.5);
      slot.setStrokeStyle(2, 0x8b5c31);
      slot.setData('slotIndex', i);
      slot.setData('filled', false);

      this.puzzleContainer.add(slot);
      this.puzzleSlots.push(slot);
    }

    // Create shuffled pieces scattered around
    const piecePositions = [];
    for (let i = 0; i < pieceCount; i++) {
      // Random positions around the edges
      const angle = (i / pieceCount) * Math.PI * 2;
      const radius = 150;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius + 100;
      piecePositions.push({ x, y, index: i });
    }

    // Shuffle positions
    piecePositions.sort(() => Math.random() - 0.5);

    // Create pieces
    for (let i = 0; i < pieceCount; i++) {
      const pos = piecePositions[i];

      // Try to load image piece, otherwise use placeholder
      const pieceKey = `note_piece_${i + 1}`;
      let piece;
      let label = null;

      if (this.textures.exists(pieceKey)) {
        // Use actual image
        piece = this.add.image(pos.x, pos.y, pieceKey);
        piece.setScale(0.8);
      } else {
        // Placeholder piece (colored rectangle with number)
        piece = this.add.rectangle(pos.x, pos.y, 90, 70, 0xffd700);
        piece.setStrokeStyle(3, 0x8b5c31);

        label = this.add.text(pos.x, pos.y, (i + 1).toString(), {
          fontSize: '28px',
          fontFamily: 'Courier New',
          color: '#000000',
          fontStyle: 'bold'
        }).setOrigin(0.5);
      }

      piece.setData('correctIndex', i); // This piece belongs to slot i
      piece.setData('locked', false);
      piece.setData('label', label);
      piece.setInteractive({ useHandCursor: true });

      // Drag events
      piece.on('drag', (pointer, dragX, dragY) => {
        if (piece.getData('locked')) return;

        // Convert world coordinates to container local coordinates
        const localPoint = this.puzzleContainer.pointToContainer(pointer);

        piece.x = localPoint.x;
        piece.y = localPoint.y;
        if (label) {
          label.x = localPoint.x;
          label.y = localPoint.y;
        }
      });

      piece.on('dragend', () => {
        if (piece.getData('locked')) return;
        this.checkPiecePlacement(piece);
      });

      // Add to container
      if (label) {
        this.puzzleContainer.add([piece, label]);
      } else {
        this.puzzleContainer.add(piece);
      }
      this.puzzlePieces.push(piece);

      // Enable dragging
      this.input.setDraggable(piece);
    }
  }

  checkPiecePlacement(piece) {
    const correctIndex = piece.getData('correctIndex');
    const correctSlot = this.puzzleSlots[correctIndex];
    const label = piece.getData('label');

    // Check if piece is close to its correct slot
    const distance = Phaser.Math.Distance.Between(piece.x, piece.y, correctSlot.x, correctSlot.y);

    if (distance < 60) {
      // Lock piece in place
      piece.setData('locked', true);
      piece.x = correctSlot.x;
      piece.y = correctSlot.y;
      correctSlot.setData('filled', true);

      // Visual feedback - only change color for placeholder rectangles
      if (piece.type === 'Rectangle') {
        piece.setFillStyle(0x4a90e2); // Change color to blue when locked
      } else {
        // For images, add a subtle glow effect
        piece.setTint(0xaaddff);
      }

      this.correctPlacements++;

      // Check if all pieces are in place
      if (this.correctPlacements === this.puzzleData.pieceCount) {
        this.time.delayedCall(800, () => {
          this.revealFinalImage();
        });
      }
    }
  }

  revealFinalImage() {
    // Hide all pieces and slots
    this.puzzlePieces.forEach(piece => {
      const label = piece.getData('label');
      this.tweens.add({
        targets: [piece, label],
        alpha: 0,
        duration: 500
      });
    });

    this.puzzleSlots.forEach(slot => {
      this.tweens.add({
        targets: slot,
        alpha: 0,
        duration: 500
      });
    });

    // Hide the entire puzzle container (title, instructions, etc.)
    this.tweens.add({
      targets: this.puzzleContainer,
      alpha: 0,
      duration: 500
    });

    // Show final image after fade out
    this.time.delayedCall(600, () => {
      const finalImageKey = this.puzzleData.finalImage || 'note_dear_vera';

      // Create placeholder if image doesn't exist
      if (!this.textures.exists(finalImageKey)) {
        console.warn(`Final image '${finalImageKey}' not found, creating placeholder`);

        // Create a placeholder rectangle - center on screen
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const placeholder = this.add.rectangle(width / 2, height / 2, 300, 240, 0xffffff);
        placeholder.setStrokeStyle(3, 0x8b5c31);
        placeholder.setInteractive({ useHandCursor: true });
        placeholder.setDepth(200);

        const placeholderText = this.add.text(width / 2, height / 2, 'Dear Vera,\n\n[Note content\nwill appear here]\n\n(Click to continue)', {
          fontSize: '16px',
          fontFamily: 'Courier New',
          color: '#000000',
          align: 'center',
          wordWrap: { width: 280 }
        }).setOrigin(0.5);
        placeholderText.setDepth(201);

        placeholder.setAlpha(0);
        placeholderText.setAlpha(0);

        this.tweens.add({
          targets: [placeholder, placeholderText],
          alpha: 1,
          duration: 800,
          ease: 'Cubic.out'
        });

        // Click to continue
        placeholder.once('pointerdown', () => {
          this.completePuzzle();
        });
      } else {
        // Show actual image - center on screen, not in puzzle container
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const finalImage = this.add.image(width / 2, height / 2, finalImageKey);

        // Scale to fit within screen with padding
        const maxWidth = width - 80; // 40px padding on each side
        const maxHeight = height - 100; // Less restriction since UI is hidden

        const scaleX = maxWidth / finalImage.width;
        const scaleY = maxHeight / finalImage.height;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down

        finalImage.setScale(scale);
        finalImage.setInteractive({ useHandCursor: true });
        finalImage.setDepth(200); // Above everything else

        finalImage.setAlpha(0);
        this.tweens.add({
          targets: finalImage,
          alpha: 1,
          duration: 800,
          ease: 'Cubic.out'
        });

        // Click to continue
        finalImage.once('pointerdown', () => {
          this.completePuzzle();
        });
      }
    });
  }

  createMatchThreePuzzle() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add tea puzzle background
    const teaBg = this.add.image(width / 2, height / 2, 'puzzle_tea_01');
    const bgScale = width / teaBg.width;
    teaBg.setScale(bgScale);
    teaBg.setDepth(95); // Behind puzzle container but in front of dark overlay

    // Title
    const title = this.add.text(0, -350, this.puzzleData.title || "Let's Make Tea", {
      fontSize: '18px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold',
      wordWrap: { width: width - 40 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(title);

    // Instructions
    const instructions = this.add.text(0, -320, 'Click the items to collect them', {
      fontSize: '12px',
      fontFamily: 'Courier New',
      color: '#000000',
      wordWrap: { width: width - 60 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(instructions);

    // Simple collection game setup
    this.itemTypes = {
      teacup: { imageKey: 'teacup_floral', name: 'Teacup' },
      tea_leaf: { imageKey: 'tealeaves_03', name: 'Tea Leaves' },
      sugar: { imageKey: 'sugar_03', name: 'Sugar' },
      cream: { imageKey: 'cream_03', name: 'Cream' }
    };

    // Track what needs to be collected
    this.requiredItems = this.puzzleData.collectibles || { teacup: 3, tea_leaf: 3, sugar: 3, cream: 3 };
    this.collected = {};
    Object.keys(this.requiredItems).forEach(key => {
      this.collected[key] = 0;
    });

    // Create progress UI at top
    this.createCollectionUI();

    // Spawn items to collect
    this.spawnedItems = [];
    this.spawnCollectionItems();
  }

  createCollectionUI() {
    const width = this.cameras.main.width;

    // Progress header showing what to collect
    const headerBg = this.add.rectangle(width / 2, 40, width - 20, 80, 0x000000, 0.8);
    headerBg.setStrokeStyle(2, 0x8b5c31);
    headerBg.setDepth(150);

    const headerTitle = this.add.text(width / 2, 20, 'Collect:', {
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(151);

    // Show progress for each item type
    this.progressTexts = {};
    let xPos = 30;
    const yPos = 50;

    Object.keys(this.requiredItems).forEach(typeName => {
      const itemData = this.itemTypes[typeName];
      const needed = this.requiredItems[typeName];

      // Small icon
      const icon = this.add.image(xPos, yPos, itemData.imageKey);
      icon.setScale(25 / icon.width);
      icon.setDepth(151);

      // Progress text
      const progressText = this.add.text(xPos + 20, yPos, `0/${needed}`, {
        fontSize: '12px',
        fontFamily: 'Courier New',
        color: '#ffffff'
      }).setOrigin(0, 0.5).setDepth(151);

      this.progressTexts[typeName] = progressText;
      xPos += 85;
    });
  }

  spawnCollectionItems() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Spawn all needed items randomly on screen
    Object.keys(this.requiredItems).forEach(typeName => {
      const needed = this.requiredItems[typeName];
      const itemData = this.itemTypes[typeName];

      for (let i = 0; i < needed; i++) {
        // Random position in the playable area
        const x = Phaser.Math.Between(50, width - 50);
        const y = Phaser.Math.Between(150, height - 150);

        const item = this.add.image(x, y, itemData.imageKey);
        item.setScale(60 / item.width);
        item.setInteractive({ useHandCursor: true });
        item.setData('typeName', typeName);
        item.setDepth(100);

        // Gentle floating animation
        this.tweens.add({
          targets: item,
          y: y - 10,
          duration: 2000 + Math.random() * 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Gentle rotation
        this.tweens.add({
          targets: item,
          angle: Phaser.Math.Between(-5, 5),
          duration: 3000 + Math.random() * 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Click to collect
        item.on('pointerdown', () => {
          this.collectItem(item, typeName);
        });

        // Hover effect
        item.on('pointerover', () => {
          item.setTint(0xffed4e); // Golden glow
          this.tweens.add({
            targets: item,
            scale: (60 / item.width) * 1.2,
            duration: 200,
            ease: 'Back.out'
          });
        });

        item.on('pointerout', () => {
          item.clearTint();
          this.tweens.add({
            targets: item,
            scale: 60 / item.width,
            duration: 200
          });
        });

        this.spawnedItems.push(item);
      }
    });
  }

  collectItem(item, typeName) {
    const width = this.cameras.main.width;

    // Increment collected count
    this.collected[typeName]++;
    const needed = this.requiredItems[typeName];

    // Update progress text
    this.progressTexts[typeName].setText(`${this.collected[typeName]}/${needed}`);

    // Add glow effect if completed this type
    if (this.collected[typeName] >= needed) {
      this.progressTexts[typeName].setColor('#51cf66'); // Green
      this.tweens.add({
        targets: this.progressTexts[typeName],
        scale: 1.2,
        duration: 200,
        yoyo: true
      });
    }

    // Satisfying collection animation
    const targetX = 30 + Object.keys(this.requiredItems).indexOf(typeName) * 85;
    const targetY = 50;

    // Create sparkle effect
    const sparkle = this.add.circle(item.x, item.y, 30, 0xffd700, 0.6);
    sparkle.setDepth(200);
    this.tweens.add({
      targets: sparkle,
      scale: 2,
      alpha: 0,
      duration: 400,
      onComplete: () => sparkle.destroy()
    });

    // Animate item to collection area
    this.tweens.add({
      targets: item,
      x: targetX,
      y: targetY,
      scale: 0,
      duration: 500,
      ease: 'Cubic.in',
      onComplete: () => {
        item.destroy();

        // Check if all items collected
        this.checkCollectionComplete();
      }
    });

    // Remove from spawned items array
    const index = this.spawnedItems.indexOf(item);
    if (index > -1) this.spawnedItems.splice(index, 1);
  }

  checkCollectionComplete() {
    const allCollected = Object.keys(this.requiredItems).every(typeName => {
      return this.collected[typeName] >= this.requiredItems[typeName];
    });

    if (allCollected) {
      this.time.delayedCall(800, () => {
        this.completePuzzle();
      });
    }
  }

  // Keep old tutorial as reference but not used
  showMergeTutorial_OLD() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Tutorial overlay
    const tutorialOverlay = this.add.container(width / 2, height / 2);
    tutorialOverlay.setDepth(300);

    // Background
    const bg = this.add.rectangle(0, 0, width - 40, height - 100, 0x000000, 0.95);
    bg.setStrokeStyle(3, 0x8b5c31);
    tutorialOverlay.add(bg);

    // Title
    const title = this.add.text(0, -300, 'How to Make Tea', {
      fontSize: '22px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    tutorialOverlay.add(title);

    // Instructions - more compact
    const instructions = [
      '1. Items spawn on the board',
      '2. Drag matching items to merge:',
      '   Level 1 + Level 1 = Level 2',
      '   Level 2 + Level 2 = Level 3',
      '3. Create Level 3 items:',
      '   Teacup • Tea Leaf • Sugar • Cream',
      '4. Store items in satchel (top right)'
    ];

    const instructionText = this.add.text(0, -180, instructions.join('\n'), {
      fontSize: '13px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 2
    }).setOrigin(0.5);
    tutorialOverlay.add(instructionText);

    // Visual example - positioned to fit inside dialog
    const exampleY = 20;
    const exampleText = this.add.text(0, exampleY - 30, 'Example:', {
      fontSize: '13px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    tutorialOverlay.add(exampleText);

    // Show merge example with actual teacup images
    const itemSize = 45;

    // First teacup (Level 1)
    const img1 = this.add.image(-70, exampleY, 'teacup_white');
    img1.setScale(itemSize / img1.width);

    // Plus symbol
    const plus = this.add.text(-20, exampleY, '+', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Second teacup (Level 1)
    const img2 = this.add.image(30, exampleY, 'teacup_white');
    img2.setScale(itemSize / img2.width);

    // Arrow symbol
    const arrow = this.add.text(80, exampleY, '=', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Result teacup (Level 2)
    const img3 = this.add.image(130, exampleY, 'teacup_metal');
    img3.setScale(itemSize / img3.width);

    tutorialOverlay.add([img1, plus, img2, arrow, img3]);

    // Start button - positioned lower to fit in dialog
    const buttonBg = this.add.rectangle(0, 120, 200, 50, 0x8b5c31);
    buttonBg.setStrokeStyle(2, 0xffffff);
    buttonBg.setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(0, 120, 'Got it! Start Game', {
      fontSize: '16px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0xa67c52);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x8b5c31);
    });

    buttonBg.on('pointerdown', () => {
      // Mark tutorial as seen
      gameStateManager.setFlag('merge_tutorial_seen', true);

      // Fade out tutorial
      this.tweens.add({
        targets: tutorialOverlay,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          tutorialOverlay.destroy();
          this.startMergeGame();
        }
      });
    });

    tutorialOverlay.add([buttonBg, buttonText]);
  }

  startMergeGame() {
    // Spawn initial items
    this.spawnInitialItems();

    // Spawn new items periodically
    this.spawnTimer = this.time.addEvent({
      delay: 5000,
      callback: () => this.spawnRandomItem(),
      loop: true
    });
  }

  spawnInitialItems() {
    // Spawn 4-6 random level 1 items
    const itemCount = Phaser.Math.Between(4, 6);
    for (let i = 0; i < itemCount; i++) {
      this.spawnRandomItem();
    }
  }

  spawnRandomItem() {
    // Find empty slot
    const emptySlots = [];
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] === null) {
          emptySlots.push({ row, col });
        }
      }
    }

    if (emptySlots.length === 0) return;

    const slot = Phaser.Utils.Array.GetRandom(emptySlots);
    const typeNames = Object.keys(this.itemTypes);
    const typeName = Phaser.Utils.Array.GetRandom(typeNames);

    this.createItem(slot.row, slot.col, typeName, 1);
  }

  createItem(row, col, typeName, level) {
    const x = this.startX + col * this.tileSize;
    const y = this.startY + row * this.tileSize;

    const itemData = this.itemTypes[typeName][level - 1];

    // Create image sprite instead of rectangle
    const item = this.add.image(x, y, itemData.imageKey);

    // Scale to fit tile size
    const scale = (this.tileSize - 6) / Math.max(item.width, item.height);
    item.setScale(scale);

    item.setInteractive({ useHandCursor: true, draggable: true });
    item.setData('row', row);
    item.setData('col', col);
    item.setData('typeName', typeName);
    item.setData('level', level);
    item.setData('homeX', x);
    item.setData('homeY', y);
    item.setData('baseScale', scale); // Store base scale for animations

    // No label needed with images
    item.setData('label', null);

    // Drag events
    item.on('drag', (pointer, dragX, dragY) => {
      const localPoint = this.puzzleContainer.pointToContainer(pointer);
      item.x = localPoint.x;
      item.y = localPoint.y;
      item.setDepth(200); // Bring to front while dragging
    });

    item.on('dragend', () => {
      this.handleItemDrop(item);
    });

    this.puzzleContainer.add(item);
    this.input.setDraggable(item);
    this.items.push(item);
    this.grid[row][col] = item;

    // Spawn animation
    item.setScale(0);
    this.tweens.add({
      targets: item,
      scale: scale,
      duration: 300,
      ease: 'Back.out'
    });

    return item;
  }

  handleItemDrop(item) {
    const width = this.cameras.main.width;

    // Check if dropped on satchel (world coordinates)
    const worldX = item.x + this.puzzleContainer.x;
    const worldY = item.y + this.puzzleContainer.y;
    const distance = Phaser.Math.Distance.Between(worldX, worldY, this.satchelDropZone.x, this.satchelDropZone.y);

    if (distance < this.satchelDropZone.radius) {
      // Store item in satchel
      const typeName = item.getData('typeName');
      const level = item.getData('level');

      this.storage.push({ typeName, level });

      // Remove from board
      const oldRow = item.getData('row');
      const oldCol = item.getData('col');
      this.grid[oldRow][oldCol] = null;

      const itemIndex = this.items.indexOf(item);
      if (itemIndex > -1) this.items.splice(itemIndex, 1);

      // Animate to satchel and destroy
      this.tweens.add({
        targets: item,
        x: this.satchelDropZone.x - this.puzzleContainer.x,
        y: this.satchelDropZone.y - this.puzzleContainer.y,
        scale: 0,
        duration: 300,
        ease: 'Cubic.in',
        onComplete: () => {
          item.destroy();
        }
      });

      return;
    }

    // Find which grid slot the item was dropped on
    const dropRow = Math.round((item.y - this.startY) / this.tileSize);
    const dropCol = Math.round((item.x - this.startX) / this.tileSize);

    // Check if dropped on a valid grid slot
    if (dropRow >= 0 && dropRow < this.gridSize && dropCol >= 0 && dropCol < this.gridSize) {
      const targetItem = this.grid[dropRow][dropCol];

      if (targetItem && targetItem !== item) {
        // Check if items can merge
        if (this.canMerge(item, targetItem)) {
          this.mergeItems(item, targetItem, dropRow, dropCol);
          return;
        }
      }
    }

    // Return to home position if can't merge
    const homeX = item.getData('homeX');
    const homeY = item.getData('homeY');
    this.tweens.add({
      targets: item,
      x: homeX,
      y: homeY,
      duration: 200,
      ease: 'Cubic.out',
      onComplete: () => {
        item.setDepth(0);
      }
    });
  }

  canMerge(item1, item2) {
    const type1 = item1.getData('typeName');
    const type2 = item2.getData('typeName');
    const level1 = item1.getData('level');
    const level2 = item2.getData('level');

    // Can merge if same type, same level, and not max level
    return type1 === type2 && level1 === level2 && level1 < 3;
  }

  mergeItems(item1, item2, targetRow, targetCol) {
    const typeName = item1.getData('typeName');
    const newLevel = item1.getData('level') + 1;

    // Remove old items
    const oldRow = item1.getData('row');
    const oldCol = item1.getData('col');
    this.grid[oldRow][oldCol] = null;
    this.grid[targetRow][targetCol] = null;

    // Animate merge
    this.tweens.add({
      targets: [item1, item2],
      scale: 0,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        item1.destroy();
        item2.destroy();

        // Create new merged item
        const newItem = this.createItem(targetRow, targetCol, typeName, newLevel);

        // Check if level 3 (completed)
        if (newLevel === 3) {
          // Show item large with glow animation
          this.showCompletionAnimation(newItem, typeName);
        }
      }
    });

    // Remove from items array
    const index1 = this.items.indexOf(item1);
    const index2 = this.items.indexOf(item2);
    if (index1 > -1) this.items.splice(index1, 1);
    if (index2 > -1) this.items.splice(index2, 1);
  }

  getCompletionString() {
    const parts = [];
    Object.keys(this.requiredItems).forEach(key => {
      const current = this.completed[key];
      const needed = this.requiredItems[key];
      const status = current >= needed ? '✓' : `${current}/${needed}`;
      const displayName = key.replace('_', ' ');
      parts.push(`${displayName}: ${status}`);
    });
    return parts.join('  ');
  }

  checkWinCondition() {
    return Object.keys(this.requiredItems).every(key => {
      return this.completed[key] >= this.requiredItems[key];
    });
  }

  showCompletionAnimation(item, typeName) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const levelData = this.itemTypes[typeName][2]; // Level 3

    // Hide original item temporarily
    item.setAlpha(0);

    // Create large version in center using the actual image
    const largeItem = this.add.image(width / 2, height / 2, levelData.imageKey);
    largeItem.setDepth(300);
    largeItem.setScale(0);

    // Blue glow effect
    const glow = this.add.circle(width / 2, height / 2, 70, 0x4a90e2, 0.6);
    glow.setDepth(299);
    glow.setScale(0);

    // Animate in with glow
    this.tweens.add({
      targets: largeItem,
      scale: 1.5,
      duration: 400,
      ease: 'Back.out'
    });

    this.tweens.add({
      targets: glow,
      scale: 1.5,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.out'
    });

    // After showing, move to satchel
    this.time.delayedCall(1200, () => {
      const satchelX = width - 40;
      const satchelY = 30;

      this.tweens.add({
        targets: largeItem,
        x: satchelX,
        y: satchelY,
        scale: 0.3,
        duration: 600,
        ease: 'Cubic.in',
        onComplete: () => {
          largeItem.destroy();
          glow.destroy();

          // Remove item from board
          const row = item.getData('row');
          const col = item.getData('col');
          this.grid[row][col] = null;
          item.destroy();

          const itemIndex = this.items.indexOf(item);
          if (itemIndex > -1) this.items.splice(itemIndex, 1);

          // Update completed count and goal display
          this.completed[typeName]++;
          this.updateGoalDisplay(typeName);

          // Check win condition
          if (this.checkWinCondition()) {
            this.spawnTimer.remove();
            this.time.delayedCall(800, () => {
              this.completePuzzle();
            });
          }
        }
      });
    });
  }

  createMergeGameUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Header bar at top with goals
    const headerBar = this.add.rectangle(width / 2, 30, width, 60, 0x1a1a1a, 0.9);
    headerBar.setDepth(150);

    // Goal icons in header
    this.goalIcons = {};
    const iconSize = 40;
    const startX = 20;
    let currentX = startX;

    Object.keys(this.requiredItems).forEach(typeName => {
      const level3Data = this.itemTypes[typeName][2]; // Level 3

      // Icon background
      const iconBg = this.add.rectangle(currentX + iconSize / 2, 30, iconSize, iconSize, 0x333333);
      iconBg.setStrokeStyle(2, 0x666666);
      iconBg.setDepth(151);

      // Icon using actual image
      const icon = this.add.image(currentX + iconSize / 2, 30, level3Data.imageKey);
      const iconScale = (iconSize - 8) / Math.max(icon.width, icon.height);
      icon.setScale(iconScale);
      icon.setData('baseScale', iconScale); // Save base scale for animations
      icon.setDepth(152);
      icon.setAlpha(0.3); // Greyed out initially

      this.goalIcons[typeName] = { icon };

      currentX += iconSize + 8;
    });

    // Satchel drop zone (top right)
    const satchelX = width - 40;
    const satchelY = 30;

    const satchelBg = this.add.rectangle(satchelX, satchelY, 60, 50, 0x8b5c31);
    satchelBg.setStrokeStyle(2, 0xffffff);
    satchelBg.setDepth(151);
    satchelBg.setInteractive({ useHandCursor: true });

    const satchelLabel = this.add.text(satchelX, satchelY, '📦', {
      fontSize: '24px'
    }).setOrigin(0.5).setDepth(152);

    // Click to open satchel
    satchelBg.on('pointerdown', () => {
      this.openSatchelModal();
    });

    // Make satchel a drop zone
    this.satchelDropZone = { x: satchelX, y: satchelY, radius: 50 };

    // "Return to Game" button (bottom left)
    const returnButton = this.add.rectangle(80, height - 30, 140, 40, 0x4a90e2);
    returnButton.setStrokeStyle(2, 0xffffff);
    returnButton.setDepth(151);
    returnButton.setInteractive({ useHandCursor: true });

    const returnText = this.add.text(80, height - 30, 'Return to Game', {
      fontSize: '12px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(152);

    returnButton.on('pointerover', () => {
      returnButton.setFillStyle(0x5ba3ff);
    });

    returnButton.on('pointerout', () => {
      returnButton.setFillStyle(0x4a90e2);
    });

    returnButton.on('pointerdown', () => {
      this.completePuzzle();
    });
  }

  updateGoalDisplay(typeName) {
    // Update goal icon to show it's completed
    if (this.goalIcons[typeName]) {
      const { icon } = this.goalIcons[typeName];
      icon.setAlpha(1); // Brighten

      // Pulse animation
      const currentScale = icon.getData('baseScale') || icon.scaleX;
      this.tweens.add({
        targets: icon,
        scale: currentScale * 1.2,
        duration: 200,
        yoyo: true,
        onComplete: () => {
          icon.setScale(currentScale);
        }
      });
    }
  }

  openSatchelModal() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Pause game
    this.scene.pause();

    // Create modal overlay
    this.satchelModal = this.add.container(width / 2, height / 2);
    this.satchelModal.setDepth(400);

    // Dark background
    const modalBg = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);
    this.satchelModal.add(modalBg);

    // Satchel interior (placeholder background)
    const satchelInterior = this.add.rectangle(0, 0, width - 40, height - 100, 0x5c4033);
    satchelInterior.setStrokeStyle(3, 0x8b5c31);
    this.satchelModal.add(satchelInterior);

    // Title
    const title = this.add.text(0, -height / 2 + 50, 'Storage Satchel', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.satchelModal.add(title);

    // Display stored items
    if (this.storage.length === 0) {
      const emptyText = this.add.text(0, 0, 'Satchel is empty', {
        fontSize: '16px',
        fontFamily: 'Courier New',
        color: '#999999'
      }).setOrigin(0.5);
      this.satchelModal.add(emptyText);
    } else {
      // Show stored items in a grid
      const itemSize = 60;
      const cols = 4;
      let row = 0;
      let col = 0;

      this.storage.forEach((itemData, index) => {
        const x = -90 + col * (itemSize + 10);
        const y = -50 + row * (itemSize + 10);

        const levelData = this.itemTypes[itemData.typeName][itemData.level - 1];

        // Background square for the item
        const itemBg = this.add.rectangle(x, y, itemSize, itemSize, 0x333333);
        itemBg.setStrokeStyle(2, 0x8b5c31);

        // Use actual image
        const itemImage = this.add.image(x, y, levelData.imageKey);
        const imageScale = (itemSize - 10) / Math.max(itemImage.width, itemImage.height);
        itemImage.setScale(imageScale);
        itemImage.setInteractive({ useHandCursor: true });

        // Click to use item
        itemImage.on('pointerdown', () => {
          this.showUseItemDialog(itemData, index);
        });

        this.satchelModal.add([itemBg, itemImage]);

        col++;
        if (col >= cols) {
          col = 0;
          row++;
        }
      });
    }

    // Close button
    const closeButton = this.add.rectangle(0, height / 2 - 80, 120, 40, 0x8b5c31);
    closeButton.setStrokeStyle(2, 0xffffff);
    closeButton.setInteractive({ useHandCursor: true });

    const closeText = this.add.text(0, height / 2 - 80, 'Close', {
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    closeButton.on('pointerdown', () => {
      this.closeSatchelModal();
    });

    this.satchelModal.add([closeButton, closeText]);
  }

  showUseItemDialog(itemData, storageIndex) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dialog overlay
    const dialogOverlay = this.add.container(width / 2, height / 2);
    dialogOverlay.setDepth(500);

    const dialogBg = this.add.rectangle(0, 0, 280, 150, 0x2a2a2a, 0.98);
    dialogBg.setStrokeStyle(3, 0x8b5c31);

    const dialogText = this.add.text(0, -30, 'Would you like to\nuse this now?', {
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // Yes button
    const yesButton = this.add.rectangle(-60, 40, 100, 35, 0x51cf66);
    yesButton.setStrokeStyle(2, 0xffffff);
    yesButton.setInteractive({ useHandCursor: true });

    const yesText = this.add.text(-60, 40, 'Yes', {
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    yesButton.on('pointerdown', () => {
      // Remove from storage
      this.storage.splice(storageIndex, 1);

      // Add back to game board
      this.spawnItemFromStorage(itemData);

      // Close dialog and modal
      dialogOverlay.destroy();
      this.closeSatchelModal();
    });

    // No button
    const noButton = this.add.rectangle(60, 40, 100, 35, 0xff6b6b);
    noButton.setStrokeStyle(2, 0xffffff);
    noButton.setInteractive({ useHandCursor: true });

    const noText = this.add.text(60, 40, 'No', {
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    noButton.on('pointerdown', () => {
      dialogOverlay.destroy();
    });

    dialogOverlay.add([dialogBg, dialogText, yesButton, yesText, noButton, noText]);
  }

  spawnItemFromStorage(itemData) {
    // Find empty slot
    const emptySlots = [];
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] === null) {
          emptySlots.push({ row, col });
        }
      }
    }

    if (emptySlots.length > 0) {
      const slot = Phaser.Utils.Array.GetRandom(emptySlots);
      this.createItem(slot.row, slot.col, itemData.typeName, itemData.level);
    }
  }

  closeSatchelModal() {
    if (this.satchelModal) {
      this.satchelModal.destroy();
      this.satchelModal = null;
    }
    this.scene.resume();
  }

  // ============================================================
  // TEA SERVICE MINIGAME
  // ============================================================

  update(time, delta) {
    if (!this.ts || !this.ts.sessionActive) return;

    // Session countdown
    this.ts.sessionMs -= delta;
    if (this.ts.sessionMs <= 0 && !this.ts.sessionEnded) {
      this.ts.sessionMs = 0;
      this.ts.sessionEnded = true;
      this.ts.sessionActive = false;
      this.tsEndSession();
      return;
    }

    // Update timer display
    const totalSec = Math.ceil(this.ts.sessionMs / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    this.ts.timerText.setText(`${mins}:${String(secs).padStart(2, '0')}`);
    const timerFrac = this.ts.sessionMs / (this.puzzleData.sessionDuration * 1000 || 120000);
    this.ts.timerBar.scaleX = Math.max(0, timerFrac);
    this.ts.timerBar.setFillStyle(timerFrac > 0.5 ? 0x4caf50 : timerFrac > 0.25 ? 0xffc107 : 0xf44336);

    // Update customer patience
    for (let slot = 0; slot < 3; slot++) {
      const cust = this.ts.customers[slot];
      if (!cust || !cust.active) continue;
      cust.patienceMs -= delta;
      if (cust.patienceMs <= 0) {
        cust.patienceMs = 0;
        this.tsCustomerLeave(slot, false);
        continue;
      }
      const frac = cust.patienceMs / this.ts.customerPatienceMs;
      cust.patienceBarFill.scaleX = frac;
      cust.patienceBarFill.setFillStyle(frac > 0.66 ? 0x4caf50 : frac > 0.33 ? 0xffc107 : 0xf44336);
      const prevHappy = cust.happiness;
      if (frac > 0.33) cust.happiness = 'neutral';
      else cust.happiness = 'mad';
      if (cust.happiness !== prevHappy) {
        const vis = this.ts.customerVisuals[slot];
        if (vis.custIcon._isImage) {
          const iconState = cust.happiness === 'mad' ? 'irritated' : cust.happiness;
          vis.custIcon.setTexture(`tea_char_${cust.charName}_${iconState}`).setDisplaySize(80, 130);
        } else {
          const emojis = { neutral: '😐', mad: '😠' };
          cust.happinessText.setText(emojis[cust.happiness] || '');
        }
      }
    }
  }

  createTeaServicePuzzle() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const pd = this.puzzleData;

    // All recipes
    const allRecipes = {
      tea:          { label: 'Tea',            ingredients: { black_tea: 1 },           brewMs: 6000 },
      cream_tea:    { label: 'Cream Tea',       ingredients: { black_tea: 1, cream: 1 }, brewMs: 8000 },
      lemon_tea:    { label: 'Lemon Tea',       ingredients: { black_tea: 1, lemon: 1 }, brewMs: 6000 },
      sweet_tea:    { label: 'Sweet Tea',       ingredients: { black_tea: 1, sugar: 1 }, brewMs: 6000 },
      herbal:       { label: 'Herbal Tea',      ingredients: { herbal: 1 },              brewMs: 6000 },
      herbal_cream: { label: 'Herbal Cream',    ingredients: { herbal: 1, cream: 1 },    brewMs: 8000 },
    };

    // State namespace
    this.ts = {
      sessionMs:        (pd.sessionDuration || 120) * 1000,
      customerPatienceMs: 120000,
      sessionActive:    false,
      sessionEnded:     false,
      serveMode:        false,
      selectedCup:      -1,
      inventory:        Object.assign({ black_tea: 10, herbal: 8, cream: 6, lemon: 6, sugar: 6 }, pd.inventory || {}),
      recipes:          allRecipes,
      cups:             Array.from({ length: pd.startingCups || 1 }, () => ({
        state: 'empty', cold: false, recipe: null, charName: null
      })),
      customers:        [null, null, null],
      teapot:           { state: 'empty', cold: false },
      nextSpawnMs:      5000,
      spawnStopped:     false,
      score:            { teacupsEarned: 0, served: 0, missed: 0, totalCustomers: 0 },
      custChars:        ['addie_default', 'cultist_bookkeeper', 'cultist_enforcer',
                         'cultist_guard', 'cultist_guard_staff', 'da_default',
                         'genlteman_paper', 'rainie_default', 'vera_default'],
      teacupChars:      ['addie', 'cultist_bookkeeper', 'cultist_enforcer',
                         'cultist_guard', 'cultist_guard_staff', 'da',
                         'gentleman_paper', 'guildmaster', 'rainie', 'vera'],
      // Visual refs filled below
      timerText: null, timerBar: null, scoreText: null,
      cupVisuals: [], customerVisuals: [], invTexts: {},
      serveModeLabel: null,
    };

    // Background
    this.add.rectangle(w / 2, h / 2, w, h, 0x1a0f08).setDepth(102);
    if (this.textures.exists('puzzle_tea_01')) {
      const bg = this.add.image(w / 2, h / 2, 'puzzle_tea_01');
      bg.setScale(Math.max(w / bg.width, h / bg.height)).setDepth(103).setAlpha(0.35);
    }

    this.tsBuildHUD(w, h);
    this.tsBuildStation(w, h);
    this.tsBuildCustomerArea(w, h);

    // Serve-mode label
    this.ts.serveModeLabel = this.add.text(w / 2, h - 195, '', {
      fontSize: '12px', fontFamily: 'Courier New', color: '#c4a575',
      stroke: '#000', strokeThickness: 2, align: 'center'
    }).setOrigin(0.5).setDepth(160);

    // Start tutorial
    this.tsTutInit(w, h);
  }

  tsBuildHUD(w, h) {
    const y = 28;
    this.add.rectangle(w / 2, y, w, 50, 0x0d0705, 0.95).setDepth(150);

    // Timer bar background
    const bx = 15, bw = w - 90, bh = 14;
    this.add.rectangle(bx + bw / 2, y, bw, bh, 0x333333).setDepth(151);
    this.ts.timerBar = this.add.rectangle(bx, y, bw, bh, 0x4caf50)
      .setOrigin(0, 0.5).setDepth(152);
    this.ts.timerBar._fullWidth = bw;

    this.ts.timerText = this.add.text(bx + bw / 2, y, '2:00', {
      fontSize: '11px', fontFamily: 'Courier New', color: '#fff'
    }).setOrigin(0.5).setDepth(153);

    this.ts.scoreText = this.add.text(w - 10, y, '☕ 0', {
      fontSize: '13px', fontFamily: 'Courier New', color: '#c4a575'
    }).setOrigin(1, 0.5).setDepth(153);
  }

  tsBuildStation(w, h) {
    const panelY = 55;
    const panelH = h - 200;
    this.add.rectangle(w / 2, panelY + panelH / 2, w - 10, panelH, 0x2a1810, 0.9)
      .setStrokeStyle(1, 0x4a3020).setDepth(150);

    const lbl = (x, y, text) => this.add.text(x, y, text, {
      fontSize: '10px', fontFamily: 'Courier New', color: '#8b7355'
    }).setOrigin(0.5).setDepth(160);
    const btnImg = (x, y, texKey, onTap) => {
      const img = this.add.image(x, y, texKey)
        .setDisplaySize(96, 96).setOrigin(0.5).setDepth(160).setInteractive({ useHandCursor: true });
      img.on('pointerdown', onTap);
      img.on('pointerover', () => img.setScale(img.scaleX * 1.15, img.scaleY * 1.15));
      img.on('pointerout',  () => img.setDisplaySize(96, 96));
      return img;
    };

    const equipY = 130;

    // Faucet
    btnImg(70, equipY, 'icon_faucet', () => this.tsTapFaucet());
    lbl(70, equipY + 30, 'Faucet');

    // Teapot
    this.ts.teapotIcon = btnImg(w / 2, equipY, 'icon_teapot_bear', () => this.tsTapTeapot());
    lbl(w / 2, equipY + 30, 'Teapot');
    this.ts.teapotWaterLabel = this.add.text(w / 2, equipY - 28, '', {
      fontSize: '14px'
    }).setOrigin(0.5).setDepth(161);

    // Teapot fill bar
    const fbw = 52;
    this.add.rectangle(w / 2, equipY + 22, fbw, 6, 0x333333).setDepth(160).setAlpha(0)
      .setName('teapotBarBg');
    this.ts.teapotFillBarBg = this.add.rectangle(w / 2, equipY + 22, fbw, 6, 0x333333)
      .setDepth(160).setAlpha(0);
    this.ts.teapotFillBar = this.add.rectangle(w / 2 - fbw / 2, equipY + 22, fbw, 6, 0x4fc3f7)
      .setOrigin(0, 0.5).setDepth(161).setAlpha(0);

    // Ice bucket
    btnImg(w - 70, equipY, 'icon_ice', () => this.tsTapIce());
    lbl(w - 70, equipY + 30, 'Ice');

    // Trash — sits above the ingredient bar
    btnImg(w - 40, h - 310, 'icon_trash', () => this.tsTapTrash());
    lbl(w - 40, h - 265, 'Discard');

    // Teacup slots
    const cupCount = this.ts.cups.length;
    const cupY = 370;
    const cupXs = cupCount === 1 ? [w / 2] :
                  cupCount === 2 ? [w / 2 - 70, w / 2 + 70] :
                                   [w / 2 - 120, w / 2, w / 2 + 120];

    this.ts.cupVisuals = cupXs.map((cx, i) => {
      const charName = 'vera'; // default; updates dynamically when a customer is assigned
      const texKey = `tea_teacup_${charName}`;
      const iconTexKey = this.textures.exists(texKey) ? texKey : null;
      let icon;
      if (iconTexKey) {
        icon = this.add.image(cx, cupY, iconTexKey)
          .setDisplaySize(192, 192).setOrigin(0.5).setDepth(160).setInteractive({ useHandCursor: true });
      } else {
        icon = this.add.text(cx, cupY, '☕', { fontSize: '72px' })
          .setOrigin(0.5).setDepth(160).setInteractive({ useHandCursor: true });
      }
      icon.on('pointerdown', () => this.tsTapCup(i));
      icon.on('pointerover', () => icon.setScale(icon.scaleX * 1.1, icon.scaleY * 1.1));
      icon.on('pointerout',  () => { if (icon.setDisplaySize) icon.setDisplaySize(192, 192); else icon.setScale(1); });
      icon._isImage = !!iconTexKey;
      icon._charName = charName;

      const stateLbl = this.add.text(cx, cupY + 106, 'Empty', {
        fontSize: '10px', fontFamily: 'Courier New', color: '#8b7355'
      }).setOrigin(0.5).setDepth(160);

      const barBg = this.add.rectangle(cx, cupY + 120, 56, 6, 0x333333).setDepth(160).setAlpha(0);
      const barFill = this.add.rectangle(cx - 28, cupY + 120, 56, 6, 0xffb74d)
        .setOrigin(0, 0.5).setDepth(161).setAlpha(0);

      const waterIcon = this.add.text(cx, cupY - 106, '', { fontSize: '14px' })
        .setOrigin(0.5).setDepth(161);

      return { icon, stateLbl, barBg, barFill, waterIcon };
    });

    // Inventory bar
    const invY = h - 195;
    const invKeys    = ['black_tea',      'herbal',          'cream',        'lemon',        'sugar'];
    const invTexKeys = ['icon_tea_black', 'icon_trea_herbal','icon_creamer', 'icon_lemon',   'icon_sugar'];
    const invIcons   = ['🍃',             '🌿',              '🥛',           '🍋',           '🍬'];
    const invSpacing = (w - 30) / invKeys.length;
    invKeys.forEach((k, i) => {
      const ix = 15 + invSpacing * i + invSpacing / 2;
      if (this.textures.exists(invTexKeys[i])) {
        this.add.image(ix, invY - 10, invTexKeys[i]).setDisplaySize(56, 56).setOrigin(0.5).setDepth(160);
      } else {
        this.add.text(ix, invY - 10, invIcons[i], { fontSize: '16px' }).setOrigin(0.5).setDepth(160);
      }
      this.ts.invTexts[k] = this.add.text(ix, invY + 10, `${this.ts.inventory[k]}`, {
        fontSize: '11px', fontFamily: 'Courier New', color: '#c4a575'
      }).setOrigin(0.5).setDepth(160);
    });
  }

  tsBuildCustomerArea(w, h) {
    const areaY = h - 100;
    this.add.rectangle(w / 2, areaY, w, 150, 0x1a0f08, 0.9)
      .setStrokeStyle(1, 0x4a3020).setDepth(150);

    const slotXs = [w * 0.17, w * 0.5, w * 0.83];
    this.ts.customerVisuals = slotXs.map((cx, i) => {
      // Slot background
      this.add.rectangle(cx, areaY, w * 0.3, 140, 0x2a1810, 0.5)
        .setStrokeStyle(1, 0x3a2015).setDepth(151);

      // Customer icon (image, hidden until customer spawns)
      const firstChar = this.ts.custChars[0];
      const custIconKey = `tea_char_${firstChar}_neutral`;
      const custIcon = this.textures.exists(custIconKey)
        ? this.add.image(cx, areaY, custIconKey).setDisplaySize(80, 130).setOrigin(0.5).setDepth(155).setAlpha(0)
        : this.add.text(cx, areaY, '💺', { fontSize: '28px' }).setOrigin(0.5).setDepth(155).setAlpha(0);
      custIcon._isImage = this.textures.exists(custIconKey);

      // Order bubble
      const orderBubble = this.add.text(cx, areaY - 32, '', {
        fontSize: '10px', fontFamily: 'Courier New', color: '#333', align: 'center',
        backgroundColor: '#ffffffdd', padding: { x: 4, y: 2 }
      }).setOrigin(0.5).setDepth(156).setAlpha(0);

      // Patience bar background
      const pbw = w * 0.26;
      this.add.rectangle(cx, areaY + 42, pbw, 6, 0x333333).setDepth(155);
      const patienceBarFill = this.add.rectangle(cx - pbw / 2, areaY + 42, pbw, 6, 0x4caf50)
        .setOrigin(0, 0.5).setDepth(156);

      // Happiness
      const happinessText = this.add.text(cx + pbw / 2 + 6, areaY + 12, '', { fontSize: '14px' })
        .setOrigin(0.5).setDepth(156);

      // Hit area
      const hit = this.add.rectangle(cx, areaY, w * 0.3, 140, 0xffffff, 0)
        .setDepth(157).setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => this.tsTapCustomer(i));

      return { cx, custIcon, orderBubble, patienceBarFill, happinessText, hit, active: false };
    });
  }

  tsTutInit(w, h) {
    this.ts.tut = {
      active: true, step: 0, w, h,
      brewedRecipeId: null,
      highlightCircle: null, highlightTween: null, tooltipObjs: [],
    };
    // Vera waits from the very start
    this.tsTutSpawnCustomer();
    this.tsTutShow();
  }

  tsTutShow() {
    const { tut } = this.ts;
    const { w, h } = tut;
    this.tsTutClear();

    const equipY = 130, cupY = 370, areaY = h - 100;
    const steps = [
      { x: 70,    y: equipY, r: 38,  text: 'Step 1 of 6 — Tap the FAUCET\nto fill the teapot with water.' },
      { x: w / 2, y: equipY, r: 38,  text: 'Filling... wait for the teapot to be ready.' },
      { x: w / 2, y: equipY, r: 38,  text: 'Step 2 of 6 — Tap the TEAPOT\nto pour water into a cup.' },
      { x: w / 2, y: cupY,   r: 100, text: 'Step 3 of 6 — Tap the CUP\nto choose a recipe.' },
      { x: 0,     y: 0,      r: 0,   text: 'Step 4 of 6 — Choose a recipe from the list\nto start brewing.' },
      { x: w / 2, y: cupY,   r: 100, text: 'Brewing... wait for the drink to be ready.' },
      { x: w / 2, y: cupY,   r: 100, text: 'Step 5 of 6 — The drink is ready!\nTap the CUP to prepare to serve.' },
      { x: w * 0.5, y: areaY, r: 45, text: 'Step 6 of 6 — A customer is waiting!\nTap the CUSTOMER to deliver the drink.' },
    ];

    const data = steps[tut.step];
    if (!data) { this.tsTutComplete(); return; }

    if (data.r > 0) {
      tut.highlightCircle = this.add.circle(data.x, data.y, data.r, 0xffd700, 0)
        .setStrokeStyle(3, 0xffd700).setDepth(170);
      tut.highlightTween = this.tweens.add({
        targets: tut.highlightCircle,
        scaleX: 1.3, scaleY: 1.3, alpha: 0.2,
        duration: 650, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
      });
    }

    const tipY = 221;
    const bg = this.add.rectangle(w / 2, tipY, w - 16, 50, 0x000000, 0.9)
      .setStrokeStyle(1, 0xffd700).setDepth(170);
    const txt = this.add.text(w / 2, tipY, data.text, {
      fontSize: '11px', fontFamily: 'Courier New', color: '#ffd700', align: 'center'
    }).setOrigin(0.5).setDepth(171);
    tut.tooltipObjs = [bg, txt];
  }

  tsTutClear() {
    const { tut } = this.ts;
    if (!tut) return;
    if (tut.highlightTween) { tut.highlightTween.stop(); tut.highlightTween = null; }
    if (tut.highlightCircle) { tut.highlightCircle.destroy(); tut.highlightCircle = null; }
    tut.tooltipObjs.forEach(o => o.destroy());
    tut.tooltipObjs = [];
  }

  tsTutAdvance() {
    const { tut } = this.ts;
    tut.step++;
    this.tsTutShow();
  }

  tsTutSpawnCustomer() {
    const slot = 1;
    if (this.ts.customers[slot]) return;
    const recipeId = this.ts.tut?.brewedRecipeId || 'tea';
    const recipe = this.ts.recipes[recipeId] || this.ts.recipes.tea;
    const isCold = false;
    const charName = 'vera_default';
    const cust = {
      active: true, recipeId, recipe, isCold, charName,
      patienceMs: this.ts.customerPatienceMs,
      happiness: 'neutral',
      patienceBarFill: this.ts.customerVisuals[slot].patienceBarFill,
      happinessText:   this.ts.customerVisuals[slot].happinessText,
    };
    this.ts.customers[slot] = cust;
    this.ts.score.totalCustomers = (this.ts.score.totalCustomers || 0) + 1;
    const vis = this.ts.customerVisuals[slot];
    vis.active = true;
    if (vis.custIcon._isImage) {
      vis.custIcon.setTexture(`tea_char_${charName}_neutral`).setDisplaySize(80, 130).setAlpha(1);
    } else {
      vis.custIcon.setText('👤').setAlpha(1);
    }
    vis.orderBubble.setText(`${recipe.label}\n${isCold ? '❄️' : '🔥'}`).setAlpha(1);
    vis.patienceBarFill.scaleX = 1;
    vis.happinessText.setText('');
    this.tweens.add({ targets: [vis.custIcon, vis.orderBubble], alpha: 1, y: '-=6', duration: 300, ease: 'Back.out' });
  }

  tsTutComplete() {
    this.tsTutClear();
    this.ts.tut.active = false;
    const { w, h } = this.ts.tut;
    const msg = this.add.text(w / 2, h / 2, 'Well done!\nNow serve as many customers\nas you can!', {
      fontSize: '15px', fontFamily: 'Courier New', color: '#ffd700',
      align: 'center', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(180);
    this.time.delayedCall(2500, () => {
      msg.destroy();
      this.ts.sessionActive = true;
      this.tsScheduleSpawn();
    });
  }

  tsScheduleSpawn() {
    if (this.ts.spawnStopped || this.ts.sessionEnded) return;
    const noSpawnBuffer = 15000;
    if (this.ts.sessionMs <= noSpawnBuffer) {
      this.ts.spawnStopped = true;
      return;
    }
    const delay = this.ts.nextSpawnMs;
    this.ts.nextSpawnMs = 7000 + Math.random() * 2000; // 7-9s subsequent spawns
    this.time.delayedCall(delay, () => {
      if (!this.ts.sessionActive) return;
      this.tsSpawnCustomer();
      this.tsScheduleSpawn();
    });
  }

  tsSpawnCustomer() {
    const emptySlot = this.ts.customers.findIndex(c => !c);
    if (emptySlot === -1) return;

    const craftable = Object.entries(this.ts.recipes).filter(([, r]) =>
      Object.entries(r.ingredients).every(([k, v]) => (this.ts.inventory[k] || 0) >= v)
    );
    if (craftable.length === 0) return;

    const [recipeId, recipe] = craftable[Math.floor(Math.random() * craftable.length)];
    const isCold = Math.random() < 0.5;

    const charName = this.ts.custChars[Math.floor(Math.random() * this.ts.custChars.length)];
    const cust = {
      active: true, recipeId, recipe, isCold, charName,
      patienceMs: this.ts.customerPatienceMs,
      happiness: 'neutral',
      patienceBarFill: this.ts.customerVisuals[emptySlot].patienceBarFill,
      happinessText:   this.ts.customerVisuals[emptySlot].happinessText,
    };
    this.ts.customers[emptySlot] = cust;
    this.ts.score.totalCustomers = (this.ts.score.totalCustomers || 0) + 1;

    const vis = this.ts.customerVisuals[emptySlot];
    vis.active = true;
    if (vis.custIcon._isImage) {
      vis.custIcon.setTexture(`tea_char_${charName}_neutral`).setDisplaySize(80, 130).setAlpha(1);
    } else {
      vis.custIcon.setText('👤').setAlpha(1);
    }
    vis.orderBubble.setText(`${recipe.label}\n${isCold ? '❄️' : '🔥'}`).setAlpha(1);
    vis.patienceBarFill.scaleX = 1;
    vis.happinessText.setText('');

    this.tweens.add({ targets: [vis.custIcon, vis.orderBubble], alpha: 1, y: '-=6', duration: 300, ease: 'Back.out' });
  }

  tsCustomerLeave(slot, satisfied) {
    const cust = this.ts.customers[slot];
    if (!cust) return;

    if (!satisfied) this.ts.score.missed++;
    const vis = this.ts.customerVisuals[slot];

    const doLeave = () => {
      this.tweens.add({
        targets: [vis.custIcon, vis.orderBubble, vis.happinessText],
        alpha: 0, y: '+=10', duration: 400,
        onComplete: () => {
          vis.active = false;
          vis.custIcon.setAlpha(0).setY(vis.custIcon.y + 10); // restore position
          vis.orderBubble.setAlpha(0);
          vis.happinessText.setText('');
          vis.patienceBarFill.scaleX = 1;
          vis.patienceBarFill.setFillStyle(0x4caf50);
        }
      });
    };

    if (satisfied && vis.custIcon._isImage && cust?.charName) {
      // Flash happy: switch to happy texture, scale up 10%, then fade out
      vis.custIcon.setTexture(`tea_char_${cust.charName}_happy`).setDisplaySize(80, 130);
      this.tweens.add({
        targets: vis.custIcon,
        scaleX: vis.custIcon.scaleX * 1.1, scaleY: vis.custIcon.scaleY * 1.1,
        duration: 250, yoyo: true, ease: 'Sine.easeOut',
        onComplete: doLeave
      });
    } else {
      doLeave();
    }

    if (!satisfied) {
      const msgY = this.cameras.main.height - 145;
      const txt = this.add.text(vis.cx, msgY, '😡 Left!', {
        fontSize: '14px', fontFamily: 'Courier New', color: '#f44336',
        stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5).setDepth(165);
      this.tweens.add({ targets: txt, y: msgY - 25, alpha: 0, duration: 900, onComplete: () => txt.destroy() });
    }

    this.ts.customers[slot] = null;
  }

  tsTapFaucet() {
    const tp = this.ts.teapot;
    if (tp.state === 'filling') {
      // Cancel fill
      this.ts._fillTimer && this.ts._fillTimer.remove();
      this.ts._fillTween && this.ts._fillTween.stop();
      tp.state = 'empty';
      tp.cold = false;
      this.tsUpdateTeapotVis();
      return;
    }
    if (tp.state !== 'empty') {
      this.tsFlash('Teapot is already full!');
      return;
    }
    tp.state = 'filling';
    tp.cold = false;
    this.tsUpdateTeapotVis();

    // Animate fill bar
    this.ts.teapotFillBarBg.setAlpha(1);
    this.ts.teapotFillBar.setAlpha(1).setScale(0, 1);
    this.ts._fillTween = this.tweens.add({
      targets: this.ts.teapotFillBar,
      scaleX: 1,
      duration: 3000,
      ease: 'Linear',
    });
    this.ts._fillTimer = this.time.delayedCall(3000, () => {
      tp.state = 'ready';
      this.ts.teapotFillBarBg.setAlpha(0);
      this.ts.teapotFillBar.setAlpha(0);
      this.tsUpdateTeapotVis();
      if (this.ts.tut?.active && this.ts.tut.step === 1) this.tsTutAdvance();
    });
    if (this.ts.tut?.active && this.ts.tut.step === 0) this.tsTutAdvance();
  }

  tsTapIce() {
    const tp = this.ts.teapot;
    if (!tp || tp.state === 'empty') { this.tsFlash('Fill the teapot first!'); return; }
    tp.cold = !tp.cold;
    this.tsUpdateTeapotVis();
    this.tsFlash(tp.cold ? 'Chilled! ❄️' : 'Heated! 🔥');
  }

  tsTapTeapot() {
    const tp = this.ts.teapot;
    if (!tp || tp.state !== 'ready') {
      this.tsFlash(tp && tp.state === 'filling' ? 'Still filling...' : 'Tap the faucet first!');
      return;
    }
    const emptyIdx = this.ts.cups.findIndex(c => c.state === 'empty');
    if (emptyIdx === -1) { this.tsFlash('No empty teacup!'); return; }
    this.ts.cups[emptyIdx].state = 'withWater';
    this.ts.cups[emptyIdx].cold = tp.cold;
    // Assign teacup character from first waiting customer
    const firstCust = this.ts.customers.find(c => c && c.active);
    this.ts.cups[emptyIdx].charName = firstCust ? this.tsCustToTeacup(firstCust.charName) : 'vera';
    tp.state = 'empty'; tp.cold = false;
    this.ts.teapotFillBarBg.setAlpha(0);
    this.ts.teapotFillBar.setAlpha(0);
    this.tsUpdateTeapotVis();
    this.tsUpdateCupVis(emptyIdx);
    const cv = this.ts.cupVisuals[emptyIdx];
    this.tweens.add({ targets: cv.icon, scaleX: 1.3, scaleY: 1.3, duration: 120, yoyo: true });
    if (this.ts.tut?.active && this.ts.tut.step === 2) this.tsTutAdvance();
  }

  tsTapCup(i) {
    const cup = this.ts.cups[i];
    if (cup.state === 'empty') return;
    if (cup.state === 'withWater') { this.tsShowRecipePopup(i); if (this.ts.tut?.active && this.ts.tut.step === 3) this.tsTutAdvance(); return; }
    if (cup.state === 'brewing') {
      const secLeft = Math.ceil((cup.recipe.brewMs - cup.brewElapsed) / 1000);
      this.tsFlash(`Brewing... ${secLeft}s left`);
      return;
    }
    if (cup.state === 'ready') {
      if (this.ts.serveMode && this.ts.selectedCup === i) this.tsExitServeMode();
      else { this.tsEnterServeMode(i); if (this.ts.tut?.active && this.ts.tut.step === 6) this.tsTutAdvance(); }
    }
  }

  tsTapCustomer(slot) {
    if (!this.ts.serveMode) return;
    if (!this.ts.customers[slot]) { this.tsFlash('No customer here!'); return; }
    if (this.ts.tut?.active && this.ts.tut.step === 7) this.tsTutAdvance();
    this.tsServe(slot);
  }

  tsTapTrash() {
    if (this.ts.serveMode) {
      this.tsDiscardCup(this.ts.selectedCup);
      this.tsExitServeMode();
      return;
    }
    // Try to discard the first non-empty cup
    const idx = this.ts.cups.findIndex(c => c.state !== 'empty');
    if (idx === -1) { this.tsFlash('Nothing to discard'); return; }
    if (this.ts.cups.length === 1) { this.tsDiscardCup(0); return; }
    this.tsFlash('Tap a ready cup first, then trash');
  }

  tsShowRecipePopup(cupIndex) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this.ts.recipePopupIdx = cupIndex;

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.75)
      .setDepth(200).setInteractive();
    const panelH = Math.min(480, h - 80);
    const panel = this.add.rectangle(w / 2, h / 2, w - 20, panelH, 0x1a0f08)
      .setStrokeStyle(2, 0x8b5c31).setDepth(201);

    const title = this.add.text(w / 2, h / 2 - panelH / 2 + 22, 'Choose a Recipe', {
      fontSize: '15px', fontFamily: 'Courier New', color: '#c4a575', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(202);

    const closeBtn = this.add.text(w - 22, h / 2 - panelH / 2 + 22, '✕', {
      fontSize: '18px', fontFamily: 'Courier New', color: '#f44336'
    }).setOrigin(0.5).setDepth(202).setInteractive({ useHandCursor: true });

    const objs = [overlay, panel, title, closeBtn];

    const startY = h / 2 - panelH / 2 + 55;
    const rowH = 58;
    Object.entries(this.ts.recipes).forEach(([id, recipe], ri) => {
      const ry = startY + ri * rowH;
      const canCraft = Object.entries(recipe.ingredients).every(([k, v]) => (this.ts.inventory[k] || 0) >= v);
      const rowBg = this.add.rectangle(w / 2, ry + rowH / 2, w - 30, rowH - 4, canCraft ? 0x2a1810 : 0x111111)
        .setStrokeStyle(1, canCraft ? 0x4a3020 : 0x222222).setDepth(202);
      const nameT = this.add.text(18, ry + rowH / 2 - 9, recipe.label, {
        fontSize: '13px', fontFamily: 'Courier New', color: canCraft ? '#c4a575' : '#555'
      }).setOrigin(0, 0.5).setDepth(203);
      const ingStr = Object.entries(recipe.ingredients)
        .map(([k, v]) => `${k.replace('_', ' ')}:${this.ts.inventory[k] || 0}/${v}`).join(' ');
      const ingT = this.add.text(18, ry + rowH / 2 + 10, ingStr, {
        fontSize: '9px', fontFamily: 'Courier New', color: canCraft ? '#8b7355' : '#444'
      }).setOrigin(0, 0.5).setDepth(203);
      const timeT = this.add.text(w - 14, ry + rowH / 2, `${recipe.brewMs / 1000}s`, {
        fontSize: '11px', fontFamily: 'Courier New', color: canCraft ? '#8b7355' : '#444'
      }).setOrigin(1, 0.5).setDepth(203);
      objs.push(rowBg, nameT, ingT, timeT);
      if (canCraft) {
        rowBg.setInteractive({ useHandCursor: true });
        rowBg.on('pointerdown', () => { this.tsCloseRecipePopup(); this.tsSelectRecipe(cupIndex, id, recipe); });
        rowBg.on('pointerover', () => rowBg.setFillStyle(0x3a2820));
        rowBg.on('pointerout', () => rowBg.setFillStyle(0x2a1810));
      }
    });

    this.ts._recipePopup = objs;
    overlay.on('pointerdown', () => this.tsCloseRecipePopup());
    closeBtn.on('pointerdown', () => this.tsCloseRecipePopup());
  }

  tsCloseRecipePopup() {
    if (this.ts._recipePopup) {
      this.ts._recipePopup.forEach(o => o.destroy());
      this.ts._recipePopup = null;
    }
  }

  tsSelectRecipe(cupIndex, recipeId, recipe) {
    // Deduct ingredients
    Object.entries(recipe.ingredients).forEach(([k, v]) => {
      this.ts.inventory[k] = (this.ts.inventory[k] || 0) - v;
      if (this.ts.invTexts[k]) this.ts.invTexts[k].setText(`${this.ts.inventory[k]}`);
    });
    const cup = this.ts.cups[cupIndex];
    cup.state = 'brewing';
    cup.recipe = { ...recipe, id: recipeId };
    cup.brewElapsed = 0;
    this.tsUpdateCupVis(cupIndex);
    if (this.ts.tut?.active && this.ts.tut.step === 4) this.tsTutAdvance();

    // Brew timer using time event (updates elapsed for display)
    const vis = this.ts.cupVisuals[cupIndex];
    vis.barBg.setAlpha(1);
    vis.barFill.setAlpha(1).setScale(0, 1);
    const brewTween = this.tweens.add({
      targets: vis.barFill, scaleX: 1, duration: recipe.brewMs, ease: 'Linear'
    });
    cup._brewTween = brewTween;
    this.time.delayedCall(recipe.brewMs, () => {
      if (cup.state !== 'brewing') return;
      cup.state = 'ready';
      vis.barBg.setAlpha(0);
      vis.barFill.setAlpha(0);
      this.tsUpdateCupVis(cupIndex);
      this.tweens.add({ targets: vis.icon, scaleX: 1.2, scaleY: 1.2, duration: 200, yoyo: true });
      if (this.ts.tut?.active && this.ts.tut.step === 5) this.tsTutAdvance();
    });
  }

  tsEnterServeMode(cupIndex) {
    this.ts.serveMode = true;
    this.ts.selectedCup = cupIndex;
    this.ts.cupVisuals.forEach((cv, i) => cv.icon.setAlpha(i === cupIndex ? 1 : 0.45));
    this.ts.serveModeLabel.setText('Tap a customer to serve  |  Tap 🗑️ to discard');
    this.ts.customerVisuals.forEach(cv => {
      if (cv.active) this.tweens.add({ targets: cv.custIcon, scaleX: 1.15, scaleY: 1.15, duration: 200 });
    });
  }

  tsExitServeMode() {
    this.ts.serveMode = false;
    this.ts.selectedCup = -1;
    this.ts.cupVisuals.forEach(cv => cv.icon.setAlpha(1).setScale(1));
    this.ts.serveModeLabel.setText('');
    this.ts.customerVisuals.forEach(cv => cv.custIcon.setScale(1));
  }

  tsServe(slot) {
    const cust = this.ts.customers[slot];
    const cup = this.ts.cups[this.ts.selectedCup];
    if (!cust || cup.state !== 'ready') return;

    const correctRecipe = cup.recipe.id === cust.recipeId;
    const correctWater  = cup.cold === cust.isCold;
    const isCorrect = correctRecipe && correctWater;

    const frac = cust.patienceMs / this.ts.customerPatienceMs;
    let multiplier = isCorrect ? (frac > 0.66 ? 1.5 : frac > 0.33 ? 1.0 : 0.5) : 0.25;
    const earned = isCorrect ? Math.round(multiplier) : 0; // 0 or 1 teacup

    this.ts.score.teacupsEarned += earned;
    if (isCorrect) this.ts.score.served++;
    else this.ts.score.missed++;
    this.ts.scoreText.setText(`☕ ${this.ts.score.teacupsEarned}`);

    // Feedback float
    const vis = this.ts.customerVisuals[slot];
    const fdbk = isCorrect ? (multiplier >= 1.5 ? '⭐ Great!' : '✓ Good!') : '✗ Wrong!';
    const fcolor = isCorrect ? '#4caf50' : '#f44336';
    const fb = this.add.text(vis.cx, this.cameras.main.height - 145, fdbk, {
      fontSize: '15px', fontFamily: 'Courier New', color: fcolor, stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(165);
    this.tweens.add({ targets: fb, y: '-=30', alpha: 0, duration: 900, onComplete: () => fb.destroy() });

    // Reset cup
    const ci = this.ts.selectedCup;
    this.ts.cups[ci] = { state: 'empty', cold: false, recipe: null, charName: null };
    this.tsUpdateCupVis(ci);
    this.tsExitServeMode();

    // Customer leaves happy
    this.tsCustomerLeave(slot, true);
  }

  tsDiscardCup(i) {
    const cup = this.ts.cups[i];
    if (cup.state === 'empty') return;
    // Return ingredients if brewing/ready
    if (cup.recipe && (cup.state === 'brewing' || cup.state === 'ready')) {
      if (cup._brewTween) cup._brewTween.stop();
      Object.entries(cup.recipe.ingredients).forEach(([k, v]) => {
        this.ts.inventory[k] = (this.ts.inventory[k] || 0) + v;
        if (this.ts.invTexts[k]) this.ts.invTexts[k].setText(`${this.ts.inventory[k]}`);
      });
    }
    this.ts.cups[i] = { state: 'empty', cold: false, recipe: null, charName: null };
    this.tsUpdateCupVis(i);
  }

  tsCustToTeacup(custChar) {
    const map = {
      addie_default: 'addie', da_default: 'da',
      rainie_default: 'rainie', vera_default: 'vera',
      genlteman_paper: 'gentleman_paper',
      cultist_bookkeeper: 'cultist_bookkeeper',
      cultist_enforcer: 'cultist_enforcer',
      cultist_guard: 'cultist_guard',
      cultist_guard_staff: 'cultist_guard_staff',
    };
    return map[custChar] || 'vera';
  }

  tsUpdateTeapotVis() {
    const tp = this.ts.teapot || { state: 'empty', cold: false };
    const icon = this.ts.teapotIcon;
    const waterLbl = this.ts.teapotWaterLabel;
    if (icon.setTexture) {
      // Image-based teapot icon
      if (tp.state === 'empty')   { icon.setTexture('icon_teapot_bear'); waterLbl.setText(''); }
      if (tp.state === 'filling') { icon.setTexture('icon_teapot_bear'); waterLbl.setText(tp.cold ? '❄️' : '🔥'); }
      if (tp.state === 'ready')   { icon.setTexture(tp.cold ? 'icon_teapot_green' : 'icon_teapot_bird'); waterLbl.setText(tp.cold ? '❄️' : '🔥'); }
    } else {
      if (tp.state === 'empty')   { icon.setText('🫖'); waterLbl.setText(''); }
      if (tp.state === 'filling') { icon.setText('🫖'); waterLbl.setText(tp.cold ? '❄️' : '🔥'); }
      if (tp.state === 'ready')   { icon.setText('🫖'); waterLbl.setText(tp.cold ? '❄️' : '🔥'); }
    }
  }

  tsUpdateCupVis(i) {
    const cup = this.ts.cups[i];
    const vis = this.ts.cupVisuals[i];
    const tints = {
      empty:     0xffffff,
      withWater: cup.cold ? 0x88ccff : 0xffaa88,
      brewing:   0xffaa44,
      ready:     0x88ff99,
    };
    const alphas = { empty: 1, withWater: 1, brewing: 1, ready: 1 };
    const labels = {
      empty:     'Empty',
      withWater: 'Tap to brew',
      brewing:   cup.recipe?.label || 'Brewing',
      ready:     'Ready! Tap to serve',
    };
    const water = cup.state === 'empty' ? '' : (cup.cold ? '❄️' : '🔥');

    if (vis.icon._isImage) {
      const teacupChar = cup.charName || 'vera';
      const texKey = `tea_teacup_${teacupChar}`;
      if (this.textures.exists(texKey)) vis.icon.setTexture(texKey);
      vis.icon.setTint(tints[cup.state]).setAlpha(alphas[cup.state]);
    } else {
      const textIcon = cup.state === 'ready' ? '🍵' : '☕';
      vis.icon.setText(textIcon).setTint(tints[cup.state]);
    }
    vis.stateLbl.setText(labels[cup.state]);
    vis.waterIcon.setText(water);
    if (cup.state !== 'brewing') { vis.barBg.setAlpha(0); vis.barFill.setAlpha(0); }
  }

  tsFlash(msg) {
    const w = this.cameras.main.width;
    const y = this.cameras.main.height / 2;
    const t = this.add.text(w / 2, y, msg, {
      fontSize: '13px', fontFamily: 'Courier New', color: '#c4a575',
      stroke: '#000000', strokeThickness: 2
    }).setOrigin(0.5).setDepth(170);
    this.tweens.add({ targets: t, alpha: 0, duration: 1400, delay: 400, onComplete: () => t.destroy() });
  }

  tsEndSession() {
    // Dismiss all remaining customers
    for (let i = 0; i < 3; i++) {
      if (this.ts.customers[i]) this.tsCustomerLeave(i, false);
    }
    this.time.delayedCall(1200, () => this.tsShowSummary());
  }

  tsShowSummary() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const { served, missed } = this.ts.score;
    const total = served + missed;
    const pct = total > 0 ? served / total : 0;
    const grade = pct >= 0.95 ? 'S' : pct >= 0.80 ? 'A' : pct >= 0.60 ? 'B' : pct >= 0.40 ? 'C' : 'D';
    const gradeColors = { S: '#ffd700', A: '#4caf50', B: '#2196f3', C: '#ff9800', D: '#f44336' };

    this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.88).setDepth(300);
    const panelH = 320;
    this.add.rectangle(w / 2, h / 2, w - 30, panelH, 0x1a0f08).setStrokeStyle(2, 0x8b5c31).setDepth(301);

    const py = h / 2;
    this.add.text(w / 2, py - 130, 'Tea Service Complete!', {
      fontSize: '17px', fontFamily: 'Courier New', color: '#c4a575', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(302);
    this.add.text(w / 2, py - 90, `☕ Teacups Earned: ${this.ts.score.teacupsEarned}`, {
      fontSize: '14px', fontFamily: 'Courier New', color: '#ffffff'
    }).setOrigin(0.5).setDepth(302);
    this.add.text(w / 2, py - 55, `Served: ${served}   Missed: ${missed}`, {
      fontSize: '12px', fontFamily: 'Courier New', color: '#aaaaaa'
    }).setOrigin(0.5).setDepth(302);
    this.add.text(w / 2, py - 5, grade, {
      fontSize: '52px', fontFamily: 'Courier New', color: gradeColors[grade],
      fontStyle: 'bold', stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(302);

    const btn = this.add.rectangle(w / 2, py + 100, 160, 46, 0x8b5c31)
      .setStrokeStyle(2, 0xc4a575).setDepth(302).setInteractive({ useHandCursor: true });
    this.add.text(w / 2, py + 100, 'Continue', {
      fontSize: '17px', fontFamily: 'Courier New', color: '#fff'
    }).setOrigin(0.5).setDepth(303);

    btn.on('pointerover', () => btn.setFillStyle(0xaa7344));
    btn.on('pointerout', () => btn.setFillStyle(0x8b5c31));
    btn.on('pointerdown', () => {
      const puzzleId = `ch${this.chapterNumber}_${this.puzzleData.type}`;
      gameStateManager.completePuzzle(puzzleId);
      this.scene.stop('PuzzleScene');
      this.scene.resume('ChapterScene');
      if (this.onCompleteCallback) this.onCompleteCallback();
    });
  }

  // ============================================================
  // END TEA SERVICE MINIGAME
  // ============================================================

  completePuzzle() {
    console.log('Puzzle completed!');

    // Mark puzzle as completed
    const puzzleId = `ch${this.chapterNumber}_${this.puzzleData.type}`;
    gameStateManager.completePuzzle(puzzleId);

    // Success feedback (mobile-optimized)
    const successText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'Puzzle Complete!',
      {
        fontSize: '28px',
        fontFamily: 'Courier New',
        color: '#8b5c31',
        stroke: '#000000',
        strokeThickness: 3
      }
    ).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: successText,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          // Hide puzzle container before returning to chapter scene
          if (this.puzzleContainer) {
            this.puzzleContainer.setVisible(false);
          }

          if (this.onCompleteCallback) {
            this.onCompleteCallback();
          }
        });
      }
    });
  }

  createMazePuzzle() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Title
    const title = this.add.text(0, -350, this.puzzleData.title || 'Follow the Path', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold',
      wordWrap: { width: width - 40 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(title);

    // Instructions
    const instructions = this.add.text(0, -310, this.puzzleData.instructions || 'Choose the correct path', {
      fontSize: '13px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      wordWrap: { width: width - 60 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(instructions);

    // Create visual representation of the maze
    // Blinking blue light at top (the goal)
    const goalY = -200;
    const goalLight = this.add.circle(0, goalY, 15, 0x4444ff);
    this.puzzleContainer.add(goalLight);

    // Make the goal light blink
    this.tweens.add({
      targets: goalLight,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    // Paths from bottom to top
    const paths = this.puzzleData.paths || [];
    const pathSpacing = 120;
    const startY = 200;
    const pathStartX = -(paths.length - 1) * pathSpacing / 2;

    paths.forEach((pathData, index) => {
      const pathX = pathStartX + (index * pathSpacing);

      // Draw path visualization (simple line from bottom to top)
      const graphics = this.add.graphics();
      graphics.lineStyle(3, 0x666666, 0.5);
      graphics.beginPath();
      graphics.moveTo(pathX, startY);
      graphics.lineTo(pathX, goalY + 30);
      graphics.strokePath();
      this.puzzleContainer.add(graphics);

      // Path button/choice
      const pathButton = this.add.rectangle(pathX, startY, 100, 60, 0x8b5c31);
      pathButton.setStrokeStyle(2, 0xffffff);
      pathButton.setInteractive({ useHandCursor: true });
      this.puzzleContainer.add(pathButton);

      // Path label
      const labelText = pathData.label || `Path ${index + 1}`;
      const pathLabel = this.add.text(pathX, startY, labelText, {
        fontSize: '12px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        wordWrap: { width: 95 },
        align: 'center'
      }).setOrigin(0.5);
      this.puzzleContainer.add(pathLabel);

      // Hover effect
      pathButton.on('pointerover', () => {
        pathButton.setFillStyle(0xa67c52);
      });

      pathButton.on('pointerout', () => {
        pathButton.setFillStyle(0x8b5c31);
      });

      // Click handler
      pathButton.on('pointerdown', () => {
        this.checkMazePath(pathData, pathButton, pathX, startY, goalY);
      });
    });
  }

  checkMazePath(pathData, pathButton, pathX, startY, goalY) {
    // Disable all interactions
    this.input.enabled = false;

    if (pathData.correct) {
      // Correct path - animate success
      // Create a moving dot to show the path
      const movingDot = this.add.circle(pathX, startY, 8, 0xffff00);
      this.puzzleContainer.add(movingDot);

      this.tweens.add({
        targets: movingDot,
        y: goalY,
        duration: 1500,
        ease: 'Sine.inOut',
        onComplete: () => {
          // Flash the goal
          this.tweens.add({
            targets: movingDot,
            alpha: 0,
            scale: 2,
            duration: 300
          });

          // Show success message
          this.time.delayedCall(500, () => {
            this.showPuzzleSuccess(pathData.successMessage || 'You found the correct path!');
          });
        }
      });
    } else {
      // Wrong path - animate failure
      const movingDot = this.add.circle(pathX, startY, 8, 0xff4444);
      this.puzzleContainer.add(movingDot);

      this.tweens.add({
        targets: movingDot,
        y: goalY - 50,
        alpha: 0,
        duration: 1000,
        ease: 'Sine.inOut',
        onComplete: () => {
          // Show failure message
          this.showPuzzleFailure(pathData.failMessage || 'Wrong path! Try again.');
        }
      });
    }
  }

  showPuzzleSuccess(message) {
    const successText = this.add.text(0, 0, message, {
      fontSize: '16px',
      fontFamily: 'Courier New',
      color: '#4ade80',
      fontStyle: 'bold',
      wordWrap: { width: this.cameras.main.width - 60 },
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);
    this.puzzleContainer.add(successText);

    this.tweens.add({
      targets: successText,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          this.completePuzzle();
        });
      }
    });
  }

  showPuzzleFailure(message) {
    const failText = this.add.text(0, 100, message, {
      fontSize: '16px',
      fontFamily: 'Courier New',
      color: '#f87171',
      fontStyle: 'bold',
      wordWrap: { width: this.cameras.main.width - 60 },
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);
    this.puzzleContainer.add(failText);

    this.tweens.add({
      targets: failText,
      alpha: 1,
      duration: 500,
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          // Re-enable input and fade out failure message
          failText.destroy();
          this.input.enabled = true;
        });
      }
    });
  }

  createSequencePuzzle() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add desk background (safe closed)
    this.safeBg = this.add.image(width / 2, height / 2, 'home_office_safe_closed');

    // Scale background to fit screen width while maintaining aspect ratio
    const bgScale = width / this.safeBg.width;
    this.safeBg.setScale(bgScale);
    this.safeBg.setDepth(95); // Behind puzzle container

    // Title
    const title = this.add.text(0, -350, this.puzzleData.title || 'Follow the Sequence', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold',
      wordWrap: { width: width - 40 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(title);

    // Instructions at top (beneath title) with dialog box background
    const instructionsBg = this.add.rectangle(0, -300, width - 40, 50, 0x000000, 0.7);
    instructionsBg.setStrokeStyle(2, 0x8b5c31);
    this.puzzleContainer.add(instructionsBg);

    const instructions = this.add.text(0, -300, this.puzzleData.instructions || 'Perform the actions in order', {
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      wordWrap: { width: width - 60 },
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(instructions);

    // Sequence state
    this.sequenceSteps = this.puzzleData.steps || [];
    this.currentStepIndex = 0;
    this.currentStepProgress = 0;

    // Progress display (at bottom, above instructions) with dialog box background
    this.progressBg = this.add.rectangle(0, 280, width - 40, 40, 0x000000, 0.7);
    this.progressBg.setStrokeStyle(2, 0x8b5c31);
    this.puzzleContainer.add(this.progressBg);

    this.progressText = this.add.text(0, 280, this.getSequenceProgressText(), {
      fontSize: '16px',
      fontFamily: 'Courier New',
      color: '#add8e6',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    this.puzzleContainer.add(this.progressText);

    // Action buttons - centered and larger
    // Kick button with image (centered, larger)
    const kickButton = this.createKickButton(0, 0, () => this.performAction('kick'));
    this.puzzleContainer.add(kickButton.container);
    this.kickButton = kickButton;

    // Hum button (will be hidden when not needed)
    const humButton = this.createActionButton(0, 0, 'Whistle', () => this.performAction('hum'));
    this.puzzleContainer.add(humButton.container);
    this.humButton = humButton;

    // Update button states
    this.updateSequenceButtons();
  }

  createKickButton(x, y, callback) {
    const container = this.add.container(x, y);

    // Kick icon image (large, centered)
    const kickIcon = this.add.image(0, 0, 'kick_01');
    const iconScale = 150 / kickIcon.width; // Larger for center display
    kickIcon.setScale(iconScale);

    container.add(kickIcon);

    // Make the entire 150x150 area interactive
    const hitArea = new Phaser.Geom.Circle(0, 0, 75); // Circle with radius 75 (150px diameter)
    container.setSize(150, 150);
    container.setInteractive(hitArea, Phaser.Geom.Circle.Contains, { useHandCursor: true });

    container.on('pointerover', () => {
      if (container.visible) {
        // Slight scale on hover
        kickIcon.setScale(iconScale * 1.1);
      }
    });

    container.on('pointerout', () => {
      kickIcon.setScale(iconScale);
    });

    container.on('pointerdown', () => {
      if (container.visible) {
        // Flash to kick_02 for longer
        kickIcon.setTexture('kick_02');
        this.time.delayedCall(400, () => {
          kickIcon.setTexture('kick_01');
        });

        // Spawn flying "kick" text
        this.spawnKickText(container.x, container.y);

        callback();
      }
    });

    return { container, icon: kickIcon };
  }

  spawnKickText(x, y) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create "kick" text above the icon (white and semi-transparent)
    const kickText = this.add.text(width / 2, height / 2 - 100, 'kick', {
      fontSize: '32px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    kickText.setDepth(250);
    kickText.setAlpha(0.7); // Semi-transparent

    // Fly to top-right while fading
    this.tweens.add({
      targets: kickText,
      x: width - 100,
      y: 50,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.out',
      onComplete: () => {
        kickText.destroy();
      }
    });
  }

  createActionButton(x, y, label, callback) {
    const container = this.add.container(x, y);

    const text = this.add.text(0, 0, label, {
      fontSize: '16px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    container.add(text);
    container.setSize(100, 40);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-50, -20, 100, 40),
      Phaser.Geom.Rectangle.Contains,
      { useHandCursor: true }
    );

    container.on('pointerover', () => {
      if (container.alpha === 1) {
        text.setColor('#add8e6'); // Light blue on hover
      }
    });

    container.on('pointerout', () => {
      text.setColor('#ffffff');
    });

    container.on('pointerdown', () => {
      if (container.alpha === 1) {
        callback();
      }
    });

    return { container, text };
  }

  getSequenceProgressText() {
    const step = this.sequenceSteps[this.currentStepIndex];
    if (!step) return 'Complete!';

    const remaining = step.count - this.currentStepProgress;
    return `${step.label} ${remaining} more time${remaining === 1 ? '' : 's'}`;
  }

  updateSequenceButtons() {
    const currentStep = this.sequenceSteps[this.currentStepIndex];
    if (!currentStep) return;

    // Show only the active button
    if (currentStep.action === 'kick') {
      this.kickButton.container.setVisible(true);
      this.humButton.container.setVisible(false);
      this.whistleShown = false; // Reset flag for next whistle step
    } else if (currentStep.action === 'hum') {
      this.kickButton.container.setVisible(false);
      this.humButton.container.setVisible(false);
      // Automatically show whistle as full-screen item (only once per step)
      if (!this.whistleShown) {
        this.whistleShown = true;
        this.showWhistleAndNotes();
      }
    }
  }

  performAction(action) {
    const currentStep = this.sequenceSteps[this.currentStepIndex];

    if (!currentStep || currentStep.action !== action) {
      // Wrong action - show error
      this.showSequenceError();
      return;
    }

    // Handle hum action specially with whistle display
    if (action === 'hum') {
      this.showWhistleAndNotes();
      return;
    }

    // Correct action (kick)
    this.currentStepProgress++;

    // Visual feedback is handled by kick icon flash in createKickButton

    this.continueSequence();
  }

  continueSequence() {
    // Check if step is complete
    if (this.currentStepProgress >= this.sequenceSteps[this.currentStepIndex].count) {
      this.currentStepIndex++;
      this.currentStepProgress = 0;

      // Check if sequence is complete
      if (this.currentStepIndex >= this.sequenceSteps.length) {
        this.time.delayedCall(300, () => {
          this.sequenceComplete();
        });
      } else {
        // Move to next step
        this.progressText.setText(this.getSequenceProgressText());
        this.updateSequenceButtons();
      }
    } else {
      // Update progress and show next whistle if still on hum step
      this.progressText.setText(this.getSequenceProgressText());
      this.updateSequenceButtons();
    }
  }

  showWhistleAndNotes() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Show whistle in center
    const whistle = this.add.image(width / 2, height / 2, 'whistle_vera');
    const whistleScale = Math.min((width * 0.7) / whistle.width, (height * 0.6) / whistle.height);
    whistle.setScale(whistleScale);
    whistle.setDepth(200);
    whistle.setAlpha(0);
    whistle.setInteractive({ useHandCursor: true });

    // Fade in whistle
    this.tweens.add({
      targets: whistle,
      alpha: 1,
      duration: 300
    });

    // Click whistle to play notes
    whistle.once('pointerdown', () => {
      // Check if this is the third (final) whistle
      const isThirdWhistle = this.currentStepProgress === 2;
      const noteCount = isThirdWhistle ? 8 : 3;
      const fadeDelay = isThirdWhistle ? 1800 : 700;

      // Jiggle animation
      this.tweens.add({
        targets: whistle,
        angle: -5,
        duration: 100,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.inOut'
      });

      // Spawn musical notes (more for third whistle)
      for (let i = 0; i < noteCount; i++) {
        this.time.delayedCall(i * 200, () => {
          this.spawnMusicalNote(whistle.x + 50, whistle.y - 50);
        });
      }

      // Fade out whistle after notes start (longer for third whistle)
      this.time.delayedCall(fadeDelay, () => {
        this.tweens.add({
          targets: whistle,
          alpha: 0,
          duration: 300,
          onComplete: () => {
            whistle.destroy();

            // Reset flag so next whistle can appear
            this.whistleShown = false;

            // Progress the sequence
            this.currentStepProgress++;
            this.continueSequence();
          }
        });
      });
    });
  }

  spawnMusicalNote(x, y) {
    // Create musical note text (75% larger: 32 * 1.75 = 56px)
    const note = this.add.text(x, y, '♪', {
      fontSize: '56px',
      color: '#add8e6'
    }).setOrigin(0.5);
    note.setDepth(201);

    // Animate: float up-right and fade out
    this.tweens.add({
      targets: note,
      x: x + 100,
      y: y - 150,
      alpha: 0,
      duration: 2000,
      ease: 'Sine.out',
      onComplete: () => {
        note.destroy();
      }
    });
  }

  showSequenceError() {
    const errorText = this.add.text(0, 0, 'Wrong action!', {
      fontSize: '18px',
      fontFamily: 'Courier New',
      color: '#f87171',
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0);
    this.puzzleContainer.add(errorText);

    this.tweens.add({
      targets: errorText,
      alpha: 1,
      duration: 300,
      yoyo: true,
      onComplete: () => {
        errorText.destroy();
      }
    });

    // Reset to beginning
    this.currentStepIndex = 0;
    this.currentStepProgress = 0;
    this.progressText.setText(this.getSequenceProgressText());
    this.updateSequenceButtons();
  }

  sequenceComplete() {
    // Hide all buttons/icons and text
    if (this.kickButton && this.kickButton.container) {
      this.kickButton.container.setVisible(false);
    }
    if (this.humButton && this.humButton.container) {
      this.humButton.container.setVisible(false);
    }
    if (this.progressText) {
      this.progressText.setVisible(false);
    }
    if (this.progressBg) {
      this.progressBg.setVisible(false);
    }

    // Hide title and instructions from puzzle container
    this.puzzleContainer.list.forEach(child => {
      if (child.type === 'Text' || child.type === 'Rectangle') {
        child.setVisible(false);
      }
    });

    // Swap to open safe background
    this.tweens.add({
      targets: this.safeBg,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.safeBg.setTexture('home_office_safe_open');
        this.tweens.add({
          targets: this.safeBg,
          alpha: 1,
          duration: 300,
          onComplete: () => {
            // Make background clickable to continue
            this.safeBg.setInteractive({ useHandCursor: true });

            // Show click to continue prompt
            const continueText = this.add.text(
              this.cameras.main.width / 2,
              this.cameras.main.height - 50,
              'Click to continue',
              {
                fontSize: '18px',
                fontFamily: 'Courier New',
                color: '#ffffff',
                fontStyle: 'bold'
              }
            ).setOrigin(0.5).setAlpha(0);
            continueText.setDepth(250);

            this.tweens.add({
              targets: continueText,
              alpha: 1,
              duration: 500
            });

            // Click to exit minigame
            this.safeBg.once('pointerdown', () => {
              continueText.destroy();
              this.completePuzzle();
            });
          }
        });
      }
    });
  }
}
