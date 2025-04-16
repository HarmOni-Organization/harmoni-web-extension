/**
 * YouTou Extension - Auto Shorts Scroller Feature
 * Automatically scrolls to the next Short when the current one finishes playing
 */

class ShortsAutoScroller {
  private observer: MutationObserver | null = null;
  private isEnabled = true;

  constructor() {
    this.init();
  }

  /**
   * Initialize the auto scroller
   */
  public init(): void {
    // Only run on YouTube Shorts pages
    if (!this.isYoutubeShortsPage()) return;

    console.log('YouTou: Auto Shorts Scroller initialized');
    this.setupVideoEndedObserver();
  }

  /**
   * Check if current page is YouTube Shorts
   */
  private isYoutubeShortsPage(): boolean {
    return window.location.pathname.includes('/shorts');
  }

  /**
   * Setup observer to detect video end events
   */
  private setupVideoEndedObserver(): void {
    // Disconnect any existing observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Watch for DOM changes to find video elements
    this.observer = new MutationObserver(this.handleDomChanges.bind(this));
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also check for existing video elements
    this.attachEventListenersToVideos();
  }

  /**
   * Handle DOM changes to find new video elements
   */
  private handleDomChanges(): void {
    this.attachEventListenersToVideos();
  }

  /**
   * Attach event listeners to all video elements in Shorts
   */
  private attachEventListenersToVideos(): void {
    if (!this.isEnabled) return;

    const videos = document.querySelectorAll('.html5-main-video') as NodeListOf<HTMLVideoElement>;
    videos.forEach((video) => {
      // Only attach once
      video.addEventListener('timeupdate', (e: Event) => {
        const video = e.target as HTMLVideoElement;

        if (video.currentTime > 0) {
          video.dataset.youTouProcessed = 'true';
          video.loop = false;
        }

        const videoLength = video.duration;
        if (video.dataset.youTouProcessed === 'true' && video.currentTime === videoLength) {
          this.handleVideoEnded(e);
          video.dataset.youTouProcessed = 'false';
        }
      });
    });
  }

  /**
   * Handle video ended event - scroll to next short
   */
  private handleVideoEnded(event: Event): void {
    console.log('YouTou: Video ended, scrolling to next short', event);
    if (!this.isEnabled) return;

    const video = event.target as HTMLVideoElement;
    console.log('YouTou: Video ended, scrolling to next short');

    // Find the navigation button for going to next video
    const nextButton = document.querySelector(
      '#navigation-button-down button'
    ) as HTMLButtonElement;

    if (nextButton) {
      // Click the next button to navigate to next short
      nextButton.click();
      console.log('YouTou: Clicked next button');
    } else {
      // Fallback: scroll down by viewport height
      window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth',
      });
      console.log('YouTou: Scrolled down (fallback method)');
    }
  }

  /**
   * Enable or disable auto scrolling
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;

    if (enabled) {
      this.attachEventListenersToVideos();
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export default ShortsAutoScroller;
