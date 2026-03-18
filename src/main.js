/**
 * Main entry point for Steampunk Journey
 * Initializes Phaser game and loads all scenes
 */
import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import ChapterScene from './scenes/ChapterScene.js';
import PuzzleScene from './scenes/PuzzleScene.js';
import MazeScene from './scenes/MazeScene.js';
import TrainMapScene from './scenes/TrainMapScene.js';
import GearPuzzleScene from './scenes/GearPuzzleScene.js';
import SettingsScene from './scenes/SettingsScene.js';
import EndingScene from './scenes/EndingScene.js';
import SubscriptionScene from './scenes/SubscriptionScene.js';
import SubscriptionGateScene from './scenes/SubscriptionGateScene.js';

// Game configuration optimized for iPhone 10/X (portrait)
const config = {
  type: Phaser.AUTO,
  width: 375,
  height: 812,
  parent: 'game-container',
  backgroundColor: '#1a1a1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    orientation: Phaser.Scale.PORTRAIT
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    MainMenuScene,
    ChapterScene,
    PuzzleScene,
    MazeScene,
    TrainMapScene,
    GearPuzzleScene,
    SettingsScene,
    EndingScene,
    SubscriptionScene,
    SubscriptionGateScene
  ]
};

// Create game instance
const game = new Phaser.Game(config);

// Add to window for debugging
window.game = game;

// Log game start
console.log('Veracity - Game Started');
console.log('Phaser version:', Phaser.VERSION);
