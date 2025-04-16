import React, { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';

interface YouTouSettings {
  autoShortsScroll: boolean;
  hideSections: boolean;
  speedMemory: boolean;
  autoSubtitleDownloader: boolean;
}

export const YouTouSettings: React.FC = () => {
  const [settings, setSettings] = useState<YouTouSettings>({
    autoShortsScroll: true,
    hideSections: true,
    speedMemory: true,
    autoSubtitleDownloader: true,
  });

  const [status, setStatus] = useState<string>('');

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await browser.storage.sync.get('youTouSettings');
        if (result.youTouSettings) {
          setSettings(result.youTouSettings);
        }
      } catch (error) {
        console.error('Error loading settings', error);
      }
    };

    loadSettings();
  }, []);

  // Handle toggle changes
  const handleToggle = async (feature: keyof YouTouSettings) => {
    const newSettings = {
      ...settings,
      [feature]: !settings[feature],
    };
    setSettings(newSettings);

    try {
      await browser.storage.sync.set({ youTouSettings: newSettings });

      // Notify content scripts of the settings change
      const tabs = await browser.tabs.query({ url: '*://*.youtube.com/*' });
      tabs.forEach((tab) => {
        if (tab.id) {
          browser.tabs.sendMessage(tab.id, {
            type: 'YOUTOU_SETTINGS_UPDATED',
            settings: newSettings,
          });
        }
      });

      setStatus('Settings saved!');
      setTimeout(() => setStatus(''), 2000);
    } catch (error) {
      console.error('Error saving settings', error);
      setStatus('Error saving settings');
      setTimeout(() => setStatus(''), 2000);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">YouTou Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Auto Shorts Scroller</h3>
            <p className="text-sm text-gray-500">
              Automatically scroll to the next short when one finishes
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoShortsScroll}
              onChange={() => handleToggle('autoShortsScroll')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Hide Sections</h3>
            <p className="text-sm text-gray-500">Hide recommended videos, shorts, and ads</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.hideSections}
              onChange={() => handleToggle('hideSections')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Speed Memory (per channel)</h3>
            <p className="text-sm text-gray-500">Remember playback speed for each channel</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.speedMemory}
              onChange={() => handleToggle('speedMemory')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Auto Subtitle Downloader</h3>
            <p className="text-sm text-gray-500">Download subtitles in AR/EN with one click</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoSubtitleDownloader}
              onChange={() => handleToggle('autoSubtitleDownloader')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div> */}
      </div>

      {status && (
        <div className="mt-4 p-2 bg-green-100 text-green-800 rounded text-center">{status}</div>
      )}
    </div>
  );
};

export default YouTouSettings;
