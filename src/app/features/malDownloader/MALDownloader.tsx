import React, { useState, useEffect } from 'react';
import { logger } from '../../../utils/logger';

interface DownloadHistoryItem {
  title: string;
  url: string;
  downloadedAt: string;
}

export default function MALDownloader() {
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [buttonStyle, setButtonStyle] = useState<'minimal' | 'standard'>('minimal');
  const [showText, setShowText] = useState(true);

  // Load settings from storage on component mount
  useEffect(() => {
    chrome.storage.sync.get(
      ['malDownloaderEnabled', 'malDownloaderButtonStyle', 'malDownloaderShowText'],
      (result) => {
        setIsEnabled(result.malDownloaderEnabled !== false);
        setButtonStyle(result.malDownloaderButtonStyle || 'minimal');
        setShowText(result.malDownloaderShowText !== false);
      }
    );

    // Load download history
    chrome.storage.local.get(['malDownloaderHistory'], (result) => {
      setHistory(result.malDownloaderHistory || []);
    });
  }, []);

  // Update storage and notify content script when settings change
  const saveSettings = (settings: any) => {
    chrome.storage.sync.set(settings);

    // Send message to content script to update settings
    chrome.tabs.query({ url: '*://*.myanimelist.net/*' }, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateMALDownloaderSettings',
            settings,
          });
        }
      });
    });
  };

  const handleEnableToggle = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    saveSettings({ malDownloaderEnabled: newEnabled });
  };

  const handleButtonStyleChange = (style: 'minimal' | 'standard') => {
    setButtonStyle(style);
    saveSettings({ malDownloaderButtonStyle: style });
  };

  const handleTextToggle = () => {
    const newShowText = !showText;
    setShowText(newShowText);
    saveSettings({ malDownloaderShowText: newShowText });
  };

  const handleClearHistory = () => {
    setHistory([]);
    chrome.storage.local.set({ malDownloaderHistory: [] });
  };

  // Listen for new downloads from content script
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.action === 'malCoverDownloaded') {
        const newItem: DownloadHistoryItem = {
          title: message.title,
          url: message.url,
          downloadedAt: new Date().toISOString(),
        };

        setHistory((prevHistory) => {
          const updatedHistory = [newItem, ...prevHistory].slice(0, 50); // Keep latest 50 downloads
          chrome.storage.local.set({ malDownloaderHistory: updatedHistory });
          return updatedHistory;
        });
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">MAL Cover Downloader</h2>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-500">{isEnabled ? 'Enabled' : 'Disabled'}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isEnabled}
                onChange={handleEnableToggle}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
          <div className="flex space-x-3">
            <button
              className={`px-3 py-1.5 text-sm rounded ${
                buttonStyle === 'minimal' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => handleButtonStyleChange('minimal')}
            >
              Minimal
            </button>
            <button
              className={`px-3 py-1.5 text-sm rounded ${
                buttonStyle === 'standard' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              onClick={() => handleButtonStyleChange('standard')}
            >
              Standard
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center">
            <input
              id="show-text"
              type="checkbox"
              checked={showText}
              onChange={handleTextToggle}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="show-text" className="ml-2 text-sm font-medium text-gray-700">
              Show &ldquo;Save&rdquo; text on buttons
            </label>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-md font-medium">Download History</h3>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-gray-500">No downloads yet</p>
        ) : (
          <div className="max-h-60 overflow-y-auto border rounded-md">
            {history.map((item, index) => (
              <div key={index} className="p-2 text-sm border-b last:border-b-0 hover:bg-gray-50">
                <div className="font-medium truncate">{item.title}</div>
                <div className="text-xs text-gray-500">
                  {new Date(item.downloadedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        <p className="text-sm text-gray-500 mb-2">
          This feature adds &ldquo;Save&rdquo; buttons to anime cover images on MyAnimeList,
          allowing you to download cover images for your collection.
        </p>
      </div>
    </div>
  );
}
