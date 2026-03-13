/**
 * BootScene - Handles initial asset loading and game initialization
 */
import Phaser from 'phaser';

const BASE = import.meta.env.BASE_URL;

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Create loading bar first (before any assets load)
    this.createLoadingBar();

    // Load logo for loading screen
    this.load.image('logo_thumbnail', `${BASE}assets/images/ui/logo_thumbnail.png`);

    // Add logo to loading bar once it loads
    this.load.once('filecomplete-image-logo_thumbnail', () => {
      this.addLogoToLoadingBar();
    });

    // Load placeholder assets for initial development
    // These will be replaced by actual art assets later
    this.loadPlaceholderAssets();

    // Load UI assets
    this.loadUIAssets();

    // Load audio (if available)
    this.loadAudioAssets();

    // Set up load progress handlers
    this.load.on('progress', this.onLoadProgress, this);
    this.load.on('complete', this.onLoadComplete, this);
  }

  createLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Loading text (mobile-optimized) - logo will be added later
    const subtitleStyle = {
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#c4a575'
    };
    this.add.text(width / 2, height / 2 - 30, 'Loading...', subtitleStyle).setOrigin(0.5);

    // Progress bar background (mobile-optimized)
    const barWidth = width - 80;
    const barHeight = 25;
    this.progressBar = this.add.rectangle(width / 2, height / 2 + 50, barWidth, barHeight, 0x333333);
    this.progressBar.setOrigin(0.5);

    // Progress bar fill
    this.progressFill = this.add.rectangle(
      width / 2 - barWidth / 2,
      height / 2 + 50,
      0,
      barHeight,
      0x8b5c31
    );
    this.progressFill.setOrigin(0, 0.5);

    // Progress text (mobile-optimized)
    this.progressText = this.add.text(width / 2, height / 2 + 60, '0%', {
      fontSize: '16px',
      fontFamily: 'Courier New',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  addLogoToLoadingBar() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Add logo thumbnail now that it's loaded
    if (this.textures.exists('logo_thumbnail')) {
      const logo = this.add.image(width / 2, height / 2 - 100, 'logo_thumbnail');
      const logoScale = Math.min((width * 0.6) / logo.width, 120 / logo.height);
      logo.setScale(logoScale);
    }
  }

  onLoadProgress(progress) {
    const barWidth = this.cameras.main.width - 80;
    this.progressFill.width = barWidth * progress;
    this.progressText.setText(`${Math.round(progress * 100)}%`);
  }

  onLoadComplete() {
    console.log('Assets loaded successfully');
  }

  loadPlaceholderAssets() {
    // Create placeholder graphics programmatically
    this.createPlaceholderGraphics();
  }

  createPlaceholderGraphics() {
    // Create placeholder background (mobile size)
    const bgGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    bgGraphics.fillStyle(0x4a5f7a);
    bgGraphics.fillRect(0, 0, 375, 812);
    bgGraphics.generateTexture('placeholder_bg', 375, 812);
    bgGraphics.destroy();

    // Note: All character placeholders (Vera, Addie, Rainie) are NOT created here
    // They will be loaded from actual image files in ChapterScene
    // This allows custom art to work without being overridden

    // Create puzzle elements
    const connectionPointGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    connectionPointGraphics.fillStyle(0xffd700);
    connectionPointGraphics.fillCircle(32, 32, 20);
    connectionPointGraphics.lineStyle(3, 0x8b5c31);
    connectionPointGraphics.strokeCircle(32, 32, 20);
    connectionPointGraphics.generateTexture('puzzle_point', 64, 64);
    connectionPointGraphics.destroy();
  }


  loadUIAssets() {
    // UI assets will be loaded here
    // For now, we'll create them programmatically in the scenes
  }

  loadAudioAssets() {
    // Audio assets will be loaded here when available
    // this.load.audio('music_chapter1', '/assets/audio/music/chapter1.mp3');
    // this.load.audio('sfx_click', '/assets/audio/sfx/click.mp3');
  }

  create() {
    console.log('BootScene: Assets loaded, starting game');

    // Short delay before transitioning
    this.time.delayedCall(500, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
