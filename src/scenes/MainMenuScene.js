/**
 * MainMenuScene - Main menu with New Game, Continue, and Settings
 */
import Phaser from 'phaser';
import gameStateManager from '../systems/GameStateManager.js';
import saveManager from '../systems/SaveManager.js';

const BASE = import.meta.env.BASE_URL;

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  preload() {
    // Load logo images
    if (!this.textures.exists('logo')) {
      this.load.image('logo', `${BASE}assets/images/ui/logo.png`);
    }
    if (!this.textures.exists('logo_thumbnail')) {
      this.load.image('logo_thumbnail', `${BASE}assets/images/ui/logo_thumbnail.png`);
    }
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Load save to get subscription status (if exists)
    if (saveManager.hasSave('auto')) {
      saveManager.load('auto');
    }

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Logo (scaled to fit screen width)
    const logo = this.add.image(width / 2, 120, 'logo');
    const logoScale = Math.min((width * 0.8) / logo.width, 180 / logo.height);
    logo.setScale(logoScale);

    // Calculate subtitle position below logo with spacing
    const logoHeight = logo.displayHeight;
    const subtitleY = 120 + (logoHeight / 2) + 40;

    // Subtitle (mobile-optimized)
    const subtitleStyle = {
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#c4a575',
      fontStyle: 'italic',
      wordWrap: { width: width - 40 }
    };
    this.add.text(width / 2, subtitleY, 'A Journey of Discovery\nand Courage', subtitleStyle)
      .setOrigin(0.5)
      .setAlign('center');

    // Check if there's a save file
    const hasSave = saveManager.hasSave('auto');

    // Check subscription status
    const isSubscribed = gameStateManager.isSubscribed();

    // Menu buttons (mobile-optimized spacing)
    const buttonY = 320;
    const buttonSpacing = 70;

    if (hasSave) {
      this.createMenuButton(width / 2, buttonY, 'Continue', () => this.continueGame());
      this.createMenuButton(width / 2, buttonY + buttonSpacing, 'New Game', () => this.newGame());
      this.createMenuButton(width / 2, buttonY + buttonSpacing * 2, 'Settings', () => this.openSettings());

      // Subscribe button
      const subscribeText = isSubscribed ? 'Subscribed' : 'Subscribe';
      const subscribeButton = this.createMenuButton(
        width / 2,
        buttonY + buttonSpacing * 3,
        subscribeText,
        () => this.openSubscription()
      );

      // Disable interaction if already subscribed
      if (isSubscribed) {
        subscribeButton.button.setFillStyle(0x555555);
        subscribeButton.container.removeInteractive();
      }
    } else {
      this.createMenuButton(width / 2, buttonY + buttonSpacing, 'New Game', () => this.newGame());
      this.createMenuButton(width / 2, buttonY + buttonSpacing * 2, 'Settings', () => this.openSettings());

      // Subscribe button
      const subscribeText = isSubscribed ? 'Subscribed' : 'Subscribe';
      const subscribeButton = this.createMenuButton(
        width / 2,
        buttonY + buttonSpacing * 3,
        subscribeText,
        () => this.openSubscription()
      );

      // Disable interaction if already subscribed
      if (isSubscribed) {
        subscribeButton.button.setFillStyle(0x555555);
        subscribeButton.container.removeInteractive();
      }
    }

    // Credits (mobile-optimized)
    const creditsStyle = {
      fontSize: '12px',
      fontFamily: 'Courier New',
      color: '#666666'
    };
    this.add.text(width / 2, height - 30, 'Created with Phaser 3 | 2026', creditsStyle).setOrigin(0.5);
  }

  createMenuButton(x, y, text, callback) {
    const buttonWidth = 280;
    const buttonHeight = 55;

    // Create container for button
    const container = this.add.container(x, y);

    // Button background
    const button = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333);
    button.setStrokeStyle(2, 0x8b5c31);

    // Button text (mobile-optimized)
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '22px',
      fontFamily: 'Courier New',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Add to container
    container.add([button, buttonText]);

    // Make container interactive with explicit hit area
    container.setSize(buttonWidth, buttonHeight);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight),
      Phaser.Geom.Rectangle.Contains,
      { useHandCursor: true }
    );

    container.on('pointerover', () => {
      console.log('Hover over:', text);
      button.setFillStyle(0x8b5c31);
      buttonText.setColor('#ffffff');
    });

    container.on('pointerout', () => {
      console.log('Hover out:', text);
      button.setFillStyle(0x333333);
      buttonText.setColor('#ffffff');
    });

    container.on('pointerdown', () => {
      console.log('Pointer down:', text);
      container.setScale(0.95);
    });

    container.on('pointerup', () => {
      console.log('Pointer up - Button clicked:', text);
      container.setScale(1);
      try {
        callback();
      } catch (error) {
        console.error('Error in callback:', error);
      }
    });

    return { container, button, buttonText };
  }

  newGame() {
    console.log('Starting new game');

    // Reset game state
    gameStateManager.resetState();

    // Start from chapter 1
    gameStateManager.setCurrentChapter(1);

    // Transition to chapter scene
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      this.scene.start('ChapterScene', { chapterNumber: 1 });
    });
  }

  continueGame() {
    console.log('Continuing game');

    // Load save
    const saveData = saveManager.load('auto');

    if (saveData) {
      const currentChapter = gameStateManager.getState().currentChapter;

      // Transition to current chapter
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('ChapterScene', { chapterNumber: currentChapter });
      });
    } else {
      console.error('No save found');
      this.newGame();
    }
  }

  openSettings() {
    console.log('Opening settings');
    this.scene.launch('SettingsScene');
    this.scene.pause();
  }

  openSubscription() {
    console.log('Opening subscription');
    this.scene.start('SubscriptionScene');
  }
}
