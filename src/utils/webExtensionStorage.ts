import browser from 'webextension-polyfill';
import { logger } from './logger';

// Create a WebStorage compatible implementation for browser.storage.local
export const webExtensionStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const result = await browser.storage.local.get(key);
      return result[key] || null;
    } catch (error) {
      logger.error('Error getting item from storage:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await browser.storage.local.set({ [key]: value });
    } catch (error) {
      logger.error('Error setting item in storage:', error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await browser.storage.local.remove(key);
    } catch (error) {
      logger.error('Error removing item from storage:', error);
    }
  },
};
