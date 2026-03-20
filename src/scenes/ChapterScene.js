/**
 * ChapterScene - Main gameplay scene for narrative and interaction
 */
import Phaser from 'phaser';
import chapterManager from '../systems/ChapterManager.js';
import gameStateManager from '../systems/GameStateManager.js';
import saveManager from '../systems/SaveManager.js';
import AudioManager from '../systems/AudioManager.js';
import BackButton from '../components/BackButton.js';

const BASE = import.meta.env.BASE_URL;

// Available expressions per character variant (only what actually exists as files)
const CHARACTER_EXPRESSIONS = {
  'addie_clockworker': ['angry','confused','disgusted','distrust','excited','grateful','happy','neutral','outraged','sad','scared','serious','smirk','surprised','thinking','worried'],
  'addie_default':     ['angry','confused','disgusted','distrust','excited','grateful','happy','neutral','outraged','sad','scared','serious','smirk','surprised','thinking','worried'],
  'addie_home':        ['angry','confused','disgusted','distrust','excited','grateful','happy','neutral','outraged','sad','scared','serious','smirk','surprised','thinking','worried'],
  'crone_default':     ['disgusted','happy','neutral','sad','smirk','surprised','thinking'],
  'cultist_bookkeeper':['angry','disgusted','happy','neutral','sad','smirk','surprised','thinking'],
  'cultist_enforcer':  ['angry','disgusted','happy','neutral','sad','smirk','surprised','thinking'],
  'cultist_guard':     ['angry','disgusted','happy','neutral','sad','smirk','surprised','thinking'],
  'cultist_guard_staff':['angry','disgusted','happy','neutral','sad','smirk','surprised','thinking'],
  'da_default':        ['angry','disgusted','happy','neutral','sad','smirk','surprised','thinking'],
  'da_lab':            ['angry','disgusted','happy','neutral','sad','smirk','surprised','thinking'],
  'da_moth':           ['angry','disgusted','happy','neutral','sad','smirk','surprised','thinking'],
  'gentleman_paper':   ['angry','disgusted','happy','neutral','sad','smirk','surprised','thinking'],
  'guildmaster':       ['angry','confused','disgusted','distrust','excited','grateful','happy','neutral','outraged','sad','scared','serious','smirk','surprised','thinking','worried'],
  'guildmaster_black': ['angry','confused','disgusted','distrust','excited','grateful','happy','neutral','outraged','sad','scared','serious','smirk','surprised','thinking','worried'],
  'rainie_clockworker':['angry','confused','disgusted','distrust','excited','grateful','happy','neutral','outraged','sad','scared','serious','smirk','surprised','thinking','worried'],
  'rainie_default':    ['angry','confused','disgusted','distrust','excited','grateful','happy','neutral','outraged','sad','scared','serious','smirk','surprised','thinking','worried'],
  'rainie_pajamas':    ['angry','confused','disgusted','distrust','excited','grateful','happy','neutral','outraged','sad','scared','serious','smirk','surprised','thinking','worried'],
  'vera_clockworker':  ['angry','confused','disgusted','distrust','excited','grateful','happy','neutral','outraged','sad','scared','serious','smirk','surprised','thinking','worried'],
  'vera_default':      ['angry','confused','disgusted','distrust','excited','grateful','happy','neutral','outraged','sad','scared','serious','smirk','surprised','thinking','worried'],
  'vera_green':        ['angry','confused','disgusted','distrust','excited','grateful','happy','neutral','outraged','sad','scared','serious','smirk','surprised','thinking','worried'],
  'vera_pajamas':      ['angry','confused','disgusted','distrust','excited','grateful','happy','neutral','outraged','sad','scared','serious','smirk','surprised','thinking','worried'],
};

export default class ChapterScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChapterScene' });
  }

  init(data) {
    console.log('[ChapterScene.init] chapterNumber:', data?.chapterNumber, '| stack:', new Error().stack.split('\n').slice(1, 5).join(' | '));
    this.chapterNumber = data.chapterNumber || 1;
    this.chapterData = null;
    this.currentDialogueIndex = 0;
    this.audioManager = new AudioManager(this);
    this.teaPuzzleCompleted = false; // Track if tea puzzle has been done
    this.gearPuzzleDone = false;
    this.mothPuzzleDone = false;
    this.midpointShown = false;
    this.deskPuzzleCompleted = false;
    this.characterFolders = {}; // Will be populated in preload

    // Clear cached chapter data to ensure fresh JSON is used (avoids stale characterFolders)
    chapterManager.clearCache();

    // Check subscription for chapters 3+
    if (this.chapterNumber >= 3 && !gameStateManager.isSubscribed()) {
      // Show subscription gate instead
      this.scene.start('SubscriptionGateScene', { nextChapter: this.chapterNumber });
      return;
    }
  }

  preload() {
    // Show loading text during preload
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.loadingText = this.add.text(width / 2, height / 2, 'Loading Chapter...', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#8b5c31'
    }).setOrigin(0.5);

    // Preload common backgrounds
    const backgrounds = [
      'home_hallway_day',
      'home_office_day',
      'home_office_ransacked_day',
      'home_office_ransacked_day_revealed',
      'home_office_safe_closed',
      'home_office_safe_open',
      'london_alley',
      'clockmakers_guild_door',
      'clockmakers_guild_hall_01',
      'clockmakers_guild_hall_01_hide',
      'clockmakers_guild_hall_02',
      'clockmakers_guild_maproom',
      'northern_sanctuary_ext',
      'northern_sanctuary_hallway',
      'northern_sanctuary_hallway_02',
      'northern_sanctuary_hallway_02_alarm',
      'northern_sanctuary_hallway_02_armed',
      'northern_sanctuary_library_small',
      'ill_power_01',
      'ill_essense',
      'ill_addie_growl_01',
      'home_bedroom_vera',
      'home_lab',
      'home_solarium',
      'northern_sanctuary_device',
      'northern_sanctuary_device_broken',
      'northern_sanctuary_service_entrance',
      'train_carraige',
      'train_ext',
      'puzzle_gear_clockmakers_01'
    ];

    backgrounds.forEach(bg => {
      if (!this.textures.exists(bg)) {
        this.load.image(bg, `${BASE}assets/images/backgrounds/${bg}.png`);
      }
    });

    // Load chapter JSON first, then load only the character variants needed for this chapter
    const chapterKey = `chapter_${String(this.chapterNumber).padStart(2, '0')}_data`;
    // Remove stale cached JSON so fresh data is fetched
    if (this.cache.json.has(chapterKey)) {
      this.cache.json.remove(chapterKey);
    }
    this.load.json(chapterKey, `${BASE}data/chapters/chapter_${String(this.chapterNumber).padStart(2, '0')}.json`);

    this.load.once(`filecomplete-json-${chapterKey}`, () => {
      const chapterJson = this.cache.json.get(chapterKey);
      if (chapterJson) {
        this.loadChapterCharacters(chapterJson);
      }
    });

    // Load items
    this.loadItems();

    console.log(`Preload: Loading character assets for chapter ${this.chapterNumber}`);
  }

  loadItems() {
    // Load items that appear in dialogue
    const items = ['notebook_01', 'lide_compass', 'moth', 'note_dear_vera_02'];

    items.forEach(itemName => {
      const itemKey = itemName;
      if (!this.textures.exists(itemKey)) {
        this.load.image(itemKey, `${BASE}assets/images/items/${itemName}.png`);
        this.load.once(`filecomplete-image-${itemKey}`, () => {
          console.log(`✓ Loaded item: ${itemKey}`);
        });
        this.load.once(`loaderror-image-${itemKey}`, () => {
          console.log(`✗ Item not found: ${itemKey}`);
        });
      }
    });
  }

  loadChapterCharacters(chapterJson) {
    const characters = chapterJson.assets?.characters || [];
    const folders = chapterJson.assets?.characterFolders || {};
    const companions = chapterJson.companions || [];

    // Vera — always present, use the chapter's variant (or default)
    const veraVariant = folders.vera || 'vera_default';
    this.loadCharacterImagesWithPrefix(veraVariant, veraVariant);

    // Addie
    if (companions.includes('addie') || characters.includes('addie')) {
      const addieVariant = folders.addie || 'addie_default';
      this.loadCharacterImagesWithPrefix(addieVariant, addieVariant);
    }

    // Rainie
    if (companions.includes('rainie') || characters.includes('rainie')) {
      const rainieVariant = folders.rainie || 'rainie_default';
      this.loadCharacterImagesWithPrefix(rainieVariant, rainieVariant);
    }

    // Closing character folder swaps (e.g. costume changes mid-chapter)
    const closingFolders = chapterJson.assets?.closingCharacterFolders || {};
    if (closingFolders.vera) this.loadCharacterImagesWithPrefix(closingFolders.vera, closingFolders.vera);
    if (closingFolders.addie) this.loadCharacterImagesWithPrefix(closingFolders.addie, closingFolders.addie);
    if (closingFolders.rainie) this.loadCharacterImagesWithPrefix(closingFolders.rainie, closingFolders.rainie);

    // NPCs — load by character ID (maps directly to folder/file prefix)
    const npcs = ['crone_default', 'cultist_bookkeeper', 'cultist_enforcer', 'cultist_guard', 'cultist_guard_staff',
                  'gentleman_paper', 'da_default', 'da_moth', 'da_lab', 'guildmaster', 'guildmaster_black'];
    npcs.forEach(npcId => {
      if (characters.includes(npcId)) {
        this.loadCharacterImagesWithPrefix(npcId, npcId);
      }
    });

    console.log(`Preload: Loaded characters for chapter ${this.chapterNumber}:`, { veraVariant, companions, npcs: npcs.filter(n => characters.includes(n)) });
  }

  loadCharacterImages(characterName, folderName = null) {
    // Load body and expressions from character subfolder
    const folder = folderName || characterName;
    const filePrefix = folder; // Use folder name for filenames
    const basePath = `${BASE}assets/images/characters/${folder}`;

    // Load body
    const bodyKey = `${characterName}_body`;
    const bodyFile = `${filePrefix}_body.png`;
    if (!this.textures.exists(bodyKey)) {
      this.load.image(bodyKey, `${basePath}/${bodyFile}`);
      this.load.once(`filecomplete-image-${bodyKey}`, () => {
        console.log(`✓ Loaded: ${bodyKey} from ${folder}/${bodyFile}`);
      });
      this.load.once(`loaderror-image-${bodyKey}`, () => {
        console.log(`✗ Not found: ${bodyKey} (using placeholder)`);
      });
    }

    // Load expressions (only log errors, don't fail)
    const expressions = CHARACTER_EXPRESSIONS[folder] || ['neutral', 'happy', 'sad', 'angry', 'disgusted', 'surprised', 'smirk', 'thinking'];
    expressions.forEach(expr => {
      const key = `${characterName}_${expr}`;
      const file = `${filePrefix}_${expr}.png`;
      if (!this.textures.exists(key)) {
        this.load.image(key, `${basePath}/${file}`);
        this.load.once(`filecomplete-image-${key}`, () => {
          console.log(`✓ Loaded: ${key} from ${folder}/${file}`);
        });
        this.load.once(`loaderror-image-${key}`, () => {
          // Silent fail - optional expressions
        });
      }
    });

    console.log(`Loading character images for: ${characterName} from folder: ${folder}`);
  }

  loadCharacterImagesWithPrefix(texturePrefix, folderName) {
    // Load with custom texture key prefix (for variants like addie_home)
    const basePath = `${BASE}assets/images/characters/${folderName}`;
    const filePrefix = folderName; // Files are named with the full folder name (e.g., addie_home_body.png)

    // Load body
    const bodyKey = `${texturePrefix}_body`;
    const bodyFile = `${filePrefix}_body.png`;
    this.load.image(bodyKey, `${basePath}/${bodyFile}`);
    this.load.once(`filecomplete-image-${bodyKey}`, () => {
      console.log(`✓ Loaded: ${bodyKey} from ${folderName}/${bodyFile}`);
    });
    this.load.once(`loaderror-image-${bodyKey}`, () => {
      console.log(`✗ Not found: ${bodyKey}`);
    });

    // Load expressions
    const expressions = CHARACTER_EXPRESSIONS[folderName] || ['neutral', 'happy', 'sad', 'angry', 'disgusted', 'surprised', 'smirk', 'thinking'];
    expressions.forEach(expr => {
      const key = `${texturePrefix}_${expr}`;
      const file = `${filePrefix}_${expr}.png`;
      this.load.image(key, `${basePath}/${file}`);
      this.load.once(`filecomplete-image-${key}`, () => {
        console.log(`✓ Loaded: ${key} from ${folderName}/${file}`);
      });
      this.load.once(`loaderror-image-${key}`, () => {
        // Silent fail
      });
    });

    console.log(`Loading variant images: ${texturePrefix} from folder: ${folderName}`);
  }

  create() {
    // Load audio settings
    this.audioManager.loadSettings();

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Update loading text if it exists
    if (this.loadingText) {
      this.loadingText.setText('Loading Chapter...');
    }

    // Load chapter data asynchronously
    chapterManager.loadChapter(this.chapterNumber).then(chapterData => {
      this.chapterData = chapterData;

      if (!this.chapterData) {
        console.error(`Failed to load chapter ${this.chapterNumber}`);
        this.scene.start('MainMenuScene');
        return;
      }

      console.log(`Chapter ${this.chapterNumber}: ${this.chapterData.title}`);

      // Remove loading text
      if (this.loadingText) {
        this.loadingText.destroy();
      }

      // Set up the scene
      this.setupBackground();
      this.setupCharacters();
      this.setupUI();
      this.setupBackButton();
      this.setupJumpMenu(); // DEBUG: Remove this later

      // Play chapter music
      if (this.chapterData.assets && this.chapterData.assets.music) {
        this.audioManager.playMusic(this.chapterData.assets.music);
      }

      // Show chapter title card immediately (covers background/characters), then start narrative on dismiss
      this.showChapterTitle(() => this.startNarrative());
    }).catch(error => {
      console.error('Error loading chapter:', error);
      this.loadingText.setText('Failed to load chapter. Returning to menu...');
      this.time.delayedCall(2000, () => {
        this.scene.start('MainMenuScene');
      });
    });
  }

  setupBackground() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Use chapter background or placeholder
    const bgKey = this.chapterData.assets?.background || 'placeholder_bg';

    // Check if texture exists before using it
    if (this.textures.exists(bgKey)) {
      this.backgroundImage = this.add.image(width / 2, height / 2, bgKey);
      // Scale to fit screen if needed
      const scaleX = width / this.backgroundImage.width;
      const scaleY = height / this.backgroundImage.height;
      const scale = Math.max(scaleX, scaleY);
      this.backgroundImage.setScale(scale);
      console.log(`Background '${bgKey}' loaded successfully`);
    } else {
      console.warn(`Background '${bgKey}' not found, using fallback`);
      // Create a simple colored background as fallback
      this.backgroundImage = this.add.rectangle(width / 2, height / 2, width, height, 0x2a3a4a);
    }

    // Add vignette effect
    const vignette = this.add.graphics();
    vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0.3, 0.3, 0);
    vignette.fillRect(0, 0, width, height);
  }

  setupCharacters() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Destroy any existing character objects (safety cleanup in case of unexpected re-entry)
    if (this.characters) {
      const destroyed = new Set();
      Object.values(this.characters).forEach(char => {
        if (char && !destroyed.has(char) && typeof char.destroy === 'function') {
          char.destroy();
          destroyed.add(char);
        }
      });
    }

    this.characters = {};
    this.characterExpressions = {};

    // Character scale for mobile
    const charScale = 0.299;    // Vera: 500px tall
    const addieScale = 0.358;   // Addie: 600px tall (600 / 1674 = 0.358)
    const rainieScale = 0.239;  // Rainie: 400px tall (400 / 1674 = 0.239)

    // Dialogue box position (top of dialogue box)
    const dialogueBoxTop = height - 190;

    // Character sprite height and positioning (moved down 90px from dialogue box)
    const charHeight = 1674;
    const verticalOffset = 90; // Move characters down 90px
    const girlY = dialogueBoxTop - (charHeight * charScale / 2) + verticalOffset;
    const addieY = dialogueBoxTop - (charHeight * addieScale / 2) + verticalOffset;
    const rainieY = dialogueBoxTop - (charHeight * rainieScale / 2) + verticalOffset;

    // Track which companions have been introduced
    this.companionIntroduced = {
      addie: false,
      rainie: false
    };

    // Determine which Vera variant to use
    const veraVariant = this.chapterData.assets?.characterFolders?.vera || 'vera_default';
    const veraBodyKey = `${veraVariant}_body`;
    const veraNeutralKey = `${veraVariant}_neutral`;

    if (this.textures.exists(veraBodyKey)) {
      this.characters.vera_body = this.add.image(width / 2, girlY, veraBodyKey)
        .setScale(charScale)
        .setAlpha(0)
        .setDepth(10);
      if (this.textures.exists(veraNeutralKey)) {
        this.characters.vera_expression = this.add.image(width / 2, girlY, veraNeutralKey)
          .setScale(charScale)
          .setAlpha(0)
          .setDepth(11);
      }
      this.characters.vera = this.characters.vera_body;
    } else {
      console.warn(`✗ Vera graphics not found for variant: ${veraVariant}`);
      const placeholder = this.add.circle(width / 2, girlY, 75, 0x8b5c31)
        .setAlpha(0).setDepth(10);
      this.characters.vera = placeholder;
    }

    // Add companions if present in chapter
    if (this.chapterData.companions?.includes('addie')) {
      const addieTargetX = width / 2 - 75; // Final position (15px right from -90)
      const addieX = -200; // Start off-screen left
      this.addieTargetX = addieTargetX; // Store target position

      // Determine which Addie variant to use
      const addieVariant = this.chapterData.assets?.characterFolders?.addie || 'addie_default';
      const addieBodyKey = `${addieVariant}_body`;
      const addieNeutralKey = `${addieVariant}_neutral`;

      if (this.textures.exists(addieBodyKey)) {
        this.characters.addie_body = this.add.image(addieX, addieY, addieBodyKey)
          .setScale(addieScale)
          .setAlpha(0)
          .setDepth(5); // Addie behind Vera

        if (this.textures.exists(addieNeutralKey)) {
          this.characters.addie_expression = this.add.image(addieX, addieY, addieNeutralKey)
            .setScale(addieScale)
            .setAlpha(0)
            .setDepth(5);
        }

        this.characters.addie = this.characters.addie_body;
      } else {
        console.warn(`✗ Addie graphics not found for variant: ${addieVariant}`);
        const placeholder = this.add.circle(addieX, addieY, 50, 0x8b5c31)
          .setAlpha(0).setDepth(5);
        this.characters.addie = placeholder;
      }
    }

    if (this.chapterData.companions?.includes('rainie')) {
      const rainieTargetX = width / 2 + 90; // Final position
      const rainieX = width + 200; // Start off-screen right
      this.rainieTargetX = rainieTargetX; // Store target position

      // Determine which Rainie variant to use
      const rainieVariant = this.chapterData.assets?.characterFolders?.rainie || 'rainie_default';
      const rainieBodyKey = `${rainieVariant}_body`;
      const rainieNeutralKey = `${rainieVariant}_neutral`;

      if (this.textures.exists(rainieBodyKey)) {
        this.characters.rainie_body = this.add.image(rainieX, rainieY, rainieBodyKey)
          .setScale(rainieScale)
          .setAlpha(0)
          .setDepth(15); // Rainie in front

        if (this.textures.exists(rainieNeutralKey)) {
          this.characters.rainie_expression = this.add.image(rainieX, rainieY, rainieNeutralKey)
            .setScale(rainieScale)
            .setAlpha(0)
            .setDepth(15);
        }

        this.characters.rainie = this.characters.rainie_body;
      } else {
        console.warn(`✗ Rainie graphics not found for variant: ${rainieVariant}`);
        const placeholder = this.add.circle(rainieX, rainieY, 50, 0x8b5c31)
          .setAlpha(0).setDepth(15);
        this.characters.rainie = placeholder;
      }
    }

    // Crone (if in chapter assets)
    if (this.chapterData.assets?.characters?.includes('crone_default')) {
      const croneScale = 0.359;
      const croneX = width / 2;
      const croneY = girlY;

      if (this.textures.exists('crone_default_body')) {
        this.characters.crone_body = this.add.image(croneX, croneY, 'crone_default_body')
          .setScale(croneScale)
          .setAlpha(0)
          .setDepth(12)
          .setFlipX(true);

        if (this.textures.exists('crone_default_neutral')) {
          this.characters.crone_expression = this.add.image(croneX, croneY, 'crone_default_neutral')
            .setScale(croneScale)
            .setAlpha(0)
            .setDepth(12)
            .setFlipX(true);
        }

        this.characters.crone = this.characters.crone_body;
      } else {
        console.warn('✗ Crone graphics not found - using placeholder');
        const placeholder = this.add.circle(croneX, croneY, 75, 0x8b4513)
          .setAlpha(0).setDepth(12);
        this.characters.crone = placeholder;
      }
    }

    // Other NPCs (cultists, gentleman, da, guildmaster, etc.)
    const npcs = ['cultist_bookkeeper', 'cultist_enforcer', 'cultist_guard', 'cultist_guard_staff', 'gentleman_paper', 'da_default', 'da_moth', 'da_lab', 'guildmaster', 'guildmaster_black'];
    const npcPositions = {
      'cultist_enforcer': width * 0.40,
      'cultist_bookkeeper': width * 0.65,
      'gentleman_paper': width / 2 + 30,
      'cultist_guard': width * 0.20,
      'cultist_guard_staff': width * 0.50,
      'guildmaster': width * 0.69,
      'guildmaster_black': width * 0.69,
    };
    const npcScales = {
      'gentleman_paper': 0.299 * 1.12 * 1.20,
      'da_default': 0.299 * 1.12 * 1.20,
      'da_moth': 0.299 * 1.12 * 1.20,
      'da_lab': 0.299 * 1.12 * 1.20,
      'cultist_enforcer': 0.359,
      'cultist_bookkeeper': 0.359,
      'cultist_guard': 0.299 * 1.20,
      'cultist_guard_staff': 0.420,
      'guildmaster': 0.299 * 1.20,
      'guildmaster_black': 0.299 * 1.20,
    };
    const npcFlipX = {
      'guildmaster': true,
      'guildmaster_black': true,
    };
    npcs.forEach(npcName => {
      if (this.chapterData.assets?.characters?.includes(npcName)) {
        const npcScale = npcScales[npcName] ?? 0.299;
        const npcX = npcPositions[npcName] ?? width / 2;
        const npcY = girlY;
        const flipX = npcFlipX[npcName] ?? false;

        if (this.textures.exists(`${npcName}_body`)) {
          this.characters[`${npcName}_body`] = this.add.image(npcX, npcY, `${npcName}_body`)
            .setScale(npcScale)
            .setFlipX(flipX)
            .setAlpha(0)
            .setDepth(12);

          if (this.textures.exists(`${npcName}_neutral`)) {
            this.characters[`${npcName}_expression`] = this.add.image(npcX, npcY, `${npcName}_neutral`)
              .setScale(npcScale)
              .setFlipX(flipX)
              .setAlpha(0)
              .setDepth(12);
          }

          this.characters[npcName] = this.characters[`${npcName}_body`];
        } else {
          console.warn(`✗ ${npcName} graphics not found - using placeholder`);
          const placeholder = this.add.circle(npcX, npcY, 75, 0x666666)
            .setAlpha(0).setDepth(12);
          this.characters[npcName] = placeholder;
        }
      }
    });

    // Fade in companion/vera characters only — NPCs appear via showCharacters in dialogue
    // Skip auto-show if chapter sets suppressAutoShow (characters appear only via dialogue)
    if (!this.chapterData.assets?.suppressAutoShow) {
      const autoShowKeys = ['vera_body', 'vera_expression', 'vera',
                            'addie_body', 'addie_expression', 'addie',
                            'rainie_body', 'rainie_expression', 'rainie'];
      Object.keys(this.characters).forEach(key => {
        if (autoShowKeys.includes(key)) {
          const char = this.characters[key];
          this.tweens.add({
            targets: char,
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
          });
        }
      });
    }
  }

  changeBackground(newBackgroundKey) {
    // Cancel any running flash animation
    if (typeof this._cancelFlash === 'function') {
      this._cancelFlash();
      this._cancelFlash = null;
    }

    if (!this.textures.exists(newBackgroundKey)) {
      console.warn(`Background '${newBackgroundKey}' not found`);
      return;
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    console.log(`Changing background to: ${newBackgroundKey}`);

    // Create new background image
    const newBg = this.add.image(width / 2, height / 2, newBackgroundKey);
    const scaleX = width / newBg.width;
    const scaleY = height / newBg.height;
    const scale = Math.max(scaleX, scaleY);
    newBg.setScale(scale);
    newBg.setAlpha(0); // Start transparent
    newBg.setDepth(-1); // Behind everything

    // Fade out old background, fade in new
    this.tweens.add({
      targets: this.backgroundImage,
      alpha: 0,
      duration: 800,
      ease: 'Cubic.inOut'
    });

    this.tweens.add({
      targets: newBg,
      alpha: 1,
      duration: 800,
      ease: 'Cubic.inOut',
      onComplete: () => {
        // Remove old background
        if (this.backgroundImage) {
          this.backgroundImage.destroy();
        }
        this.backgroundImage = newBg;
      }
    });
  }

  flashBackground(bgA, bgB, count, interval, onComplete) {
    // Cancel any previously running flash
    this._cancelFlash = true;
    let cancelled = false;
    this._cancelFlash = () => { cancelled = true; };

    let current = 0;
    const total = count * 2;
    const step = () => {
      if (cancelled) return;
      const key = current % 2 === 0 ? bgB : bgA;
      if (this.textures.exists(key)) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const newBg = this.add.image(width / 2, height / 2, key);
        const scale = Math.max(width / newBg.width, height / newBg.height);
        newBg.setScale(scale).setDepth(-1);
        if (this.backgroundImage) this.backgroundImage.destroy();
        this.backgroundImage = newBg;
      }
      current++;
      if (current < total) {
        this.time.delayedCall(interval, step);
      } else {
        // Settle on bgB (alarm background) at the end
        if (!cancelled && this.textures.exists(bgB)) {
          const width = this.cameras.main.width;
          const height = this.cameras.main.height;
          const finalBg = this.add.image(width / 2, height / 2, bgB);
          const scale = Math.max(width / finalBg.width, height / finalBg.height);
          finalBg.setScale(scale).setDepth(-1);
          if (this.backgroundImage) this.backgroundImage.destroy();
          this.backgroundImage = finalBg;
        }
        if (onComplete) onComplete();
      }
    };
    step();
  }

  introduceCompanion(companion) {
    if (this.companionIntroduced[companion]) return;

    this.companionIntroduced[companion] = true;
    console.log(`Introducing ${companion} with slide-in animation`);

    if (companion === 'addie') {
      const targetX = this.addieTargetX;

      // Animate body
      if (this.characters.addie_body) {
        this.tweens.add({
          targets: this.characters.addie_body,
          x: targetX,
          duration: 800,
          ease: 'Cubic.out'
        });
      }

      // Animate expression
      if (this.characters.addie_expression) {
        this.tweens.add({
          targets: this.characters.addie_expression,
          x: targetX,
          duration: 800,
          ease: 'Cubic.out'
        });
      }

    } else if (companion === 'rainie') {
      const targetX = this.rainieTargetX;

      // Animate body
      if (this.characters.rainie_body) {
        this.tweens.add({
          targets: this.characters.rainie_body,
          x: targetX,
          duration: 800,
          ease: 'Cubic.out'
        });
      }

      // Animate expression
      if (this.characters.rainie_expression) {
        this.tweens.add({
          targets: this.characters.rainie_expression,
          x: targetX,
          duration: 800,
          ease: 'Cubic.out'
        });
      }

    }
  }

  hideAllCharacters() {
    // Hide all character sprites with fade out
    Object.values(this.characters).forEach(char => {
      if (char && char.alpha !== undefined) {
        this.tweens.add({
          targets: char,
          alpha: 0,
          duration: 400,
          ease: 'Linear'
        });
      }
    });
  }

  showAllCharacters() {
    // Show all character sprites with fade in and restore original scale
    Object.keys(this.characters).forEach(key => {
      const char = this.characters[key];
      if (char && char.alpha !== undefined) {
        const tweenConfig = {
          targets: char,
          alpha: 1,
          duration: 400,
          ease: 'Linear'
        };

        // If this is Vera and she was scaled up, scale BOTH layers back to original
        if (key.startsWith('vera_') && char.getData('originalScale')) {
          const originalScale = char.getData('originalScale');
          tweenConfig.scaleX = originalScale;
          tweenConfig.scaleY = originalScale;
        }

        this.tweens.add(tweenConfig);
      }
    });
  }

  hideCharacter(charName) {
    // Hide a specific character (body and expression layers)
    const bodyKey = `${charName}_body`;
    const expressionKey = `${charName}_expression`;

    [bodyKey, expressionKey, charName].forEach(key => {
      if (this.characters[key]) {
        this.tweens.add({
          targets: this.characters[key],
          alpha: 0,
          duration: 400,
          ease: 'Linear'
        });
      }
    });
  }

  showCharacter(charName) {
    // Show a specific character (body and expression layers)
    const bodyKey = `${charName}_body`;
    const expressionKey = `${charName}_expression`;

    console.log(`Showing character: ${charName}`);
    let shown = false;

    [bodyKey, expressionKey, charName].forEach(key => {
      if (this.characters[key]) {
        console.log(`  - Showing ${key}`);
        this.tweens.add({
          targets: this.characters[key],
          alpha: 1,
          duration: 400,
          ease: 'Linear'
        });
        shown = true;
      }
    });

    if (!shown) {
      console.warn(`  - No character found for ${charName}`);
    }
  }

  moveCharacterToX(charName, targetX) {
    [`${charName}_body`, `${charName}_expression`].forEach(key => {
      const sprite = this.characters[key];
      if (sprite && sprite.x !== undefined) {
        this.tweens.add({
          targets: sprite,
          x: targetX,
          duration: 600,
          ease: 'Cubic.out'
        });
      }
    });
  }

  showOnlyVera() {
    // Show only Vera at normal size, hide companions
    Object.keys(this.characters).forEach(key => {
      const char = this.characters[key];
      if (char && char.alpha !== undefined) {
        // Show Vera layers at normal size
        if (key === 'vera_body' || key === 'vera_expression') {
          this.tweens.add({
            targets: char,
            alpha: 1,
            duration: 400,
            ease: 'Linear'
          });
        }
        // Hide companions
        else if (key === 'addie_body' || key === 'addie_expression' ||
                 key === 'rainie_body' || key === 'rainie_expression') {
          this.tweens.add({
            targets: char,
            alpha: 0,
            duration: 400,
            ease: 'Linear'
          });
        }
      }
    });
  }

  ensureSpeakerVisible(speaker) {
    // Make sure the speaking character is visible
    // Map speaker names to character key prefixes
    const speakerMap = {
      'veracity': 'vera_',
      'vera': 'vera_',
      'addie': 'addie',
      'rainie': 'rainie',
      'crone': 'crone_default',
      'cultist_bookkeeper': 'cultist_bookkeeper',
      'cultist_enforcer': 'cultist_enforcer',
      'enforcer': 'cultist_enforcer',
      'cultist_bookkeeper': 'cultist_bookkeeper',
      'book keeper': 'cultist_bookkeeper',
      'cultist_guard_staff': 'cultist_guard_staff',
      'cultist 1': 'cultist_enforcer',
      'cultist 2': 'cultist_bookkeeper',
      'cultist': 'cultist_enforcer',
      'guard': 'cultist_guard_staff',
      'gentleman': 'gentleman_paper',
      'gentleman_paper': 'gentleman_paper',
      'father': 'da_default',
      'da': 'da_default',
      'da_moth': 'da_moth',
      'da_lab': 'da_lab',
      'guildmaster': 'guildmaster',
      'guildmaster_black': 'guildmaster_black',
      'grand architect': 'guildmaster',
      'old woman': 'crone_default'
    };

    let prefix = speakerMap[speaker];
    if (!prefix) return;
    // If mapped to 'guildmaster' but only guildmaster_black is loaded, use that instead
    if (prefix === 'guildmaster' && !this.characters['guildmaster_body'] && this.characters['guildmaster_black_body']) {
      prefix = 'guildmaster_black';
    }

    // Find and show the character
    Object.keys(this.characters).forEach(key => {
      if (key.startsWith(prefix)) {
        const char = this.characters[key];
        if (char && char.alpha !== undefined && char.alpha < 1) {
          // Character is hidden, show them
          this.tweens.add({
            targets: char,
            alpha: 1,
            duration: 400,
            ease: 'Linear'
          });
        }
      }
    });
  }

  // Method to change character expression
  setCharacterExpression(character, expression) {
    // Map variant folder names back to base character names
    // (chapter JSON may use "addie_home" instead of "addie" in expression keys)
    const variantToBase = {};
    if (this.chapterData?.assets?.characterFolders) {
      Object.entries(this.chapterData.assets.characterFolders).forEach(([base, variant]) => {
        variantToBase[variant] = base;
      });
    }
    const baseCharacter = variantToBase[character] || character;
    const defaultVariant = this.textures.exists(`${baseCharacter}_default_body`) ? `${baseCharacter}_default` : baseCharacter;
    const characterVariant = this.chapterData.assets?.characterFolders?.[baseCharacter] || defaultVariant;
    const expressionKey = `${characterVariant}_${expression}`;
    const expressionSprite = this.characters[`${baseCharacter}_expression`];

    if (expressionSprite && this.textures.exists(expressionKey)) {
      expressionSprite.setTexture(expressionKey);
    } else {
      console.warn(`✗ Expression texture not found: ${expressionKey}`);
    }
  }

  swapCharacterOutfits(newFolders) {
    Object.entries(newFolders).forEach(([baseName, newVariant]) => {
      // Swap body texture
      const bodySprite = this.characters[`${baseName}_body`];
      if (bodySprite && this.textures.exists(`${newVariant}_body`)) {
        bodySprite.setTexture(`${newVariant}_body`);
      }
      // Swap expression texture back to neutral for the new outfit
      const exprSprite = this.characters[`${baseName}_expression`];
      if (exprSprite && this.textures.exists(`${newVariant}_neutral`)) {
        exprSprite.setTexture(`${newVariant}_neutral`);
      }
      // Update characterFolders so future setCharacterExpression calls use the new variant
      if (this.chapterData.assets.characterFolders) {
        this.chapterData.assets.characterFolders[baseName] = newVariant;
      }
    });
  }

  showItem(itemKey) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Hide any existing item first
    if (this.currentItem) {
      this.currentItem.destroy();
      this.currentItem = null;
    }

    // Remove any existing item overlay
    if (this.itemOverlay) {
      this.itemOverlay.destroy();
      this.itemOverlay = null;
    }

    // Check if item texture exists
    if (!this.textures.exists(itemKey)) {
      console.log(`Item texture not found: ${itemKey}`);
      return;
    }

    // Check if this is the compass (special positioning but still dims/hides)
    const isCompass = itemKey === 'lide_compass';

    // Hide all characters
    this.hideAllCharacters();

    // Create dimmed overlay behind the item
    this.itemOverlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.7
    );
    this.itemOverlay.setDepth(140); // Above characters, below item

    // Position and scale based on item type
    let itemX, itemY, maxWidth, maxHeight;

    if (isCompass) {
      // Compass: smaller (20% smaller = 72% of screen instead of 90%), positioned above dialogue box
      itemX = width / 2; // Centered horizontally
      itemY = height * 0.4; // Positioned in upper-middle area, above dialogue
      maxWidth = width * 0.72; // 20% smaller than normal items
      maxHeight = height * 0.72;
    } else {
      // Other items: centered, fill most of screen
      itemX = width / 2;
      itemY = height / 2;
      maxWidth = width * 0.9;
      maxHeight = height * 0.9;
    }

    // Create item image
    const item = this.add.image(itemX, itemY, itemKey);
    item.setDepth(150); // Above overlay
    item.setAlpha(0);

    // Scale to fit
    const scale = Math.min(maxWidth / item.width, maxHeight / item.height, 1);
    item.setScale(scale);

    // Fade in overlay (if it exists)
    if (this.itemOverlay) {
      this.itemOverlay.setAlpha(0);
      this.tweens.add({
        targets: this.itemOverlay,
        alpha: 0.7,
        duration: 400,
        ease: 'Power2'
      });
    }

    // Fade in item
    this.tweens.add({
      targets: item,
      alpha: 1,
      duration: 600,
      delay: isCompass ? 0 : 200,
      ease: 'Power2'
    });

    this.currentItem = item;
    console.log(`Showing item: ${itemKey}`);
  }

  setupUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Chapter title (mobile-optimized)
    const titleStyle = {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      stroke: '#000000',
      strokeThickness: 2,
      wordWrap: { width: width - 40 }
    };
    this.chapterTitle = this.add.text(width / 2, 40, `Chapter ${this.chapterNumber}:\n${this.chapterData.title}`, titleStyle)
      .setOrigin(0.5)
      .setAlign('center')
      .setAlpha(0);

    this.tweens.add({
      targets: this.chapterTitle,
      alpha: 1,
      duration: 1000,
      ease: 'Power2'
    });

    this.tweens.add({
      targets: this.chapterTitle,
      alpha: 0,
      duration: 1000,
      delay: 3000,
      ease: 'Power2'
    });

    // Dialogue box (created when needed)
    this.dialogueBox = null;
  }

  showChapterTitle(onDismiss) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const overlay = this.add.container(0, 0).setDepth(500).setAlpha(1);

    const bg = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.95);
    overlay.add(bg);

    // Decorative lines flanking the chapter label
    const lineW = w * 0.35;
    overlay.add(this.add.rectangle(w / 2 - lineW / 2 - 60, h / 2 - 55, lineW, 1, 0x8b5c31));
    overlay.add(this.add.rectangle(w / 2 + lineW / 2 + 60, h / 2 - 55, lineW, 1, 0x8b5c31));

    // Chapter number label
    overlay.add(this.add.text(w / 2, h / 2 - 55, `— Chapter ${this.chapterNumber} —`, {
      fontSize: '13px', fontFamily: 'Courier New', color: '#8b5c31', fontStyle: 'italic'
    }).setOrigin(0.5));

    // Chapter title
    overlay.add(this.add.text(w / 2, h / 2 - 5, this.chapterData.title, {
      fontSize: '26px', fontFamily: 'Courier New', color: '#c4a575', fontStyle: 'bold'
    }).setOrigin(0.5));

    // Bottom divider
    overlay.add(this.add.rectangle(w / 2, h / 2 + 38, w * 0.5, 1, 0x8b5c31));

    // Tap to continue (blinking)
    const tapText = this.add.text(w / 2, h - 60, 'Tap to continue', {
      fontSize: '12px', fontFamily: 'Courier New', color: '#665544'
    }).setOrigin(0.5);
    overlay.add(tapText);
    this.tweens.add({ targets: tapText, alpha: 0, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Tap anywhere to dismiss
    const hitZone = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0).setDepth(501).setInteractive();
    hitZone.once('pointerdown', () => {
      hitZone.destroy();
      this.tweens.add({
        targets: overlay, alpha: 0, duration: 500,
        onComplete: () => { overlay.destroy(); this.time.delayedCall(1200, onDismiss); }
      });
    });
  }

  startNarrative() {
    if (!this.chapterData.dialogue || !this.chapterData.dialogue.opening) {
      // No opening dialogue, go straight to puzzle or choices
      this.checkForPuzzle();
      return;
    }

    // Show opening dialogue
    this.showDialogue(this.chapterData.dialogue.opening, () => {
      this.checkForMothPuzzle();
    });
  }

  showDialogue(dialogueArray, onComplete) {
    if (!dialogueArray || dialogueArray.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create dialogue box if it doesn't exist
    if (!this.dialogueBox) {
      this.createDialogueBox();
    }

    let currentIndex = 0;

    const showNextLine = () => {
      if (currentIndex >= dialogueArray.length) {
        // Hide dialogue box
        this.tweens.add({
          targets: this.dialogueBox,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            if (onComplete) onComplete();
          }
        });
        return;
      }

      const line = dialogueArray[currentIndex];
      this.displayDialogueLine(line, () => {
        currentIndex++;
        showNextLine();
      });
    };

    // Show dialogue box
    this.tweens.add({
      targets: this.dialogueBox,
      alpha: 1,
      duration: 500,
      onComplete: showNextLine
    });
  }

  createDialogueBox() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const boxHeight = 180;
    const boxY = height - boxHeight - 10;

    this.dialogueBox = this.add.container(0, boxY);
    this.dialogueBox.setAlpha(0);
    this.dialogueBox.setDepth(100); // Dialogue box in front of characters

    // Background (mobile-optimized)
    const bg = this.add.rectangle(width / 2, boxHeight / 2, width - 20, boxHeight, 0x000000, 0.85);
    bg.setStrokeStyle(2, 0x8b5c31);

    // Speaker name text (mobile-optimized)
    this.speakerText = this.add.text(15, 15, '', {
      fontSize: '16px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold'
    });

    // Dialogue text (mobile-optimized)
    this.dialogueText = this.add.text(15, 40, '', {
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      wordWrap: { width: width - 50 },
      lineSpacing: 4
    });

    // Continue indicator (mobile-optimized)
    this.continueIndicator = this.add.text(width / 2, boxHeight - 20, 'Tap to continue...', {
      fontSize: '12px',
      fontFamily: 'Courier New',
      color: '#c4a575',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    this.dialogueBox.add([bg, this.speakerText, this.dialogueText, this.continueIndicator]);
  }

  showPlaceholderScreen(line, onComplete) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    if (line.background && this.backgroundImage) {
      this.changeBackground(line.background);
    }

    if (line.hideCharacters === true) {
      this.hideAllCharacters();
    }

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.92)
      .setDepth(600)
      .setInteractive();

    const text = this.add.text(width / 2, height / 2 - 40, line.placeholder, {
      fontSize: '28px',
      fontFamily: 'Courier New',
      color: '#c4a575',
      align: 'center',
      wordWrap: { width: width - 120 }
    }).setOrigin(0.5).setDepth(601);

    const clickHint = this.add.text(width / 2, height / 2 + 80, '[ Click to continue ]', {
      fontSize: '20px',
      fontFamily: 'Courier New',
      color: '#888888',
      fontStyle: 'italic'
    }).setOrigin(0.5).setDepth(601);

    // Blink the hint
    this.tweens.add({
      targets: clickHint,
      alpha: 0,
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    overlay.once('pointerdown', () => {
      this.tweens.add({
        targets: [overlay, text, clickHint],
        alpha: 0,
        duration: 400,
        onComplete: () => {
          overlay.destroy();
          text.destroy();
          clickHint.destroy();
          if (onComplete) onComplete();
        }
      });
    });
  }

  displayDialogueLine(line, onComplete) {
    if (line.placeholder) {
      this.showPlaceholderScreen(line, onComplete);
      return;
    }

    if (line.launchMothPuzzle && this.chapterData.mothPuzzle) {
      if (line.background && this.backgroundImage) this.changeBackground(line.background);
      if (line.hideCharacters === true) this.hideAllCharacters();
      this.mothPuzzleDone = true;
      this.scene.launch('MazeScene', {
        chapterNumber: this.chapterNumber,
        onComplete: () => {
          this.scene.resume();
          this.scene.stop('MazeScene');
          if (onComplete) onComplete();
        }
      });
      this.scene.pause();
      return;
    }

    if (line.launchTrainPuzzle) {
      if (line.hideCharacters === true) this.hideAllCharacters();
      this.scene.launch('TrainMapScene', {
        chapterNumber: this.chapterNumber,
        onComplete: () => {
          this.scene.resume();
          if (onComplete) onComplete();
        }
      });
      this.scene.pause();
      return;
    }

    if (line.launchTeaPuzzle && this.chapterData.teaPuzzle) {
      this.teaPuzzleCompleted = true;
      console.log('[ChapterScene] launching tea puzzle, chapter:', this.chapterNumber);
      this.scene.launch('PuzzleScene', {
        puzzleData: this.chapterData.teaPuzzle,
        chapterNumber: this.chapterNumber,
        onComplete: () => {
          console.log('[ChapterScene] tea puzzle onComplete fired');
          this.scene.resume();
          if (onComplete) onComplete();
        }
      });
      this.scene.pause();
      return;
    }

    if (line.launchGearPuzzle && this.chapterData.puzzle?.type === 'gear_clockmakers') {
      this.gearPuzzleDone = true;
      console.log('[GearPuzzle] launching mid-dialogue, chapter:', this.chapterNumber);
      this.scene.launch('GearPuzzleScene', {
        chapterNumber: this.chapterNumber,
        onComplete: () => {
          console.log('[GearPuzzle] complete, stopping + resuming');
          this.scene.stop('GearPuzzleScene');
          this.scene.resume();
          if (onComplete) onComplete();
        }
      });
      this.scene.pause();
      return;
    }

    const speakerDisplayNames = {
      'guildmaster_black': 'Guildmaster',
      'guildmaster': 'Guildmaster',
    };
    const rawSpeaker = line.speaker || '';
    const displaySpeaker = speakerDisplayNames[rawSpeaker.toLowerCase()] || rawSpeaker;
    this.speakerText.setText(displaySpeaker);
    this.dialogueText.setText('');

    // Remove item and overlay from previous dialogue (if any)
    if (this.itemOverlay && !line.showItem) {
      // Fade out overlay
      this.tweens.add({
        targets: this.itemOverlay,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          if (this.itemOverlay) {
            this.itemOverlay.destroy();
            this.itemOverlay = null;
          }
        }
      });
    }

    // Remove item image from previous dialogue (if any)
    if (this.currentItem && !line.showItem) {
      this.tweens.add({
        targets: this.currentItem,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          this.currentItem.destroy();
          this.currentItem = null;
        }
      });
    }

    // Black screen — fade background image to black, restore on next line
    if (line.blackScreen) {
      if (this.backgroundImage) {
        this.tweens.add({ targets: this.backgroundImage, alpha: 0, duration: 400, ease: 'Linear' });
      }
      this._blackScreenActive = true;
    } else if (this._blackScreenActive) {
      this._blackScreenActive = false;
      if (this.backgroundImage) {
        this.tweens.add({ targets: this.backgroundImage, alpha: 1, duration: 400, ease: 'Linear' });
      }
    }

    // Brief fade to black transition
    if (line.fadeToBlack) {
      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      const blackOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 1)
        .setDepth(500);
      this.time.delayedCall(250, () => {
        this.tweens.add({
          targets: blackOverlay,
          alpha: 0,
          duration: 250,
          onComplete: () => blackOverlay.destroy()
        });
      });
    }

    // Swap character outfits if requested
    if (line.swapCharacters && this.chapterData.assets?.closingCharacterFolders) {
      this.swapCharacterOutfits(this.chapterData.assets.closingCharacterFolders);
    }

    // Check if background should flash (alarm effect)
    if (line.flashBackground) {
      const { backgrounds, count = 6, interval = 250 } = line.flashBackground;
      if (backgrounds && backgrounds.length === 2) {
        this.flashBackground(backgrounds[0], backgrounds[1], count, interval, null);
      }
    }

    // Check if background should change
    if (line.background && this.backgroundImage) {
      this.changeBackground(line.background);
    }

    // Brightening pulse effect (white overlay that pulses, simulating building intensity)
    if (line.brightenEffect) {
      if (this._brightenOverlay) {
        this.tweens.killTweensOf(this._brightenOverlay);
        this._brightenOverlay.destroy();
      }
      const bw = this.cameras.main.width;
      const bh = this.cameras.main.height;
      const overlay = this.add.rectangle(bw / 2, bh / 2, bw, bh, 0xffffff, 0).setDepth(2);
      this._brightenOverlay = overlay;
      this.tweens.add({
        targets: overlay,
        alpha: 0.30,
        duration: 1500,
        ease: 'Sine.easeIn',
        yoyo: true,
        repeat: -1
      });
    }

    // Crossfade to new background, also cancels any brighten pulse
    if (line.crossfadeBackground) {
      if (this._brightenOverlay) {
        this.tweens.killTweensOf(this._brightenOverlay);
        this._brightenOverlay.destroy();
        this._brightenOverlay = null;
      }
      this.changeBackground(line.crossfadeBackground);
    }

    // Check if characters should be hidden or shown
    if (line.hideCharacters === true) {
      this.hideAllCharacters();
    } else if (line.hideCharacters === false) {
      this.showAllCharacters();
    } else if (Array.isArray(line.hideCharacters)) {
      line.hideCharacters.forEach(charName => this.hideCharacter(charName));
    }
    // showCharacters always runs, even after hideCharacters:true
    if (Array.isArray(line.showCharacters)) {
      line.showCharacters.forEach(charName => this.showCharacter(charName));
    }
    if (line.showOnlyVera === true) {
      this.showOnlyVera();
    }

    // Move characters to new x positions
    if (line.moveCharacters) {
      const width = this.cameras.main.width;
      Object.entries(line.moveCharacters).forEach(([charName, position]) => {
        const targetX = position === 'center' ? width / 2 : position * width;
        this.moveCharacterToX(charName, targetX);
      });
    }

    // Check if an item should be shown
    if (line.showItem) {
      this.showItem(line.showItem);
    }

    // Ensure speaking character is visible (unless explicitly hidden)
    const speaker = line.speaker.toLowerCase();
    const speakerExplicitlyHidden = line.hideCharacters === true ||
      (Array.isArray(line.hideCharacters) && line.hideCharacters.includes(speaker));
    const isNpc = !['veracity', 'vera', 'addie', 'rainie', 'narrator'].includes(speaker);
    // NPCs (crone, cultists, etc.) must be shown via showCharacters in JSON — not auto-shown
    // Exception: these NPCs auto-show when speaking, even after hideCharacters:true (only blocked if named explicitly)
    const autoShowNpc = ['guildmaster_black', 'guildmaster', 'cultist_enforcer', 'enforcer', 'cultist_bookkeeper', 'book keeper'].includes(speaker);
    // These NPCs always appear alone — hide everyone else automatically
    const autoSoloNpc = ['guildmaster_black', 'guildmaster', 'cultist_bookkeeper', 'book keeper', 'cultist_enforcer', 'enforcer'].includes(speaker);
    const autoShowNpcBlocked = Array.isArray(line.hideCharacters) && line.hideCharacters.includes(speaker);
    if (speaker !== 'narrator' && line.showOnlyVera !== true) {
      if (autoShowNpc && !autoShowNpcBlocked) {
        if (autoSoloNpc && line.hideCharacters == null) this.hideAllCharacters();
        this.ensureSpeakerVisible(speaker);
      } else if (!isNpc && !speakerExplicitlyHidden) {
        this.ensureSpeakerVisible(speaker);
      }
    }

    // Check if expressions should change (after show logic so texture is set on visible sprite)
    if (line.expression) {
      Object.keys(line.expression).forEach(character => {
        this.setCharacterExpression(character, line.expression[character]);
      });
    }

    // Check if a companion needs to slide in
    if (speaker === 'addie' && !this.companionIntroduced.addie) {
      this.introduceCompanion('addie');
    } else if (speaker === 'rainie' && !this.companionIntroduced.rainie) {
      this.introduceCompanion('rainie');
    }

    // Explicit slide-in from JSON: "slideIn": ["rainie"] or ["addie"]
    if (Array.isArray(line.slideIn)) {
      line.slideIn.forEach(name => this.introduceCompanion(name));
    }

    // Type out text effect
    const fullText = line.text;
    let currentChar = 0;

    const typeTimer = this.time.addEvent({
      delay: 30,
      repeat: fullText.length - 1,
      callback: () => {
        currentChar++;
        this.dialogueText.setText(fullText.substring(0, currentChar));
      }
    });

    // Make dialogue box clickable to continue
    const clickZone = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height - 120,
      this.cameras.main.width - 100,
      200,
      0x000000,
      0.001
    ).setInteractive({ useHandCursor: true });

    clickZone.once('pointerdown', () => {
      typeTimer.remove();
      this.dialogueText.setText(fullText);
      clickZone.destroy();

      this.time.delayedCall(300, () => {
        if (onComplete) onComplete();
      });
    });
  }

  checkForChoices() {
    // Only show choice dialog if there are 2 or more real choices
    if (this.chapterData.choices && this.chapterData.choices.length >= 2) {
      this.showChoices(this.chapterData.choices);
    } else {
      // If 0 or 1 choice, skip choice dialog and go straight to puzzle
      this.checkForPuzzle();
    }
  }

  showChoices(choices) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const choicePanel = this.add.container(width / 2, height / 2);
    choicePanel.setAlpha(0);
    choicePanel.setDepth(100); // Choice panel in front of characters

    // Panel background (mobile-optimized)
    const panelBg = this.add.rectangle(0, 0, width - 40, Math.min(400, height - 100), 0x000000, 0.92);
    panelBg.setStrokeStyle(2, 0x8b5c31);
    choicePanel.add(panelBg);

    // Choice prompt (mobile-optimized)
    const promptText = this.add.text(0, -140, 'Choose your path:', {
      fontSize: '18px',
      fontFamily: 'Courier New',
      color: '#8b5c31',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    choicePanel.add(promptText);

    // Create choice buttons
    choices.forEach((choice, index) => {
      const yPos = -50 + index * 100;
      const button = this.createChoiceButton(0, yPos, choice, () => {
        this.handleChoice(choice);
        this.tweens.add({
          targets: choicePanel,
          alpha: 0,
          duration: 500,
          onComplete: () => choicePanel.destroy()
        });
      });
      choicePanel.add(button);
    });

    // Fade in choice panel
    this.tweens.add({
      targets: choicePanel,
      alpha: 1,
      duration: 500
    });
  }

  createChoiceButton(x, y, choice, callback) {
    const container = this.add.container(x, y);
    const width = this.cameras.main.width;

    const button = this.add.rectangle(0, 0, width - 60, 80, 0x333333);
    button.setStrokeStyle(2, 0x8b5c31);

    const text = this.add.text(0, 0, choice.text, {
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      wordWrap: { width: width - 80 },
      align: 'center',
      lineSpacing: 2
    }).setOrigin(0.5);

    const companionLabel = this.add.text((width - 60) / 2 - 10, -30, `[${choice.companion}]`, {
      fontSize: '11px',
      fontFamily: 'Courier New',
      color: choice.companion === 'addie' ? '#8b5c31' : '#4a90e2',
      fontStyle: 'italic'
    });

    container.add([button, text, companionLabel]);

    button.setInteractive({ useHandCursor: true });
    button.on('pointerover', () => {
      button.setFillStyle(0x8b5c31);
    });
    button.on('pointerout', () => {
      button.setFillStyle(0x333333);
    });
    button.on('pointerdown', callback);

    return container;
  }

  handleChoice(choice) {
    console.log(`Choice made: ${choice.text} (${choice.companion})`);

    // Record choice in game state
    gameStateManager.addChoice(this.chapterNumber, choice.text, choice.companion);

    // Apply consequences
    if (choice.consequences) {
      Object.entries(choice.consequences).forEach(([key, value]) => {
        gameStateManager.setFlag(key, value);
      });
    }

    // Check if this choice has its own puzzle
    if (choice.puzzle) {
      // Launch puzzle from choice
      this.scene.launch('PuzzleScene', {
        puzzleData: choice.puzzle,
        chapterNumber: this.chapterNumber,
        onComplete: () => this.onPuzzleComplete()
      });
      this.scene.pause();
    } else {
      // Continue to chapter puzzle or next section
      this.checkForPuzzle();
    }
  }

  checkForPuzzle() {
    if (this.chapterData.puzzle) {
      const puzzleType = this.chapterData.puzzle.type;

      if (puzzleType === 'infiltration') {
        this.scene.launch('InfiltrationScene', {
          chapterNumber: this.chapterNumber,
          onComplete: () => {
            this.scene.resume();
            // Immediately hide all characters to prevent flash before closing dialogue
            Object.values(this.characters).forEach(c => { if (c) c.setAlpha(0); });
            this.onPuzzleComplete();
          }
        });
      } else if (puzzleType === 'gear_clockmakers') {
        if (this.gearPuzzleDone) {
          // Already launched mid-dialogue — skip straight to next step
          this.checkForDeskPuzzle();
          return;
        }
        this.scene.launch('GearPuzzleScene', {
          chapterNumber: this.chapterNumber,
          onComplete: () => {
            this.scene.stop('GearPuzzleScene');
            this.scene.resume();
            this.checkForDeskPuzzle();
          }
        });
      } else {
        this.scene.launch('PuzzleScene', {
          puzzleData: this.chapterData.puzzle,
          chapterNumber: this.chapterNumber,
          onComplete: () => this.onPuzzleComplete()
        });
      }
      this.scene.pause();
    } else {
      if (this.chapterData.dialogue?.closing) {
        this.showDialogue(this.chapterData.dialogue.closing, () => this.completeChapter());
      } else {
        this.completeChapter();
      }
    }
  }

  onPuzzleComplete() {
    this.scene.resume();

    // Show midpoint dialogue before desk puzzle (if available)
    if (this.chapterData.dialogue?.midpoint && !this.midpointShown) {
      this.midpointShown = true;
      this.showDialogue(this.chapterData.dialogue.midpoint, () => {
        this.checkForDeskPuzzle();
      });
    } else {
      this.checkForDeskPuzzle();
    }
  }

  checkForDeskPuzzle() {
    // Check if there's a desk puzzle to do next
    if (this.chapterData.deskPuzzle && !this.deskPuzzleCompleted) {
      this.deskPuzzleCompleted = true;

      // Launch desk puzzle
      this.scene.launch('PuzzleScene', {
        puzzleData: this.chapterData.deskPuzzle,
        chapterNumber: this.chapterNumber,
        onComplete: () => this.onDeskPuzzleComplete()
      });
      this.scene.pause();
    }
    // Check if there's a tea puzzle to do before closing dialogue
    else if (this.chapterData.teaPuzzle && !this.teaPuzzleCompleted) {
      this.teaPuzzleCompleted = true;

      // Launch tea puzzle
      this.scene.launch('PuzzleScene', {
        puzzleData: this.chapterData.teaPuzzle,
        chapterNumber: this.chapterNumber,
        onComplete: () => this.onTeaPuzzleComplete()
      });
      this.scene.pause();
    } else {
      // Show closing dialogue if available
      if (this.chapterData.dialogue?.closing) {
        this.showDialogue(this.chapterData.dialogue.closing, () => {
          this.completeChapter();
        });
      } else {
        this.completeChapter();
      }
    }
  }

  onDeskPuzzleComplete() {
    this.scene.resume();

    // Check if there's a tea puzzle after desk puzzle
    if (this.chapterData.teaPuzzle && !this.teaPuzzleCompleted) {
      this.teaPuzzleCompleted = true;

      // Launch tea puzzle
      this.scene.launch('PuzzleScene', {
        puzzleData: this.chapterData.teaPuzzle,
        chapterNumber: this.chapterNumber,
        onComplete: () => this.onTeaPuzzleComplete()
      });
      this.scene.pause();
    } else {
      // Show closing dialogue if available
      if (this.chapterData.dialogue?.closing) {
        this.showDialogue(this.chapterData.dialogue.closing, () => {
          this.completeChapter();
        });
      } else {
        this.completeChapter();
      }
    }
  }

  onTeaPuzzleComplete() {
    this.scene.resume();

    // Check if there's a gear (connection) puzzle that hasn't been solved
    const gearPuzzle = this.chapterData.choices?.find(c => c.puzzle?.type === 'connection')?.puzzle;
    const gearPuzzleId = `ch${this.chapterNumber}_connection`;
    const gearSolved = gameStateManager.getState().completedPuzzles.includes(gearPuzzleId);

    if (gearPuzzle && !gearSolved) {
      this.showGearBypassScreen(gearPuzzle);
    } else {
      this.proceedAfterGearPuzzle();
    }
  }

  showGearBypassScreen(gearPuzzle) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    const teacups = gameStateManager.getTeacups();
    const cost = 3;
    const canAfford = teacups >= cost;

    const overlay = this.add.container(w / 2, h / 2);
    overlay.setAlpha(0);
    overlay.setDepth(200);

    const bg = this.add.rectangle(0, 0, w, h, 0x000000, 0.88);
    overlay.add(bg);

    const panel = this.add.rectangle(0, 0, w - 40, 380, 0x1a0f08);
    panel.setStrokeStyle(2, 0x8b5c31);
    overlay.add(panel);

    const question = this.add.text(0, -145, 'Would you like to solve the\ngear puzzle and open the door,\nor bypass it for 3 teacups?', {
      fontSize: '14px', fontFamily: 'Courier New', color: '#ffffff', align: 'center', lineSpacing: 4
    }).setOrigin(0.5);
    overlay.add(question);

    const balance = this.add.text(0, -70, `☕ Your teacups: ${teacups}`, {
      fontSize: '13px', fontFamily: 'Courier New', color: '#c4a575'
    }).setOrigin(0.5);
    overlay.add(balance);

    // Button 1: Solve the gear puzzle
    const btn1Bg = this.add.rectangle(0, 10, w - 60, 65, 0x333333);
    btn1Bg.setStrokeStyle(2, 0x8b5c31);
    btn1Bg.setInteractive({ useHandCursor: true });
    const btn1Text = this.add.text(0, 10, 'Solve the Gear Puzzle', {
      fontSize: '14px', fontFamily: 'Courier New', color: '#ffffff'
    }).setOrigin(0.5);
    overlay.add([btn1Bg, btn1Text]);

    btn1Bg.on('pointerover', () => btn1Bg.setFillStyle(0x8b5c31));
    btn1Bg.on('pointerout', () => btn1Bg.setFillStyle(0x333333));
    btn1Bg.on('pointerdown', () => {
      overlay.destroy();
      this.scene.launch('PuzzleScene', {
        puzzleData: gearPuzzle,
        chapterNumber: this.chapterNumber,
        onComplete: () => this.proceedAfterGearPuzzle()
      });
      this.scene.pause();
    });

    // Button 2: Spend teacups to bypass
    const btn2Color = canAfford ? 0x333333 : 0x1a1a1a;
    const btn2BorderColor = canAfford ? 0xc4a575 : 0x444444;
    const btn2TextColor = canAfford ? '#ffd700' : '#555555';
    const btn2Bg = this.add.rectangle(0, 105, w - 60, 65, btn2Color);
    btn2Bg.setStrokeStyle(2, btn2BorderColor);
    if (canAfford) btn2Bg.setInteractive({ useHandCursor: true });
    const btn2Text = this.add.text(0, 105, `Spend ${cost} ☕ to bypass the puzzle`, {
      fontSize: '14px', fontFamily: 'Courier New', color: btn2TextColor
    }).setOrigin(0.5);
    overlay.add([btn2Bg, btn2Text]);

    if (!canAfford) {
      const notEnough = this.add.text(0, 148, `(Not enough teacups)`, {
        fontSize: '11px', fontFamily: 'Courier New', color: '#664444', fontStyle: 'italic'
      }).setOrigin(0.5);
      overlay.add(notEnough);
    } else {
      btn2Bg.on('pointerover', () => btn2Bg.setFillStyle(0x5a4010));
      btn2Bg.on('pointerout', () => btn2Bg.setFillStyle(0x333333));
      btn2Bg.on('pointerdown', () => {
        overlay.destroy();
        this.showTeacupCountdown(cost, () => this.proceedAfterGearPuzzle());
      });
    }

    this.tweens.add({ targets: overlay, alpha: 1, duration: 500 });
  }

  showTeacupCountdown(cost, onComplete) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    gameStateManager.spendTeacups(cost);
    const gearPuzzleId = `ch${this.chapterNumber}_connection`;
    gameStateManager.completePuzzle(gearPuzzleId);

    const overlay = this.add.container(w / 2, h / 2);
    overlay.setDepth(200);
    overlay.setAlpha(0);

    const bg = this.add.rectangle(0, 0, w, h, 0x000000, 0.92);
    overlay.add(bg);

    const label = this.add.text(0, -80, 'Spending teacups...', {
      fontSize: '16px', fontFamily: 'Courier New', color: '#c4a575', fontStyle: 'bold'
    }).setOrigin(0.5);
    overlay.add(label);

    const countText = this.add.text(0, 10, `☕ ×${cost}`, {
      fontSize: '52px', fontFamily: 'Courier New', color: '#ffd700', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 4
    }).setOrigin(0.5);
    overlay.add(countText);

    this.tweens.add({
      targets: overlay, alpha: 1, duration: 400,
      onComplete: () => {
        let remaining = cost;
        const step = () => {
          remaining--;
          if (remaining <= 0) {
            countText.setText('☕ ×0');
            this.tweens.add({
              targets: countText, scaleX: 1.3, scaleY: 1.3, duration: 120, yoyo: true,
              onComplete: () => {
                const doneText = this.add.text(w / 2, h / 2 + 80, 'The door swings open!', {
                  fontSize: '14px', fontFamily: 'Courier New', color: '#4caf50'
                }).setOrigin(0.5).setDepth(201);
                this.time.delayedCall(900, () => {
                  this.tweens.add({
                    targets: overlay, alpha: 0, duration: 400,
                    onComplete: () => { overlay.destroy(); doneText.destroy(); onComplete(); }
                  });
                });
              }
            });
            return;
          }
          countText.setText(`☕ ×${remaining}`);
          this.tweens.add({
            targets: countText, scaleX: 1.25, scaleY: 1.25, duration: 130, yoyo: true,
            onComplete: () => { this.time.delayedCall(250, step); }
          });
        };
        this.time.delayedCall(400, step);
      }
    });
  }

  proceedAfterGearPuzzle() {
    if (this.chapterData.dialogue?.closing) {
      this.showDialogue(this.chapterData.dialogue.closing, () => this.completeChapter());
    } else {
      this.completeChapter();
    }
  }

  checkForMothPuzzle() {
    if (this.chapterData.mothPuzzle && !this.mothPuzzleDone) {
      // Launch moth puzzle scene
      this.scene.launch('PuzzleScene', {
        puzzleData: this.chapterData.mothPuzzle,
        chapterNumber: this.chapterNumber,
        onComplete: () => this.onMothPuzzleComplete()
      });
      this.scene.pause();
    } else if (this.mothPuzzleDone && this.chapterData.dialogue?.midpoint && !this.midpointShown) {
      // Moth puzzle ran mid-dialogue — show midpoint now before continuing
      this.midpointShown = true;
      this.showDialogue(this.chapterData.dialogue.midpoint, () => {
        this.checkForChoices();
      });
    } else {
      // No moth puzzle or midpoint — continue
      this.checkForChoices();
    }
  }

  onMothPuzzleComplete() {
    this.scene.resume();

    // Show midpoint dialogue if available
    if (this.chapterData.dialogue?.midpoint) {
      this.showDialogue(this.chapterData.dialogue.midpoint, () => {
        this.checkForChoices();
      });
    } else {
      this.checkForChoices();
    }
  }

  completeChapter() {
    console.log(`Chapter ${this.chapterNumber} completed`);

    // Mark chapter as completed
    gameStateManager.completeChapter(this.chapterNumber);

    // Auto-save
    saveManager.autoSave();

    // Fade out
    this.cameras.main.fadeOut(1000, 0, 0, 0);

    // Determine next chapter — use chapterData directly to avoid stale manager state
    const nextChapter = this.chapterData?.nextChapter ?? (this.chapterNumber + 1);
    console.log('[completeChapter] chapter:', this.chapterNumber, '→ nextChapter:', nextChapter, 'subscribed:', gameStateManager.isSubscribed());

    this.time.delayedCall(1000, () => {
      if (nextChapter != null && typeof nextChapter === 'number') {
        // Continue to next chapter
        gameStateManager.setCurrentChapter(nextChapter);
        this.scene.start('ChapterScene', { chapterNumber: nextChapter });
      } else {
        // Game complete
        this.scene.start('EndingScene');
      }
    });
  }

  setupBackButton() {
    this.backButton = new BackButton(this, () => {
      console.log('Back button clicked - returning to main menu');

      // Fade out
      this.cameras.main.fadeOut(500, 0, 0, 0);

      this.time.delayedCall(500, () => {
        // Stop music
        if (this.audioManager) {
          this.audioManager.stopMusic(false);
        }

        // Return to main menu
        this.scene.start('MainMenuScene');
      });
    });
  }

  setupJumpMenu() {
    // DEBUG MENU - Remove this later
    const width = this.cameras.main.width;
    const buttonWidth = 80;
    const buttonHeight = 35;
    const padding = 15;

    // Position at top-right
    const buttonX = width - padding - buttonWidth / 2;
    const buttonY = padding + buttonHeight / 2;

    this.jumpMenuContainer = this.add.container(buttonX, buttonY);
    this.jumpMenuContainer.setDepth(1000); // On top of everything

    // Jump button
    const jumpButton = this.add.rectangle(0, 0, buttonWidth, buttonHeight, 0x8b5c31);
    jumpButton.setStrokeStyle(2, 0xffd700);
    jumpButton.setInteractive({ useHandCursor: true });

    const jumpText = this.add.text(0, 0, 'JUMP', {
      fontSize: '14px',
      fontFamily: 'Courier New',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.jumpMenuContainer.add([jumpButton, jumpText]);

    // Dropdown menu (initially hidden) - positioned from top
    const dropdownHeight = 270; // Height for 10 chapters
    const dropdownTop = buttonY + buttonHeight / 2 + 5; // Just below button

    this.jumpDropdown = this.add.container(buttonX, dropdownTop + dropdownHeight / 2);
    this.jumpDropdown.setDepth(1001);
    this.jumpDropdown.setAlpha(0);
    this.jumpDropdown.setVisible(false);

    const dropdownBg = this.add.rectangle(0, 0, 150, dropdownHeight, 0x000000, 0.95);
    dropdownBg.setStrokeStyle(2, 0x8b5c31);
    this.jumpDropdown.add(dropdownBg);

    // Add chapter buttons - positioned from top
    const buttonSpacing = 26;
    const startY = -(dropdownHeight / 2) + 20; // Start from top with padding

    for (let i = 1; i <= 10; i++) {
      const yPos = startY + (i - 1) * buttonSpacing;
      const chapterButton = this.add.rectangle(0, yPos, 130, 24, 0x333333);
      chapterButton.setInteractive({ useHandCursor: true });

      const chapterText = this.add.text(0, yPos, `Chapter ${i}`, {
        fontSize: '11px',
        fontFamily: 'Courier New',
        color: '#ffffff'
      }).setOrigin(0.5);

      // Hover effect
      chapterButton.on('pointerover', () => {
        chapterButton.setFillStyle(0x8b5c31);
      });
      chapterButton.on('pointerout', () => {
        chapterButton.setFillStyle(0x333333);
      });

      // Click to jump
      chapterButton.on('pointerdown', () => {
        console.log(`Jumping to chapter ${i}`);
        this.jumpToChapter(i);
      });

      this.jumpDropdown.add([chapterButton, chapterText]);
    }

    // Toggle dropdown on button click
    let isOpen = false;
    jumpButton.on('pointerdown', () => {
      isOpen = !isOpen;
      this.jumpDropdown.setVisible(isOpen);
      this.tweens.add({
        targets: this.jumpDropdown,
        alpha: isOpen ? 1 : 0,
        duration: 200
      });
    });
  }

  jumpToChapter(chapterNumber) {
    // Close dropdown
    this.jumpDropdown.setVisible(false);
    this.jumpDropdown.setAlpha(0);

    // Update game state
    gameStateManager.setCurrentChapter(chapterNumber);

    // Restart scene with new chapter
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('ChapterScene', { chapterNumber: chapterNumber });
    });
  }


  shutdown() {
    // Clean up
    if (this.audioManager) {
      this.audioManager.destroy();
    }
    if (this.backButton) {
      this.backButton.destroy();
    }
  }
}
