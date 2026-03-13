/**
 * BackButton - Reusable back button component
 */

export default class BackButton {
  constructor(scene, onClickCallback) {
    this.scene = scene;
    this.onClickCallback = onClickCallback;

    const buttonWidth = 100;
    const buttonHeight = 40;
    const padding = 15;

    // Create container
    this.container = scene.add.container(padding + buttonWidth / 2, padding + buttonHeight / 2);

    // Button background
    this.background = scene.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x333333, 0.9);
    this.background.setStrokeStyle(2, 0x8b5c31);

    // Button text
    this.text = scene.add.text(0, 0, 'BACK', {
      fontSize: '18px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Add to container
    this.container.add([this.background, this.text]);

    // Make interactive
    this.background.setInteractive({ useHandCursor: true });

    this.background.on('pointerover', () => {
      this.background.setFillStyle(0x8b5c31, 0.9);
      this.text.setColor('#ffffff');
    });

    this.background.on('pointerout', () => {
      this.background.setFillStyle(0x333333, 0.9);
      this.text.setColor('#ffffff');
    });

    this.background.on('pointerdown', () => {
      this.container.setScale(0.95);
    });

    this.background.on('pointerup', () => {
      this.container.setScale(1);
      if (this.onClickCallback) {
        this.onClickCallback();
      }
    });

    // Set depth to be on top
    this.container.setDepth(1000);
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
    }
  }

  setVisible(visible) {
    this.container.setVisible(visible);
  }

  setAlpha(alpha) {
    this.container.setAlpha(alpha);
  }
}
