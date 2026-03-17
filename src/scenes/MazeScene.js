import Phaser from 'phaser';

const BASE = import.meta.env.BASE_URL;

export default class MazeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MazeScene' });
  }

  init(data) {
    this.onComplete = data.onComplete;
    this.chapterNumber = data.chapterNumber;
  }

  preload() {
    if (!this.textures.exists('maze_display')) {
      this.load.image('maze_display', `${BASE}assets/images/backgrounds/puzzle_moth_map_01.png`);
    }
    if (!this.textures.exists('maze_debug')) {
      this.load.image('maze_debug', `${BASE}assets/images/backgrounds/puzzle_moth_map_01_debug.png`);
    }
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Display maze image scaled to fit
    this.mazeImage = this.add.image(width / 2, height / 2, 'maze_display').setOrigin(0.5);
    const scaleX = width / this.mazeImage.width;
    const scaleY = height / this.mazeImage.height;
    this.imageScale = Math.min(scaleX, scaleY);
    this.mazeImage.setScale(this.imageScale);
    this.imageOffsetX = (width - this.mazeImage.width * this.imageScale) / 2;
    this.imageOffsetY = (height - this.mazeImage.height * this.imageScale) / 2;

    // Build pixel map from debug image (never displayed)
    this.buildDebugPixelMap();

    // Find start (lowest green pixel) and end (topmost green pixel)
    this.startPos = this.findExtremity('green', 'bottom');
    this.endPos   = this.findExtremity('green', 'top');

    // Place ball at start
    this.ballX = this.startPos.x;
    this.ballY = this.startPos.y;
    this.ballGraphics = this.add.graphics().setDepth(10);
    this.drawBall(false);

    // Input
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerdown',  this.onPointerMove, this);

    this.won = false;
  }

  buildDebugPixelMap() {
    const src = this.textures.get('maze_debug').getSourceImage();
    const canvas = document.createElement('canvas');
    canvas.width  = src.width;
    canvas.height = src.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(src, 0, 0);
    this.debugImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.debugWidth  = canvas.width;
    this.debugHeight = canvas.height;
  }

  // Returns 'green', 'red', or null
  samplePath(screenX, screenY) {
    const ix = Math.round((screenX - this.imageOffsetX) / this.imageScale);
    const iy = Math.round((screenY - this.imageOffsetY) / this.imageScale);
    if (ix < 0 || ix >= this.debugWidth || iy < 0 || iy >= this.debugHeight) return null;

    const i = (iy * this.debugWidth + ix) * 4;
    const r = this.debugImageData.data[i];
    const g = this.debugImageData.data[i + 1];
    const b = this.debugImageData.data[i + 2];
    const a = this.debugImageData.data[i + 3];
    if (a < 128) return null;
    if (g > 150 && r < 100 && b < 100) return 'green';
    if (r > 150 && g < 100 && b < 100) return 'red';
    return null;
  }

  // Scan debug map for extreme pixel of a given color
  findExtremity(color, edge) {
    const scanTop    = edge === 'top';
    const yStart     = scanTop ? 0 : this.debugHeight - 1;
    const yEnd       = scanTop ? this.debugHeight : -1;
    const yStep      = scanTop ? 1 : -1;

    for (let y = yStart; y !== yEnd; y += yStep) {
      for (let x = 0; x < this.debugWidth; x++) {
        const i = (y * this.debugWidth + x) * 4;
        const r = this.debugImageData.data[i];
        const g = this.debugImageData.data[i + 1];
        const b = this.debugImageData.data[i + 2];
        const isGreen = g > 150 && r < 100 && b < 100;
        const isRed   = r > 150 && g < 100 && b < 100;
        if ((color === 'green' && isGreen) || (color === 'red' && isRed)) {
          return {
            x: x * this.imageScale + this.imageOffsetX,
            y: y * this.imageScale + this.imageOffsetY
          };
        }
      }
    }
    return { x: this.cameras.main.width / 2, y: this.cameras.main.height / 2 };
  }

  drawBall(isRed) {
    this.ballGraphics.clear();
    const x = this.ballX;
    const y = this.ballY;
    if (isRed) {
      this.ballGraphics.fillStyle(0xff0000, 0.08); this.ballGraphics.fillCircle(x, y, 22);
      this.ballGraphics.fillStyle(0xff2200, 0.18); this.ballGraphics.fillCircle(x, y, 15);
      this.ballGraphics.fillStyle(0xff4444, 0.55); this.ballGraphics.fillCircle(x, y, 9);
      this.ballGraphics.fillStyle(0xffffff, 1.00); this.ballGraphics.fillCircle(x, y, 5);
    } else {
      this.ballGraphics.fillStyle(0x0044ff, 0.08); this.ballGraphics.fillCircle(x, y, 22);
      this.ballGraphics.fillStyle(0x0066ff, 0.20); this.ballGraphics.fillCircle(x, y, 15);
      this.ballGraphics.fillStyle(0x88aaff, 0.55); this.ballGraphics.fillCircle(x, y, 9);
      this.ballGraphics.fillStyle(0xffffff, 1.00); this.ballGraphics.fillCircle(x, y, 5);
    }
  }

  onPointerMove(pointer) {
    if (this.won) return;
    const color = this.samplePath(pointer.x, pointer.y);
    if (!color) return; // off path — block movement

    this.ballX = pointer.x;
    this.ballY = pointer.y;
    this.drawBall(color === 'red');

    // Win: reached top of green path
    if (color === 'green') {
      const dx = this.ballX - this.endPos.x;
      const dy = this.ballY - this.endPos.y;
      const endRadiusPx = 20 * this.imageScale;
      if (Math.sqrt(dx * dx + dy * dy) < endRadiusPx) {
        this.triggerWin();
      }
    }
  }

  triggerWin() {
    this.won = true;
    this.input.off('pointermove', this.onPointerMove, this);
    this.input.off('pointerdown',  this.onPointerMove, this);

    const width  = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75).setDepth(20);
    this.add.text(width / 2, height / 2 - 40, 'You followed the moth!', {
      fontSize: '24px', fontFamily: 'Courier New', color: '#c4a575', fontStyle: 'bold',
      align: 'center', wordWrap: { width: width - 60 }
    }).setOrigin(0.5).setDepth(21);

    const continueBtn = this.add.text(width / 2, height / 2 + 40, '[ Continue ]', {
      fontSize: '20px', fontFamily: 'Courier New', color: '#ffffff'
    }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: continueBtn, alpha: 0, duration: 700, yoyo: true, repeat: -1 });

    continueBtn.once('pointerdown', () => {
      if (this.onComplete) this.onComplete();
    });
  }
}
