/**
 * SubscriptionScene - Placeholder subscription page
 */
import Phaser from 'phaser';
import gameStateManager from '../systems/GameStateManager.js';
import saveManager from '../systems/SaveManager.js';

export default class SubscriptionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SubscriptionScene' });
  }

  init(data) {
    this.returnToChapter = data.returnToChapter || null;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Title
    const titleStyle = {
      fontSize: '24px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold',
      wordWrap: { width: width - 60 },
      align: 'center'
    };
    this.add.text(width / 2, height / 2 - 150, 'Subscription', titleStyle)
      .setOrigin(0.5);

    // Message
    const messageStyle = {
      fontSize: '16px',
      fontFamily: 'Courier New',
      color: '#c4a575',
      wordWrap: { width: width - 80 },
      align: 'center'
    };
    this.add.text(
      width / 2,
      height / 2 - 50,
      'Subscription is placeholder for now.\n\nPlease click this button to continue.',
      messageStyle
    ).setOrigin(0.5);

    // Subscribe button
    const buttonWidth = 250;
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

    // Button click
    button.on('pointerdown', () => {
      // Mark player as subscribed
      gameStateManager.setSubscribed(true);
      saveManager.save('auto');

      console.log('Player subscribed!');

      // Return to chapter or main menu
      if (this.returnToChapter) {
        this.scene.start('ChapterScene', { chapterNumber: this.returnToChapter });
      } else {
        this.scene.start('MainMenuScene');
      }
    });
  }
}
