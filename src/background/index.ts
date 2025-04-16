import browser from 'webextension-polyfill';
import store, { initializeWrappedStore } from '../app/store';
import { logger } from '../utils/logger';
import { addTracker } from '../app/features/animeTracker/animeTrackerSlice';

// Initialize the wrapped store for Redux communication
initializeWrappedStore();

// Show welcome page on new install
browser.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const url = browser.runtime.getURL('welcome/welcome.html');
    await browser.tabs.create({ url });
  }
});

// Message handling for the extension
browser.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
  logger.log('Background script received message:', message);

  // Handle MAL cover download message
  if (message.action === 'malCoverDownloaded') {
    logger.log('MAL cover downloaded:', message.title);
    browser.runtime.sendMessage(message).catch((err) => {
      logger.error('Error relaying download message:', err);
    });
    sendResponse({ success: true });
    return true;
  }

  // Handle tracker creation
  if (message.action === 'createTracker') {
    logger.log('Creating tracker:', message.trackerData);

    try {
      // Use the Redux store to create the tracker
      store
        .dispatch(addTracker(message.trackerData))
        .then((result: any) => {
          // Check if the action was fulfilled or rejected
          if (result.meta && result.meta.requestStatus === 'fulfilled') {
            logger.log('Tracker created successfully:', result.payload);
            sendResponse({ success: true, data: result.payload });
          } else {
            const errorMessage = result.error?.message || 'Failed to create tracker';
            logger.error('Failed to create tracker:', errorMessage);
            sendResponse({
              success: false,
              error: errorMessage,
            });
          }
        })
        .catch((error: any) => {
          logger.error('Error creating tracker:', error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        });

      return true; // Keep the message channel open for async response
    } catch (error: any) {
      logger.error('Error in tracker creation handler:', error);
      sendResponse({ success: false, error: 'Internal error' });
      return true;
    }
  }

  return true;
});

store.subscribe(() => {
  // access store state
  const state = store.getState();
  logger.log('state', state);
});
