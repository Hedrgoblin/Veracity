/**
 * AudioManager - Handles music and sound effects with crossfading
 */
class AudioManager {
  constructor(scene) {
    this.scene = scene;
    this.currentMusic = null;
    this.musicVolume = 0.7;
    this.sfxVolume = 1.0;
    this.fadeDuration = 1000; // milliseconds
    this.soundCache = {};
  }

  // Initialize audio settings from localStorage
  loadSettings() {
    const savedMusicVolume = localStorage.getItem('veracity_music_volume');
    const savedSfxVolume = localStorage.getItem('veracity_sfx_volume');

    if (savedMusicVolume !== null) {
      this.musicVolume = parseFloat(savedMusicVolume);
    }
    if (savedSfxVolume !== null) {
      this.sfxVolume = parseFloat(savedSfxVolume);
    }
  }

  // Save audio settings to localStorage
  saveSettings() {
    localStorage.setItem('veracity_music_volume', this.musicVolume);
    localStorage.setItem('veracity_sfx_volume', this.sfxVolume);
  }

  // Play background music with crossfade
  playMusic(key, loop = true, fadeIn = true) {
    // If same music is already playing, do nothing
    if (this.currentMusic && this.currentMusic.key === key && this.currentMusic.isPlaying) {
      return;
    }

    // Get or create music sound
    let newMusic = this.scene.sound.get(key);
    if (!newMusic) {
      if (!this.scene.cache.audio.exists(key)) {
        console.warn(`Music key "${key}" not found in cache`);
        return;
      }
      newMusic = this.scene.sound.add(key, { loop, volume: 0 });
    }

    // Crossfade from current music to new music
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.fadeOut(this.currentMusic, () => {
        this.currentMusic.stop();
      });
    }

    // Start new music
    newMusic.play();
    if (fadeIn) {
      this.fadeIn(newMusic, this.musicVolume);
    } else {
      newMusic.setVolume(this.musicVolume);
    }

    this.currentMusic = newMusic;
  }

  // Stop current music
  stopMusic(fadeOut = true) {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      if (fadeOut) {
        this.fadeOut(this.currentMusic, () => {
          this.currentMusic.stop();
          this.currentMusic = null;
        });
      } else {
        this.currentMusic.stop();
        this.currentMusic = null;
      }
    }
  }

  // Play sound effect
  playSfx(key, config = {}) {
    if (!this.scene.cache.audio.exists(key)) {
      console.warn(`SFX key "${key}" not found in cache`);
      return null;
    }

    const sound = this.scene.sound.add(key, {
      volume: this.sfxVolume * (config.volume || 1),
      ...config
    });

    sound.play();
    return sound;
  }

  // Fade in audio
  fadeIn(sound, targetVolume, duration = this.fadeDuration) {
    sound.setVolume(0);
    this.scene.tweens.add({
      targets: sound,
      volume: targetVolume,
      duration: duration,
      ease: 'Linear'
    });
  }

  // Fade out audio
  fadeOut(sound, onComplete, duration = this.fadeDuration) {
    this.scene.tweens.add({
      targets: sound,
      volume: 0,
      duration: duration,
      ease: 'Linear',
      onComplete: onComplete
    });
  }

  // Set music volume
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume);
    }
    this.saveSettings();
  }

  // Set SFX volume
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  // Get current volumes
  getVolumes() {
    return {
      music: this.musicVolume,
      sfx: this.sfxVolume
    };
  }

  // Pause all audio
  pauseAll() {
    this.scene.sound.pauseAll();
  }

  // Resume all audio
  resumeAll() {
    this.scene.sound.resumeAll();
  }

  // Stop all audio
  stopAll() {
    this.scene.sound.stopAll();
    this.currentMusic = null;
  }

  // Clean up
  destroy() {
    this.stopAll();
    this.soundCache = {};
  }
}

export default AudioManager;
