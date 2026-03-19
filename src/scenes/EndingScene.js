/**
 * EndingScene - Game ending with credits
 */
import Phaser from 'phaser';
import BackButton from '../components/BackButton.js';

export default class EndingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndingScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

    // Fade in
    this.cameras.main.fadeIn(2000, 0, 0, 0);

    // Ending title
    const titleStyle = {
      fontSize: '48px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    };

    this.add.text(width / 2, 150, 'The Journey Complete', titleStyle)
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: this.children.getByName('title'),
      alpha: 1,
      duration: 2000,
      delay: 2000
    });

    // Final tease
    const teaseStyle = {
      fontSize: '18px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'italic'
    };

    const tease = this.add.text(
      width / 2,
      height - 200,
      'In the distance, a music box plays...\nA melody that shouldn\'t exist.',
      teaseStyle
    )
      .setOrigin(0.5)
      .setAlign('center')
      .setAlpha(0);

    this.tweens.add({
      targets: tease,
      alpha: 1,
      duration: 2000,
      delay: 8000
    });

    // Add back button
    this.backButton = new BackButton(this, () => {
      this.scene.start('MainMenuScene');
    });

    // Credits button
    this.time.delayedCall(10000, () => {
      this.createButton(width / 2, height - 80, 'Credits', () => {
        this.showCredits();
      });
    });
  }

  showCredits() {
    this.cameras.main.fadeOut(1000, 0, 0, 0);

    this.time.delayedCall(1000, () => {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      // Clear screen
      this.children.removeAll();
      this.add.rectangle(width / 2, height / 2, width, height, 0x000000);

      // Credits
      const creditsStyle = {
        fontSize: '24px',
        fontFamily: 'Courier New',
        color: '#8b5c31',
        align: 'center',
        lineSpacing: 20
      };

      const creditsText = `VERACITY

A Narrative Puzzle Adventure


Created with Phaser 3


Game Design & Story
[Your Name]


Programming
Claude Sonnet 4.5


Playtesting
[Thank you to playtesters]


Special Thanks
All who supported this journey


Made with love and gears
2026`;

      const credits = this.add.text(width / 2, height / 2, creditsText, creditsStyle)
        .setOrigin(0.5)
        .setAlpha(0);

      this.tweens.add({
        targets: credits,
        alpha: 1,
        duration: 2000
      });

      this.cameras.main.fadeIn(1000, 0, 0, 0);

      // Return to menu button
      this.time.delayedCall(5000, () => {
        this.createButton(width / 2, height - 80, 'Return to Menu', () => {
          this.scene.start('MainMenuScene');
        });
      });
    });
  }

  createButton(x, y, text, callback) {
    const button = this.add.rectangle(x, y, 250, 50, 0x333333);
    button.setStrokeStyle(2, 0x8b5c31);

    const buttonText = this.add.text(x, y, text, {
      fontSize: '24px',
      fontFamily: 'Courier New',
      color: '#ffffff'
    }).setOrigin(0.5);

    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      button.setFillStyle(0x8b5c31);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x333333);
    });

    button.on('pointerdown', callback);

    button.setAlpha(0);
    buttonText.setAlpha(0);

    this.tweens.add({
      targets: [button, buttonText],
      alpha: 1,
      duration: 1000
    });

    return { button, buttonText };
  }
}
