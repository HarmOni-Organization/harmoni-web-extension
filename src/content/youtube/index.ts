/**
 * YouTou Extension - YouTube Integration
 * Manages all YouTube-specific features
 */

import browser from 'webextension-polyfill';
import ShortsAutoScroller from './ShortsAutoScroller';

// Define message type
interface YouTouMessage {
  type: string;
  settings?: {
    autoShortsScroll?: boolean;
    hideSections?: boolean;
    speedMemory?: boolean;
    autoSubtitleDownloader?: boolean;
  };
}

class YouTouYouTube {
  private shortsAutoScroller: ShortsAutoScroller | null = null;
  private featureSettings = {
    autoShortsScroll: true,
    // hideSections: true,
    // speedMemory: true,
    // autoSubtitleDownloader: true,
  };

  constructor() {
    this.init();
    this.setupFeatureToggleListener();
  }

  /**
   * Initialize the YouTube integration
   */
  private init(): void {
    console.log('YouTou: YouTube integration initialized');

    // Initialize features based on current settings
    this.loadSettings().then(() => {
      this.initializeFeatures();
    });
  }

  /**
   * Load user settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      // Load settings from browser storage
      const settings = await browser.storage.sync.get('youTouSettings');
      if (settings.youTouSettings) {
        this.featureSettings = {
          ...this.featureSettings,
          ...settings.youTouSettings,
        };
      }
      console.log('YouTou: Settings loaded', this.featureSettings);
    } catch (error) {
      console.error('YouTou: Error loading settings', error);
    }
  }

  /**
   * Initialize features based on settings
   */
  private initializeFeatures(): void {
    // Auto Shorts Scroller
    if (this.featureSettings.autoShortsScroll) {
      this.shortsAutoScroller = new ShortsAutoScroller();
    }

    // Additional features will be implemented here
    // - Hide Sections
    // - Speed Memory (per channel)
    // - Auto Subtitle Downloader
  }

  /**
   * Listen for settings changes from popup/options
   */
  private setupFeatureToggleListener(): void {
    browser.runtime.onMessage.addListener((message: YouTouMessage) => {
      if (message.type === 'YOUTOU_SETTINGS_UPDATED') {
        this.featureSettings = {
          ...this.featureSettings,
          ...message.settings,
        };
        this.updateFeatureStates();
      }
      return true;
    });
  }

  /**
   * Update feature states based on current settings
   */
  private updateFeatureStates(): void {
    // Auto Shorts Scroller
    if (this.featureSettings.autoShortsScroll) {
      if (!this.shortsAutoScroller) {
        this.shortsAutoScroller = new ShortsAutoScroller();
      } else {
        this.shortsAutoScroller.setEnabled(true);
      }
    } else if (this.shortsAutoScroller) {
      this.shortsAutoScroller.setEnabled(false);
    }

    // Additional feature toggles will be implemented here
  }
}

// Initialize YouTou YouTube integration
new YouTouYouTube();

export default YouTouYouTube;
