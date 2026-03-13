/**
 * SubscriptionGateScene - Appears at start of Chapter 2 for non-subscribers
 */
import Phaser from 'phaser';
import gameStateManager from '../systems/GameStateManager.js';

export default class SubscriptionGateScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SubscriptionGateScene' });
  }

  init(data) {
    this.nextChapter = data.nextChapter || 2;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Semi-transparent background overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9);

    // Panel background
    const panelWidth = Math.min(400, width - 60);
    const panelHeight = Math.min(300, height - 100);
    const panel = this.add.rectangle(
      width / 2,
      height / 2,
      panelWidth,
      panelHeight,
      0x1a1a1a
    );
    panel.setStrokeStyle(3, 0x8b5c31);

    // Title
    const titleStyle = {
      fontSize: '22px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold',
      wordWrap: { width: panelWidth - 40 },
      align: 'center'
    };
    this.add.text(
      width / 2,
      height / 2 - 80,
      'Thank You for Playing!',
      titleStyle
    ).setOrigin(0.5);

    // Message
    const messageStyle = {
      fontSize: '16px',
      fontFamily: 'Courier New',
      color: '#c4a575',
      wordWrap: { width: panelWidth - 60 },
      align: 'center'
    };
    this.add.text(
      width / 2,
      height / 2 - 10,
      'We hope you have enjoyed Chapter 1.\n\nTo continue, please subscribe.',
      messageStyle
    ).setOrigin(0.5);

    // Subscribe button
    const buttonWidth = 200;
    const buttonHeight = 50;
    const buttonY = height / 2 + 80;

    const button = this.add.rectangle(
      width / 2,
      buttonY,
      buttonWidth,
      buttonHeight,
      0x8b5c31
    ).setInteractive({ useHandCursor: true });

    const buttonText = this.add.text(width / 2, buttonY, 'Subscribe', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Button hover effect
    button.on('pointerover', () => {
      button.setFillStyle(0xa67c52);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x8b5c31);
    });

    // Button click - go to subscription page
    button.on('pointerdown', () => {
      this.scene.start('SubscriptionScene', { returnToChapter: this.nextChapter });
    });
  }
}
