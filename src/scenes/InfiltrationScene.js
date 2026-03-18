import Phaser from 'phaser';

const BASE = import.meta.env.BASE_URL;

export default class InfiltrationScene extends Phaser.Scene {
  constructor() {
    super({ key: 'InfiltrationScene' });
  }

  init(data) {
    this.onComplete = data.onComplete;
    this.chapterNumber = data.chapterNumber;
  }

  preload() {
    if (!this.textures.exists('infiltration_bg')) {
      this.load.image('infiltration_bg', `${BASE}assets/images/backgrounds/puzzle_northern_sanctuary_ext.png`);
    }
    if (!this.textures.exists('infiltration_debug')) {
      this.load.image('infiltration_debug', `${BASE}assets/images/backgrounds/puzzle_northern_sanctuary_ext_debug.png`);
    }
    if (!this.textures.exists('hide_vera')) {
      this.load.image('hide_vera', `${BASE}assets/images/items/hide_vera.png`);
    }
    if (!this.textures.exists('sneak_vera')) {
      this.load.image('sneak_vera', `${BASE}assets/images/items/sneak_vera.png`);
    }
    if (!this.textures.exists('steal_vera')) {
      this.load.image('steal_vera', `${BASE}assets/images/items/steal_vera.png`);
    }
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    const bg = this.add.image(width / 2, height / 2, 'infiltration_bg').setOrigin(0.5);
    const bgScale = Math.min(width / bg.width, height / bg.height);
    bg.setScale(bgScale);
    this.bgScale = bgScale;
    this.bgOffsetX = (width - bg.width * bgScale) / 2;
    this.bgOffsetY = (height - bg.height * bgScale) / 2;

    // Build pixel map from debug image
    this.buildDebugPixelMap();

    // Find circle centers from debug map colors
    const greenPos   = this.findColorCenter(0x00, 0xff, 0x12); // Hide   — #00ff12
    const bluePos    = this.findColorCenter(0x00, 0x78, 0xff); // Sneak  — #0078ff
    const magentaPos = this.findColorCenter(0xd2, 0x00, 0xff); // Steal  — #d200ff

    this.steps = [
      { key: 'hide_vera',  x: greenPos.x,   y: greenPos.y,   label: 'Hide!'  },
      { key: 'sneak_vera', x: bluePos.x,    y: bluePos.y,    label: 'Sneak!' },
      { key: 'steal_vera', x: magentaPos.x, y: magentaPos.y, label: 'Yoink!' }
    ];

    // Title
    this.add.text(width / 2, 40, 'Infiltrate the Sanctuary', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold',
      wordWrap: { width: width - 40 },
      align: 'center'
    }).setOrigin(0.5).setDepth(20);

    // Instructions bar
    this.add.rectangle(width / 2, 85, width - 40, 44, 0x000000, 0.7)
      .setStrokeStyle(2, 0x8b5c31).setDepth(20);
    this.add.text(width / 2, 85, 'Tap each action as it appears.', {
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      wordWrap: { width: width - 60 },
      align: 'center'
    }).setOrigin(0.5).setDepth(21);

    this.currentStep = 0;
    this.showStep();
  }

  buildDebugPixelMap() {
    const src = this.textures.get('infiltration_debug').getSourceImage();
    const canvas = document.createElement('canvas');
    canvas.width = src.width;
    canvas.height = src.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(src, 0, 0);
    this.debugData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.debugWidth = canvas.width;
    this.debugHeight = canvas.height;
  }

  // Find the center of a colored circle region, mapped to screen coordinates
  findColorCenter(tr, tg, tb) {
    const tolerance = 30;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const data = this.debugData.data;

    for (let y = 0; y < this.debugHeight; y++) {
      for (let x = 0; x < this.debugWidth; x++) {
        const i = (y * this.debugWidth + x) * 4;
        const a = data[i + 3];
        if (a < 128) continue;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (
          Math.abs(r - tr) <= tolerance &&
          Math.abs(g - tg) <= tolerance &&
          Math.abs(b - tb) <= tolerance
        ) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (minX === Infinity) {
      // Color not found — fall back to screen center
      return { x: this.cameras.main.width / 2, y: this.cameras.main.height / 2 };
    }

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return {
      x: cx * this.bgScale + this.bgOffsetX,
      y: cy * this.bgScale + this.bgOffsetY
    };
  }

  showStep() {
    if (this.currentStep >= this.steps.length) {
      if (this.onComplete) {
        const cb = this.onComplete;
        this.onComplete = null;
        this.scene.stop();
        cb();
      }
      return;
    }

    const step = this.steps[this.currentStep];
    const img = this.add.image(step.x, step.y, step.key)
      .setAlpha(0)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    // Scale to fit within 150px
    const maxSize = 150;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    img.setScale(scale);

    // Fade in
    this.tweens.add({ targets: img, alpha: 1, duration: 400 });

    // Click: spawn floating label, wiggle then fade out
    img.once('pointerdown', () => {
      img.disableInteractive();

      // Floating label
      const label = this.add.text(step.x, step.y - 60, step.label, {
        fontSize: '22px',
        fontFamily: 'Courier New',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(20);

      this.tweens.add({
        targets: label,
        y: step.y - 130,
        alpha: 0,
        duration: 1000,
        ease: 'Cubic.out',
        onComplete: () => label.destroy()
      });

      this.tweens.add({
        targets: img,
        angle: -5,
        duration: 100,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.inOut',
        onComplete: () => {
          img.setAngle(0);
          this.tweens.add({
            targets: img,
            alpha: 0,
            duration: 400,
            onComplete: () => {
              img.destroy();
              this.currentStep++;
              this.showStep();
            }
          });
        }
      });
    });
  }
}
