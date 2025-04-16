/**
 * MyAnimeList content script for Harmoni extension
 * Adds functionality to download anime covers with proper naming
 */

import { logger } from '../../utils/logger';

/**
 * Common button styles for consistent behavior
 */
const COMMON_BUTTON_STYLES = `
  /* Make buttons appear quickly but disappear slower for better UX */
  .harmoni-download-btn {
    transition: opacity 0.15s ease-in, transform 0.15s ease-in, background-color 0.15s ease !important;
    pointer-events: none !important; /* Don't interfere with normal page interaction */
  }
  /* When visible, allow interaction */
  *:hover > .harmoni-download-btn,
  .harmoni-download-btn:hover,
  .harmoni-download-btn:focus {
    pointer-events: all !important;
    transition: opacity 0.05s ease-out, transform 0.05s ease-out, background-color 0.05s ease !important;
  }
`;

/**
 * Simple debounce function to prevent multiple rapid executions
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(later, wait);
  };
}

/**
 * Initializes the cover download functionality for MyAnimeList
 */
function initCoverDownload() {
  // Add a processing flag to prevent overlapping calls
  let isProcessing = false;

  // Log the current URL to verify if we're on an anime detail page
  const currentUrl = window.location.href;
  const isAnimeDetailPage = currentUrl.match(/\/anime\/\d+\//);
  logger.info(
    `Initializing MyAnimeList cover download feature on ${currentUrl} ${
      isAnimeDetailPage ? '(anime detail page)' : ''
    }`
  );

  logger.info('MyAnimeList cover download feature initialized');

  // Add CSS fixes for anime detail pages
  if (window.location.href.match(/\/anime\/\d+\//)) {
    const style = document.createElement('style');
    style.textContent = `
      /* Fix for leftside image container on anime detail pages */
      .leftside > div[style*="text-align: center"] {
        position: relative !important;
      }
      /* Universal styles for all containers with buttons */
      *:has(> .harmoni-download-btn) {
        transition: filter 0.2s ease !important;
      }
      *:has(> .harmoni-download-btn):hover {
        filter: brightness(1.05) !important;
      }
      /* Universal button styling - hidden by default */
      .harmoni-download-btn {
        z-index: 1000 !important;
        opacity: 0 !important;
        transform: translateY(-5px) !important;
        font-weight: bold !important;
        letter-spacing: 0.5px !important;
        box-shadow: 0 2px 5px rgba(0,0,0,0.4) !important;
      }
      /* Show button on container hover */
      *:hover > .harmoni-download-btn,
      .harmoni-download-btn:hover,
      .harmoni-download-btn:focus {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
      /* Position buttons consistently */
      .leftside > div[style*="text-align: center"] .harmoni-download-btn,
      .leftside .image .harmoni-download-btn {
        position: absolute !important;
        top: 10px !important;
        right: 10px !important;
      }

      ${COMMON_BUTTON_STYLES}
    `;
    document.head.appendChild(style);
  }

  // Add special CSS for fancybox popup images
  const fancyboxStyle = document.createElement('style');
  fancyboxStyle.textContent = `
    /* Styles for fancybox popup images */
    #fancybox-inner,
    .fancybox-inner,
    .fancybox-content,
    [id^="fancybox-"] {
      position: relative !important;
    }
    /* Make ALL buttons hidden by default including fancybox */
    #fancybox-inner .harmoni-download-btn,
    .fancybox-inner .harmoni-download-btn,
    .fancybox-content .harmoni-download-btn,
    [id^="fancybox-"]:hover .harmoni-download-btn {
      position: absolute !important;
      top: 15px !important;
      right: 15px !important;
      z-index: 99999 !important;
      background: rgba(66, 133, 244, 0.85) !important; /* Blue shade */
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;
      opacity: 0 !important;
      transform: translateY(-5px) !important;
    }
    /* Show buttons on hover */
    #fancybox-inner:hover .harmoni-download-btn,
    .fancybox-inner:hover .harmoni-download-btn,
    .fancybox-content:hover .harmoni-download-btn,
    [id^="fancybox-"]:hover .harmoni-download-btn,
    .harmoni-download-btn:hover {
      transform: translateY(0) !important;
      opacity: 1 !important;
      background: rgba(66, 133, 244, 1) !important;
    }

    ${COMMON_BUTTON_STYLES}
  `;
  document.head.appendChild(fancyboxStyle);

  // Special function to handle fancybox popups that may appear dynamically
  const handleFancyboxPopups = () => {
    // Check for various versions of fancybox
    const fancyboxContainers = [
      document.getElementById('fancybox-inner'),
      document.querySelector('.fancybox-inner'),
      document.querySelector('.fancybox-content'),
      // Handle dynamically added fancybox containers
      ...Array.from(document.querySelectorAll('[id^="fancybox-"]')).filter(
        (el) =>
          el.id.includes('inner') ||
          el.classList.contains('fancybox-inner') ||
          el.querySelector('img[src*="cdn.myanimelist.net/images"]')
      ),
    ].filter(Boolean) as Element[];

    if (fancyboxContainers.length === 0) return;

    // Process each fancybox container
    fancyboxContainers.forEach((container) => {
      // Skip if we already processed this container
      if (container.querySelector('.harmoni-download-btn')) return;

      // Find the image inside the container
      const imgElement = container.querySelector('img') as HTMLImageElement;
      if (!imgElement) return;

      logger.info('Found fancybox popup image:', imgElement.src);

      // Get anime title from various sources
      let animeTitle = '';

      // 1. Try alt attribute
      if (imgElement.alt && imgElement.alt.trim()) {
        animeTitle = imgElement.alt.trim();
      }

      // 2. Try title attribute
      if (!animeTitle && imgElement.title && imgElement.title.trim()) {
        animeTitle = imgElement.title.trim();
      }

      // 3. Try aria-label
      if (!animeTitle && imgElement.getAttribute('aria-label')) {
        animeTitle = imgElement.getAttribute('aria-label')!.trim();
      }

      // 4. Try to extract from URL
      if (!animeTitle && imgElement.src) {
        const urlParts = imgElement.src.split('/');
        const filenameWithExt = urlParts[urlParts.length - 1];
        // Look for patterns like "12345l.jpg" and extract a name if possible
        const match = filenameWithExt.match(/(\d+)([tvlsg])\.(?:jpg|png|webp|gif)/i);
        if (match) {
          // Try to find title in page that might correspond to this image
          const imageIds = document.querySelectorAll(`[data-src*="${match[1]}"]`);
          if (imageIds.length > 0) {
            // Find nearby title
            for (const img of Array.from(imageIds)) {
              const nearbyTitle =
                img.closest('[data-title]')?.getAttribute('data-title') ||
                img.closest('[title]')?.getAttribute('title') ||
                img.closest('[alt]')?.getAttribute('alt');
              if (nearbyTitle) {
                animeTitle = nearbyTitle;
                break;
              }
            }
          }
        }
      }

      // 5. Fallback to page title
      if (!animeTitle) {
        animeTitle = document.title;
        // If title contains " - MyAnimeList.net", remove it
        animeTitle = animeTitle.replace(' - MyAnimeList.net', '');
      }

      // Add download button to fancybox container
      addDownloadButton(container, imgElement, animeTitle);
    });
  };

  // Check for fancybox popups periodically (every 2 seconds instead of every 1 second)
  const fancyboxCheckInterval = setInterval(handleFancyboxPopups, 2000);

  // Clean up interval when page unloads
  window.addEventListener('unload', () => {
    clearInterval(fancyboxCheckInterval);
  });

  // Also add event listeners for various events that might indicate a fancybox was opened
  const possibleEvents = ['click', 'mouseover', 'DOMNodeInserted', 'load'];
  const debouncedHandleFancyboxPopups = debounce(handleFancyboxPopups, 300);

  possibleEvents.forEach((eventType) => {
    document.addEventListener(
      eventType,
      (e) => {
        // Only trigger for events related to images or fancybox
        const target = e.target as Element;
        if (
          target &&
          (target.tagName === 'IMG' ||
            target.classList?.contains('fancybox') ||
            target.id?.includes('fancybox') ||
            target.hasAttribute('data-fancybox') ||
            target.getAttribute('href')?.includes('/images/anime/') ||
            (target.getAttribute && target.getAttribute('onclick')?.includes('fancybox')))
        ) {
          // Wait a short time for the fancybox to actually open
          debouncedHandleFancyboxPopups();
        }
      },
      { passive: true }
    );
  });

  // Find all anime cover images on the page
  const findAnimeCovers = () => {
    // Prevent multiple simultaneous executions
    if (isProcessing) {
      logger.info('Already processing covers, skipping this call');
      return;
    }

    isProcessing = true;
    logger.info('Starting cover detection process');

    // Special handling for anime detail pages with the specific structure
    const isAnimeDetailPage = window.location.href.match(/\/anime\/\d+\//);

    if (isAnimeDetailPage) {
      // Look for the specific image container structure shown in the user's example
      const leftside = document.querySelector('.leftside');
      if (leftside) {
        const textAlignCenter = leftside.querySelector('div[style*="text-align: center"]');
        if (textAlignCenter) {
          const anchor = textAlignCenter.querySelector('a');
          const img = anchor?.querySelector('img');

          if (img && !textAlignCenter.querySelector('.harmoni-download-btn')) {
            // Get anime title from the page title
            const pageTitle = document.querySelector('h1.title-name');
            const animeTitle = pageTitle?.textContent?.trim() || document.title;

            logger.info(`Found anime detail image for "${animeTitle}"`);
            addDownloadButton(textAlignCenter, img as HTMLImageElement, animeTitle);
          }
        }
      }
    }

    // Special handling for fancybox popups
    handleFancyboxPopups();

    // Standard processing for all pages
    // More specific selectors based on MAL page structure
    const imageContainers = document.querySelectorAll(
      // Seasonal anime page
      '.seasonal-anime .image, ' +
        // Anime details page - various layouts
        '.leftside .image, ' +
        '.leftside > div > a > img, ' +
        '.leftside > div[style*="text-align: center"] > a > img, ' +
        '.leftside > div[style*="text-align: center"], ' +
        // Search results
        '.list .picSurround, ' +
        // Top anime ranking
        '.ranking-list .image, ' +
        // Information container
        '.information .scormem-container, ' +
        // Generic fallbacks
        'img[src*="cdn.myanimelist.net/images/anime"]'
    );

    logger.info(`Found ${imageContainers.length} potential anime covers`);

    // Process each image container
    imageContainers.forEach((container) => {
      // Find the image element within or near the container
      let imgElement = container.querySelector('img');

      // If no img found in container, try to find img in parent
      if (!imgElement && container.parentElement) {
        imgElement = container.parentElement.querySelector('img');
      }

      // Handle case where the selector directly matched an img
      if (!imgElement && container.tagName === 'IMG') {
        imgElement = container as HTMLImageElement;
      }

      if (!imgElement) return;

      // Find anime title - using multiple strategies
      let animeTitle = '';

      // Try different title selectors based on page type
      const titleSelectors = [
        // Anime details page
        'h1.title-name',
        'h1.h1_anime_title',
        'h1.h1',
        '.title-name',
        '.h1-title',
        '.h2_anime_title',
        // Seasonal anime
        '.title a',
        // For various other pages
        '.title',
        '.fw-b',
        '.ranking-title',
        '.link-title',
      ];

      // Try to find title using container's parents and siblings
      let parent = container;
      for (let i = 0; i < 5; i++) {
        // Check up to 5 levels up
        // First try directly within this parent
        for (const selector of titleSelectors) {
          const titleEl = parent.querySelector(selector);
          if (titleEl && titleEl.textContent) {
            animeTitle = titleEl.textContent.trim();
            break;
          }
        }

        // If found, break the loop
        if (animeTitle) break;

        // Try to find title in siblings
        const siblings = parent.parentElement?.children || [];
        for (let j = 0; j < siblings.length; j++) {
          const sibling = siblings[j];

          for (const selector of titleSelectors) {
            const titleEl = sibling.querySelector(selector);
            if (titleEl && titleEl.textContent) {
              animeTitle = titleEl.textContent.trim();
              break;
            }
          }

          if (animeTitle) break;

          // Check if sibling itself is a title element or contains direct text
          if (
            sibling.classList &&
            (sibling.classList.contains('title') ||
              sibling.classList.contains('title-name') ||
              sibling.tagName === 'H2' ||
              sibling.tagName === 'H3') &&
            sibling.textContent
          ) {
            animeTitle = sibling.textContent.trim();
            break;
          }
        }

        // If found, break the loop
        if (animeTitle) break;

        // Move up to parent for next iteration
        if (parent.parentElement) {
          parent = parent.parentElement;
        } else {
          break;
        }
      }

      // If no title found, try to extract from image alt or filename
      if (!animeTitle && imgElement.alt) {
        animeTitle = imgElement.alt.trim();
      }

      if (!animeTitle && imgElement.src) {
        // Try to extract name from URL path
        const urlParts = imgElement.src.split('/');
        const filenameWithExt = urlParts[urlParts.length - 1];
        const filename = filenameWithExt.split('.')[0];
        if (filename.length > 3) {
          // Only use if it's a reasonable length
          animeTitle = filename;
        }
      }

      // Also add title detection for special anime detail page case
      if (!animeTitle) {
        // Check if we're on an anime detail page
        const isAnimeDetailPage = window.location.href.match(/\/anime\/\d+\//);
        if (isAnimeDetailPage) {
          // First try to find the anime title from page h1
          const pageTitle = document.querySelector('h1.title-name, h1.h1_anime_title, h1.h1');
          if (pageTitle && pageTitle.textContent) {
            animeTitle = pageTitle.textContent.trim();
          } else {
            // Try to get title from URL path segments
            const urlParts = window.location.pathname.split('/');
            if (urlParts.length >= 3) {
              const titleFromUrl = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
              if (titleFromUrl && titleFromUrl !== 'pics' && titleFromUrl.length > 1) {
                // Replace underscores with spaces and decode URI components
                animeTitle = decodeURIComponent(titleFromUrl.replace(/_/g, ' '));
              }
            }
          }
        }
      }

      // Fallback if still no title
      if (!animeTitle) {
        animeTitle = 'anime_' + Date.now();
      }

      // Add download button if not already present
      if (!container.querySelector('.harmoni-download-btn')) {
        addDownloadButton(container, imgElement, animeTitle);
      }
    });

    // Release the processing lock when done
    setTimeout(() => {
      isProcessing = false;
      logger.info('Cover detection process completed');
    }, 100);
  };

  // Run initially with a small delay to ensure DOM is fully loaded
  setTimeout(findAnimeCovers, 500);

  // Create a debounced version of findAnimeCovers to prevent rapid successive calls
  const debouncedFindCovers = debounce(findAnimeCovers, 250);

  // Set up a mutation observer to detect new content
  const observer = new MutationObserver((mutations) => {
    // Check if relevant content was added
    const shouldUpdate = mutations.some((mutation) => {
      // Skip mutations triggered by our own elements
      if (
        mutation.target &&
        ((mutation.target as Element).classList?.contains('harmoni-download-btn') ||
          (mutation.target as Element).id === 'harmoni-toast-container')
      ) {
        return false;
      }

      // Skip if all added nodes are our own elements
      if (mutation.addedNodes.length > 0) {
        let allOurs = true;
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            if (
              !node.classList.contains('harmoni-download-btn') &&
              node.id !== 'harmoni-toast-container'
            ) {
              allOurs = false;
            }
          } else {
            // If it's not an element, it's probably not ours
            allOurs = false;
          }
        });

        if (allOurs) {
          return false;
        }
      }

      return (
        mutation.addedNodes.length > 0 ||
        (mutation.type === 'attributes' &&
          mutation.attributeName === 'src' &&
          !(mutation.target as Element).classList?.contains('harmoni-download-btn'))
      );
    });

    if (shouldUpdate) {
      logger.info('DOM changes detected, scheduling cover detection');
      debouncedFindCovers();
    }
  });

  // Find relevant containers to observe
  const relevantContainers = [
    // Main content areas that might contain anime images
    document.querySelector('#content'),
    document.querySelector('main'),
    document.querySelector('.content'),
    document.querySelector('.leftside'),
    // Seasonal anime container
    document.querySelector('.seasonal-anime-list'),
    // Search results
    document.querySelector('.js-categories-seasonal'),
    // Fall back to body if none of the above exist
    document.body,
  ].filter(Boolean) as Element[];

  // Use the most specific container available
  const containerToObserve = relevantContainers.length > 1 ? relevantContainers[0] : document.body;

  logger.info(`Observing mutations on ${containerToObserve.tagName || 'unknown'} element`);

  // Start observing
  observer.observe(containerToObserve, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src'],
  });
}

// Settings for MAL Downloader
const malSettings = {
  enabled: true,
  buttonStyle: 'minimal',
  showText: true,
};

// Load settings from storage
chrome.storage.sync.get(
  ['malDownloaderEnabled', 'malDownloaderButtonStyle', 'malDownloaderShowText'],
  (result) => {
    malSettings.enabled = result.malDownloaderEnabled !== false;
    malSettings.buttonStyle = result.malDownloaderButtonStyle || 'minimal';
    malSettings.showText = result.malDownloaderShowText !== false;
  }
);

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateMALDownloaderSettings') {
    const { settings } = message;

    if (settings.malDownloaderEnabled !== undefined) {
      malSettings.enabled = settings.malDownloaderEnabled;
    }

    if (settings.malDownloaderButtonStyle !== undefined) {
      malSettings.buttonStyle = settings.malDownloaderButtonStyle;
    }

    if (settings.malDownloaderShowText !== undefined) {
      malSettings.showText = settings.malDownloaderShowText;
    }

    // Update all existing buttons with new settings
    updateExistingButtons();

    sendResponse({ success: true });
    return true;
  }

  // Handle enableMALTracking message
  if (message.action === 'enableMALTracking') {
    if (window.location.href.match(/\/anime\/\d+\//)) {
      console.log('HarmOni: Adding tracker button to anime page');
      addTrackerButton();
      sendResponse({ success: true });
    } else {
      console.log('HarmOni: Not on an anime page');
      sendResponse({ success: false, message: 'Not on an anime page' });
    }
    return true;
  }
});

// Function to update existing buttons based on new settings
function updateExistingButtons() {
  const buttons = document.querySelectorAll('.harmoni-download-btn');

  buttons.forEach((button) => {
    const btn = button as HTMLElement;

    // If disabled, hide all buttons
    if (!malSettings.enabled) {
      btn.style.display = 'none';
      return;
    }

    // Otherwise update button styles
    btn.style.display = ''; // Reset to default display

    // Update button text
    if (btn.querySelector('.btn-text')) {
      const textSpan = btn.querySelector('.btn-text') as HTMLElement;
      textSpan.style.display = malSettings.showText ? '' : 'none';
    }

    // Update button style
    if (malSettings.buttonStyle === 'standard') {
      btn.style.opacity = '0.9';
      btn.style.padding = '4px 8px';
    } else {
      btn.style.opacity = '0.75';
      btn.style.padding = '2px 6px';
    }
  });
}

/**
 * Adds a download button to an image container
 */
function addDownloadButton(
  container: Element,
  imgElement: HTMLImageElement | string,
  animeTitle: string
) {
  // Check if button already exists to prevent duplicates
  if (container.querySelector('.harmoni-download-btn')) {
    return;
  }

  // Skip if feature is disabled
  if (!malSettings.enabled) {
    return;
  }

  // Get image URL from either an HTMLImageElement or directly from a string
  const imageUrl = typeof imgElement === 'string' ? imgElement : imgElement.src;

  // Create button element
  const downloadBtn = document.createElement('a');
  downloadBtn.className = 'harmoni-download-btn';
  downloadBtn.href = '#';
  downloadBtn.title = `Download cover for ${animeTitle}`;

  // Set button styles based on settings
  Object.assign(downloadBtn.style, {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(66, 133, 244, 0.9)',
    color: 'white',
    borderRadius: '4px',
    display: 'none',
    fontSize: '12px',
    zIndex: '1000',
    textDecoration: 'none',
    opacity: malSettings.buttonStyle === 'standard' ? '0.9' : '0.75',
    padding: malSettings.buttonStyle === 'standard' ? '4px 8px' : '2px 6px',
  });

  // Add text span
  const textSpan = document.createElement('span');
  textSpan.className = 'btn-text';
  textSpan.textContent = 'Save';
  textSpan.style.display = malSettings.showText ? '' : 'none';
  downloadBtn.appendChild(textSpan);

  // Add click event to download image
  downloadBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Use the downloadCover function which handles MyAnimeList image URLs properly
      if (typeof imgElement === 'string') {
        // If we only have the URL, create a temporary image element
        const tempImg = new Image();
        tempImg.src = imageUrl;
        await downloadCover(tempImg, animeTitle);
      } else {
        // Otherwise use the image element directly
        await downloadCover(imgElement, animeTitle);
      }

      // Add to download history in local storage
      const downloadItem = {
        title: animeTitle,
        url: imageUrl,
        downloadedAt: new Date().toISOString(),
      };

      // Get existing history and update it
      chrome.storage.local.get(['malDownloaderHistory'], (result) => {
        const history = result.malDownloaderHistory || [];
        const updatedHistory = [downloadItem, ...history].slice(0, 50); // Keep latest 50 downloads

        chrome.storage.local.set({ malDownloaderHistory: updatedHistory }, () => {
          // After updating storage, send message to popup (if open)
          chrome.runtime.sendMessage({
            action: 'malCoverDownloaded',
            title: animeTitle,
            url: imageUrl,
          });
        });
      });
    } catch (error) {
      showToast('Error downloading image', 'error');
      console.error('Error downloading MAL cover:', error);
    }
  });

  // Make sure container has position relative
  if (container instanceof HTMLElement) {
    const containerStyle = window.getComputedStyle(container);
    if (containerStyle.position === 'static') {
      container.style.position = 'relative';
    }

    // Add hover effect to container
    container.addEventListener('mouseenter', () => {
      downloadBtn.style.display = 'block';
    });

    container.addEventListener('mouseleave', () => {
      downloadBtn.style.display = 'none';
    });
  }

  // Append button to container
  container.appendChild(downloadBtn);
}

/**
 * Downloads the anime cover image
 */
async function downloadCover(imgElement: HTMLImageElement, animeTitle: string) {
  try {
    // Show loading toast
    showToast(`Preparing to download cover for "${animeTitle}"...`, 'info');

    // Get high quality image URL (MAL often has lower quality in src but higher in data attributes)
    const imgUrl =
      imgElement.dataset.src ||
      imgElement.getAttribute('data-src') ||
      imgElement.getAttribute('data-image') ||
      imgElement.src;

    if (!imgUrl) {
      throw new Error('Could not find image URL');
    }

    // Get all possible URLs to try, from highest to lowest quality
    const possibleUrls = [];

    // Original URL (last resort)
    possibleUrls.push(imgUrl);

    // 1. First try removing size constraints
    if (imgUrl.includes('/r/')) {
      possibleUrls.unshift(imgUrl.replace(/\/r\/\d+x\d+\//, '/'));
    }

    // 2. Try to convert to largest version if using size indicators
    // MAL often uses URLs like /images/anime/13/12345l.jpg where 'l' is for large
    // We'll try to get the original by removing the size indicator
    const urlParts = imgUrl.split('.');
    if (urlParts.length > 1) {
      const extension = urlParts[urlParts.length - 1];
      const filenameBase = urlParts[urlParts.length - 2];

      // Try to use the original image without size indicators
      if (/[tvlsjcg]$/.test(filenameBase)) {
        const baseWithoutSize = filenameBase.slice(0, -1);
        urlParts[urlParts.length - 2] = baseWithoutSize;
        possibleUrls.unshift(urlParts.join('.'));
      }

      // Try the larger sizes if available (l for large, g for giant)
      // Common size codes: t (thumbnail), v (preview), s (small), l (large), g (giant)
      if (!/[lg]$/.test(filenameBase)) {
        // Try large size
        const baseWithoutSize = filenameBase.replace(/[tvs]$/, '') || filenameBase;
        const largeUrl = [...urlParts.slice(0, -2), baseWithoutSize + 'l', extension].join('.');
        possibleUrls.unshift(largeUrl);

        // Try giant size
        const giantUrl = [...urlParts.slice(0, -2), baseWithoutSize + 'g', extension].join('.');
        possibleUrls.unshift(giantUrl);
      }
    }

    // 3. Try replacing /anime_userimages/ with /anime/ (common pattern on MAL)
    if (imgUrl.includes('/anime_userimages/')) {
      const userImageUrl = imgUrl.replace('/anime_userimages/', '/anime/');
      possibleUrls.unshift(userImageUrl);
    }

    // Debug log the URLs we're going to try
    logger.info('Trying URLs in order:', possibleUrls);

    // Try each URL until one works
    let response: Response | null = null;
    let highQualityUrl = '';
    const errorMessages: string[] = [];

    for (const url of possibleUrls) {
      try {
        response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          highQualityUrl = url;
          break;
        } else {
          errorMessages.push(`URL ${url} returned status ${response.status}`);
        }
      } catch (err: any) {
        errorMessages.push(`Error fetching ${url}: ${err?.message || 'Unknown error'}`);
        continue;
      }
    }

    // If no URL worked, try the original again with a full GET request
    if (!highQualityUrl) {
      logger.warn('All HEAD requests failed. Trying original URL with GET request', errorMessages);
      try {
        response = await fetch(imgUrl);
        if (response.ok) {
          highQualityUrl = imgUrl;
        } else {
          throw new Error(`Failed to fetch image: HTTP ${response.status}`);
        }
      } catch (err: any) {
        throw new Error(`All image URLs failed: ${err?.message || 'Unknown error'}`);
      }
    }

    // Ensure response is not null before accessing it
    if (!response) {
      throw new Error('Failed to fetch image: No response');
    }

    // Get proper content type from response
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Determine proper file extension based on content type
    let fileExtension = '.jpg';
    if (contentType.includes('png')) {
      fileExtension = '.png';
    } else if (contentType.includes('webp')) {
      fileExtension = '.webp';
    } else if (contentType.includes('gif')) {
      fileExtension = '.gif';
    }

    // Clean filename - replace invalid characters
    const cleanTitle = animeTitle.replace(/[\\/:*?"<>|]/g, '_').trim();
    const filename = `${cleanTitle}${fileExtension}`;

    // Fetch the actual image data
    const imgResponse = await fetch(highQualityUrl);
    if (!imgResponse.ok) {
      throw new Error(`Failed to download image: HTTP ${imgResponse.status}`);
    }

    const blob = await imgResponse.blob();
    if (blob.size === 0) {
      throw new Error('Downloaded image is empty');
    }

    // Create a download link with the correct mime type
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(new Blob([blob], { type: contentType }));
    downloadLink.download = filename;

    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    logger.info(`Downloaded cover for "${animeTitle}" (${(blob.size / 1024).toFixed(1)}KB)`);
    showToast(`Cover for "${animeTitle}" downloaded successfully!`);
  } catch (error: any) {
    logger.error('Error downloading anime cover:', error);
    showToast(`Failed to download: ${error?.message || 'Unknown error'}`, 'error');
  }
}

/**
 * Creates and shows a toast notification
 */
function showToast(message: string, type: 'default' | 'info' | 'warning' | 'error' = 'default') {
  const colors = {
    default: 'rgba(66, 133, 244, 0.9)', // blue
    info: 'rgba(66, 133, 244, 0.9)', // blue
    warning: 'rgba(255, 193, 7, 0.9)', // warning yellow
    error: 'rgba(220, 53, 69, 0.9)', // error red
  };

  const backgroundColor = colors[type] || colors.default;

  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('harmoni-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'harmoni-toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '10000';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'harmoni-toast';
  toast.style.padding = '10px 15px';
  toast.style.marginBottom = '10px';
  toast.style.backgroundColor = backgroundColor;
  toast.style.color = 'white';
  toast.style.borderRadius = '4px';
  toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease';
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Show toast with animation
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);

  // Hide toast after delay
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

/**
 * Adds a tracker button to the anime page
 */
function addTrackerButton() {
  // Add CSS for tracker button
  const trackerStyle = document.createElement('style');
  trackerStyle.textContent = `
    .harmoni-tracker-btn {
      display: inline-block;
      background-color: #4285f4;
      color: white;
      border-radius: 4px;
      padding: 6px 12px;
      font-size: 14px;
      font-weight: bold;
      text-align: center;
      cursor: pointer;
      margin-top: 10px;
      transition: background-color 0.2s;
      border: none;
      width: 100%;
    }
    
    .harmoni-tracker-btn:hover {
      background-color: #3367d6;
    }
  `;
  document.head.appendChild(trackerStyle);

  // Get anime details
  const animeTitle =
    document.querySelector('h1.title-name, .h1-title, .title-name')?.textContent?.trim() ||
    document.querySelector('span[itemprop="name"]')?.textContent?.trim() ||
    document.title.replace(' - MyAnimeList.net', '').trim();

  // Get anime image URL
  const animeImage = document.querySelector(
    '.leftside img[itemprop="image"], img[data-src*="cdn.myanimelist.net/images/anime"], img[src*="cdn.myanimelist.net/images/anime"]'
  ) as HTMLImageElement;
  const imageUrl = animeImage?.src || animeImage?.dataset?.src || '';

  // Get anime synopsis
  const synopsis = document.querySelector('[itemprop="description"]')?.textContent?.trim() || '';

  // Get current URL as media URL
  const mediaUrl = window.location.href;

  // Try to find the "Add to My List" button container
  const buttonContainer = document.querySelector(
    '.js-form-user-status-block, .add-to-list, .profileRows, #profileRows'
  ) as HTMLElement;
  if (!buttonContainer) {
    console.log('HarmOni: Could not find button container');

    // Try finding the leftside
    const leftside = document.querySelector('.leftside') as HTMLElement;
    if (leftside) {
      console.log('HarmOni: Using leftside as container');

      // Create simple tracker button
      const trackerBtn = document.createElement('button');
      trackerBtn.className = 'harmoni-tracker-btn';
      trackerBtn.textContent = 'Add to HarmOni Tracker';
      trackerBtn.style.marginTop = '15px';

      // Add click event
      trackerBtn.addEventListener('click', function () {
        trackerBtn.textContent = 'Adding...';

        // Simple direct message to background.ts
        chrome.runtime.sendMessage(
          {
            action: 'createTracker',
            trackerData: {
              title: animeTitle,
              description: synopsis,
              imageUrl: imageUrl,
              mediaUrl: mediaUrl,
              currentStatus: 'plan_to_watch',
            },
          },
          function (response) {
            if (response && response.success) {
              trackerBtn.textContent = 'Added to Tracker!';
              trackerBtn.style.backgroundColor = '#34a853';

              setTimeout(function () {
                trackerBtn.textContent = 'Add to HarmOni Tracker';
                trackerBtn.style.backgroundColor = '#4285f4';
              }, 3000);
            } else {
              trackerBtn.textContent = 'Failed to add';
              trackerBtn.style.backgroundColor = '#ea4335';

              setTimeout(function () {
                trackerBtn.textContent = 'Add to HarmOni Tracker';
                trackerBtn.style.backgroundColor = '#4285f4';
              }, 3000);
            }
          }
        );
      });

      // Add button to leftside
      leftside.appendChild(trackerBtn);
      console.log('HarmOni: Added tracker button to leftside');
      return;
    }

    console.log('HarmOni: Could not find any suitable container');
    return;
  }

  // Create tracker button
  const trackerBtn = document.createElement('button');
  trackerBtn.className = 'harmoni-tracker-btn';
  trackerBtn.textContent = 'Add to HarmOni Tracker';

  // Add click event
  trackerBtn.addEventListener('click', function () {
    trackerBtn.textContent = 'Adding...';

    chrome.runtime.sendMessage(
      {
        action: 'createTracker',
        trackerData: {
          title: animeTitle,
          description: synopsis,
          imageUrl: imageUrl,
          mediaUrl: mediaUrl,
          currentStatus: 'plan_to_watch',
        },
      },
      function (response) {
        if (response && response.success) {
          trackerBtn.textContent = 'Added to Tracker!';
          trackerBtn.style.backgroundColor = '#34a853';

          setTimeout(function () {
            trackerBtn.textContent = 'Add to HarmOni Tracker';
            trackerBtn.style.backgroundColor = '#4285f4';
          }, 3000);
        } else {
          trackerBtn.textContent = 'Failed to add';
          trackerBtn.style.backgroundColor = '#ea4335';

          setTimeout(function () {
            trackerBtn.textContent = 'Add to HarmOni Tracker';
            trackerBtn.style.backgroundColor = '#4285f4';
          }, 3000);
        }
      }
    );
  });

  // Add button to container
  buttonContainer.appendChild(trackerBtn);
  console.log('HarmOni: Added tracker button to container');
}

// Auto-initialize on anime pages
if (window.location.href.match(/\/anime\/\d+\//)) {
  console.log('HarmOni: Auto-initializing on anime page');
  setTimeout(addTrackerButton, 1000);
}

// Initialize the feature when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCoverDownload);
} else {
  initCoverDownload();
}

export {};
