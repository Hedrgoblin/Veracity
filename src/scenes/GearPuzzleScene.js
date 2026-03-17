import Phaser from 'phaser';

const BASE      = import.meta.env.BASE_URL;
const GEAR_PATH = `${BASE}assets/images/puzzles/gears/`;
const BG_PATH   = `${BASE}assets/images/backgrounds/`;

// Exact debug-map colours with ±40 tolerance
const COLOURS = {
  yellow:  { r: 222, g: 255, b: 0   }, // #deff00 → gear_light indicator
  magenta: { r: 210, g: 0,   b: 255 }, // #d200ff → gear_light_purple (decoration)
  green:   { r: 0,   g: 255, b: 48  }, // #00ff30 → gear_05
  blue:    { r: 0,   g: 120, b: 255 }, // #0078ff → gear_04
  purple:  { r: 150, g: 0,   b: 255 }, // #9600ff → gear_06
};
const TOLERANCE = 40;

function classifyPixel(r, g, b, a) {
  if (a < 50) return null;
  for (const [name, ref] of Object.entries(COLOURS)) {
    if (
      Math.abs(r - ref.r) <= TOLERANCE &&
      Math.abs(g - ref.g) <= TOLERANCE &&
      Math.abs(b - ref.b) <= TOLERANCE
    ) return name;
  }
  return null;
}

// Returns { cx, cy, w, h } for each distinct blob of the given colour
function findBlobs(imageData, imgW, colorName, clusterRadius = 80) {
  const clusters = []; // { minX, maxX, minY, maxY, sumX, sumY, count }
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (classifyPixel(data[i], data[i+1], data[i+2], data[i+3]) !== colorName) continue;
    const px = (i / 4) % imgW;
    const py = Math.floor((i / 4) / imgW);

    let nearest = null, nearestD = Infinity;
    for (const c of clusters) {
      const d = Math.hypot(px - c.sumX / c.count, py - c.sumY / c.count);
      if (d < nearestD) { nearestD = d; nearest = c; }
    }
    if (nearest && nearestD < clusterRadius) {
      nearest.sumX += px; nearest.sumY += py; nearest.count++;
      nearest.minX = Math.min(nearest.minX, px); nearest.maxX = Math.max(nearest.maxX, px);
      nearest.minY = Math.min(nearest.minY, py); nearest.maxY = Math.max(nearest.maxY, py);
    } else {
      clusters.push({ sumX: px, sumY: py, count: 1, minX: px, maxX: px, minY: py, maxY: py });
    }
  }

  return clusters
    .filter(c => c.count >= 20)
    .map(c => ({
      cx: (c.minX + c.maxX) / 2,  // bbox center — matches how setDisplaySize fills minX→maxX
      cy: (c.minY + c.maxY) / 2,
      w:  c.maxX - c.minX,
      h:  c.maxY - c.minY,
    }))
    .sort((a, b) => a.cy - b.cy);
}

export default class GearPuzzleScene extends Phaser.Scene {
  constructor() { super({ key: 'GearPuzzleScene' }); }

  init(data) {
    this.onComplete    = data.onComplete;
    this.chapterNumber = data.chapterNumber;
  }

  preload() {
    const bg   = (k, f) => { if (!this.textures.exists(k)) this.load.image(k, BG_PATH   + f); };
    const gear = (k, f) => { if (!this.textures.exists(k)) this.load.image(k, GEAR_PATH + f); };

    bg('gcm_bg',    'puzzle_gear_clockmakers_01.png');
    bg('gcm_debug', 'puzzle_gear_clockmakers_01_debug.png');

    gear('gear_04',           'gear_04.png');
    gear('gear_05',           'gear_05.png');
    gear('gear_06',           'gear_06.png');
    gear('gear_light_purple', 'gear_light_purple.png');
    gear('gear_light_green',  'gear_light_green.png');
    gear('gear_light_red',    'gear_light_red.png');
    gear('gear_light_off',    'gear_light_off.png');
  }

  create() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    // ── Background ───────────────────────────────────────────────────
    const bg = this.add.image(W / 2, H / 2, 'gcm_bg').setOrigin(0.5);
    this.imgScale   = Math.min(W / bg.width, H / bg.height);
    this.imgOffsetX = (W - bg.width  * this.imgScale) / 2;
    this.imgOffsetY = (H - bg.height * this.imgScale) / 2;
    bg.setScale(this.imgScale).setDepth(0);

    // ── Debug pixel data ─────────────────────────────────────────────
    const src = this.textures.get('gcm_debug').getSourceImage();
    const cvs = document.createElement('canvas');
    cvs.width = src.width; cvs.height = src.height;
    const ctx = cvs.getContext('2d');
    ctx.drawImage(src, 0, 0);
    const debugData = ctx.getImageData(0, 0, src.width, src.height);
    const debugW    = src.width;

    // Map debug-image pixel coords to screen coords
    const bgScreenW   = bg.width  * this.imgScale;
    const bgScreenH   = bg.height * this.imgScale;
    const debugScaleX = bgScreenW / debugW;
    const debugScaleY = bgScreenH / src.height;

    // ── Blob detection ───────────────────────────────────────────────
    const blobs = (color) =>
      findBlobs(debugData, debugW, color).map(b => ({
        x: b.cx * debugScaleX + this.imgOffsetX,
        y: b.cy * debugScaleY + this.imgOffsetY,
        w: b.w  * debugScaleX,
        h: b.h  * debugScaleY,
      }));

    const yellowBlobs  = blobs('yellow');
    const magentaBlobs = blobs('magenta');
    // Interactive gears: exactly one each — take the largest blob
    const largest = (list) => list.length === 0 ? [] : [list.reduce((a, b) => (a.w * a.h > b.w * b.h ? a : b))];
    const greenBlobs  = largest(blobs('green'));
    const blueBlobs   = largest(blobs('blue'));
    const purpleBlobs = largest(blobs('purple'));

    console.log('GearPuzzle blobs:', {
      yellow:  yellowBlobs.map(b  => `(${Math.round(b.x)},${Math.round(b.y)}) ${Math.round(b.w)}×${Math.round(b.h)}`),
      magenta: magentaBlobs.map(b => `(${Math.round(b.x)},${Math.round(b.y)}) ${Math.round(b.w)}×${Math.round(b.h)}`),
      green:   greenBlobs.map(b  => `(${Math.round(b.x)},${Math.round(b.y)}) ${Math.round(b.w)}×${Math.round(b.h)}`),
      blue:    blueBlobs.map(b   => `(${Math.round(b.x)},${Math.round(b.y)}) ${Math.round(b.w)}×${Math.round(b.h)}`),
      purple:  purpleBlobs.map(b => `(${Math.round(b.x)},${Math.round(b.y)}) ${Math.round(b.w)}×${Math.round(b.h)}`),
    });

    // ── Place gear_light_purple decorations (magenta, behind gears) ──
    magentaBlobs.forEach(b => {
      this.add.image(b.x, b.y, 'gear_light_purple')
        .setScale(this.imgScale)
        .setDepth(1);
    });

    // ── Place gear_light indicators (yellow, top-most layer) ─────────
    this.indicators = yellowBlobs.map(b =>
      this.add.image(b.x, b.y, 'gear_light_off')
        .setScale(this.imgScale * 0.5)
        .setDepth(10)
    );

    // ── Rotating interactive gears ────────────────────────────────────
    const GEAR_Y_OFFSET = 30;
    const makeGear = (key, blobList, depth) =>
      blobList.map(b => {
        const x = b.x, y = b.y + GEAR_Y_OFFSET;
        const img = this.add.image(x, y, key)
          .setDepth(depth)
          .setInteractive({ useHandCursor: true });
        img.setScale(this.imgScale);
        this.tweens.add({ targets: img, angle: 360, duration: 4000, repeat: -1, ease: 'Linear' });
        return { img, key, pos: { x, y }, baseScale: this.imgScale };
      });

    this.gear04s = makeGear('gear_04', blueBlobs,   4);
    this.gear05s = makeGear('gear_05', greenBlobs,  4);
    this.gear06s = makeGear('gear_06', purpleBlobs, 4);

    this.allGears = [
      ...this.gear04s.map(g => ({ ...g, id: 'gear_04' })),
      ...this.gear05s.map(g => ({ ...g, id: 'gear_05' })),
      ...this.gear06s.map(g => ({ ...g, id: 'gear_06' })),
    ];

    // ── Connection state ──────────────────────────────────────────────
    this.sequence            = ['gear_04', 'gear_05', 'gear_06'];
    this.completedSteps      = 0;
    this.completedConnections = [];
    this.currentLine         = null; // { fromGear, startX, startY }
    this.lineGraphics        = this.add.graphics().setDepth(6);
    this.solved              = false;

    // ── Input — drag to connect ───────────────────────────────────────
    this.allGears.forEach(g => {
      g.img.on('pointerdown', () => {
        if (this.solved) return;
        this.currentLine = { fromGear: g, startX: g.pos.x, startY: g.pos.y };
        g.img.setTint(0x00ffff);
      });
      g.img.on('pointerover', () => { if (!this.currentLine) g.img.setTint(0xffffaa); });
      g.img.on('pointerout',  () => { if (!this.currentLine || this.currentLine.fromGear !== g) g.img.clearTint(); });
    });

    this.input.on('pointermove', (pointer) => {
      if (!this.currentLine) return;
      this.redrawLines(pointer.x, pointer.y);
    });

    this.input.on('pointerup', (pointer) => {
      if (!this.currentLine) return;
      const from = this.currentLine.fromGear;
      from.img.clearTint();
      this.currentLine = null;

      const target = this.allGears.find(g =>
        g !== from &&
        Phaser.Math.Distance.Between(pointer.x, pointer.y, g.pos.x, g.pos.y) < 80
      );

      if (target) this.attemptConnection(from, target);
      this.redrawLines();
    });

    // ── UI ────────────────────────────────────────────────────────────
    this.add.text(W / 2, 28, 'Connect the gears to unlock the door', {
      fontSize: '13px', fontFamily: 'Courier New', color: '#c4a575', align: 'center'
    }).setOrigin(0.5).setDepth(11);

    this.statusText = this.add.text(W / 2, H - 30, '', {
      fontSize: '13px', fontFamily: 'Courier New', color: '#ffffff', align: 'center'
    }).setOrigin(0.5).setDepth(11);
  }

  redrawLines(curX, curY) {
    this.lineGraphics.clear();
    this.completedConnections.forEach(c => this.drawGlowLine(c.x1, c.y1, c.x2, c.y2));
    if (this.currentLine && curX !== undefined) {
      this.drawGlowLine(this.currentLine.startX, this.currentLine.startY, curX, curY);
    }
  }

  drawGlowLine(x1, y1, x2, y2) {
    this.lineGraphics.lineStyle(12, 0x87ceeb, 0.3);
    this.lineGraphics.lineBetween(x1, y1, x2, y2);
    this.lineGraphics.lineStyle(6, 0x87ceeb, 0.6);
    this.lineGraphics.lineBetween(x1, y1, x2, y2);
    this.lineGraphics.lineStyle(3, 0xadd8e6, 1.0);
    this.lineGraphics.lineBetween(x1, y1, x2, y2);
  }

  attemptConnection(from, to) {
    const correct =
      from.id === this.sequence[this.completedSteps] &&
      to.id   === this.sequence[this.completedSteps + 1];

    if (correct) {
      this.completedSteps++;
      this.completedConnections.push({ x1: from.pos.x, y1: from.pos.y, x2: to.pos.x, y2: to.pos.y });
      this.redrawLines();

      // Pulse both gears — relative to base scale
      [from, to].forEach(g => {
        this.tweens.add({
          targets: g.img,
          scale: g.baseScale * 1.1,
          duration: 150,
          yoyo: true,
          ease: 'Quad.easeOut',
          onComplete: () => g.img.setScale(g.baseScale),
        });
      });

      const idx = this.completedSteps - 1;
      if (this.indicators[idx]) this.indicators[idx].setTexture('gear_light_green');

      if (this.completedSteps >= this.sequence.length - 1) {
        this.triggerWin();
      } else {
        this.statusText.setText('Connection made! Continue...');
      }
    } else {
      this.indicators.forEach(ind => {
        if (ind.texture.key === 'gear_light_off') {
          ind.setTexture('gear_light_red');
          this.time.delayedCall(900, () => ind.setTexture('gear_light_off'));
        }
      });
      this.statusText.setText('Wrong connection — try again');
      this.time.delayedCall(1200, () => this.statusText.setText(''));
    }
  }

  triggerWin() {
    this.solved = true;
    this.indicators.forEach(ind => ind.setTexture('gear_light_green'));
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;
    this.time.delayedCall(600, () => {
      this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.75).setDepth(20);
      this.add.text(W / 2, H / 2 - 40, 'The lock clicks open.', {
        fontSize: '24px', fontFamily: 'Courier New', color: '#c4a575', fontStyle: 'bold',
        align: 'center', wordWrap: { width: W - 60 }
      }).setOrigin(0.5).setDepth(21);
      const btn = this.add.text(W / 2, H / 2 + 40, '[ Continue ]', {
        fontSize: '20px', fontFamily: 'Courier New', color: '#ffffff'
      }).setOrigin(0.5).setDepth(21).setInteractive({ useHandCursor: true });
      this.tweens.add({ targets: btn, alpha: 0, duration: 700, yoyo: true, repeat: -1 });
      btn.once('pointerdown', () => { if (this.onComplete) this.onComplete(); });
    });
  }
}
