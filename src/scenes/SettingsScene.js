/**
 * SettingsScene - Settings menu for volume and accessibility
 */
import Phaser from 'phaser';
import AudioManager from '../systems/AudioManager.js';
import BackButton from '../components/BackButton.js';

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Semi-transparent background
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // Settings panel
    const panel = this.add.rectangle(width / 2, height / 2, 600, 500, 0x1a1a1a);
    panel.setStrokeStyle(3, 0x8b5c31);

    // Title
    const title = this.add.text(width / 2, height / 2 - 200, 'Settings', {
      fontSize: '36px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Load current volumes
    const musicVolume = parseFloat(localStorage.getItem('veracity_music_volume') || '0.7');
    const sfxVolume = parseFloat(localStorage.getItem('veracity_sfx_volume') || '1.0');

    // Music volume control
    this.add.text(width / 2 - 200, height / 2 - 100, 'Music Volume:', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#ffffff'
    });

    const musicSlider = this.createSlider(width / 2, height / 2 - 60, musicVolume, (value) => {
      localStorage.setItem('veracity_music_volume', value);
    });

    // SFX volume control
    this.add.text(width / 2 - 200, height / 2, 'SFX Volume:', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#ffffff'
    });

    const sfxSlider = this.createSlider(width / 2, height / 2 + 40, sfxVolume, (value) => {
      localStorage.setItem('veracity_sfx_volume', value);
    });

    // Back button using component
    this.backButton = new BackButton(this, () => {
      this.scene.resume('MainMenuScene');
      this.scene.stop();
    });

    // Also add a centered close button for mobile accessibility
    this.createButton(width / 2, height / 2 + 180, 'Close', () => {
      this.scene.resume('MainMenuScene');
      this.scene.stop();
    });
  }

  createSlider(x, y, initialValue, onChange) {
    const sliderWidth = 300;
    const sliderHeight = 10;

    // Slider background
    const bg = this.add.rectangle(x, y, sliderWidth, sliderHeight, 0x333333);

    // Slider fill
    const fill = this.add.rectangle(
      x - sliderWidth / 2,
      y,
      sliderWidth * initialValue,
      sliderHeight,
      0x8b5c31
    );
    fill.setOrigin(0, 0.5);

    // Slider handle
    const handle = this.add.circle(
      x - sliderWidth / 2 + sliderWidth * initialValue,
      y,
      15,
      0xffd700
    );
    handle.setStrokeStyle(2, 0x8b5c31);
    handle.setInteractive({ useHandCursor: true, draggable: true });

    // Value text
    const valueText = this.add.text(x + sliderWidth / 2 + 30, y, `${Math.round(initialValue * 100)}%`, {
      fontSize: '18px',
      fontFamily: 'Courier New',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    // Handle drag
    handle.on('drag', (pointer) => {
      const localX = pointer.x;
      const minX = x - sliderWidth / 2;
      const maxX = x + sliderWidth / 2;

      if (localX >= minX && localX <= maxX) {
        handle.x = localX;
        const value = (localX - minX) / sliderWidth;
        fill.width = sliderWidth * value;
        valueText.setText(`${Math.round(value * 100)}%`);

        if (onChange) {
          onChange(value);
        }
      }
    });

    return { bg, fill, handle, valueText };
  }

  createButton(x, y, text, callback) {
    const button = this.add.rectangle(x, y, 200, 50, 0x333333);
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

    return { button, buttonText };
  }
}
