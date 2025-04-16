import React from 'react';
import { featureRegistry } from './featureRegistry';
import { PromptSaver } from './features/promptSaver/PromptSaver';
import { WatchTogether } from './features/watchTogether/WatchTogether';
import YouTouSettings from './features/youtou/YouTouSettings';
import { MALDownloader } from './features/malDownloader';
import { AnimeTracker } from './features/animeTracker';
import {
  MdOutlineSave,
  MdOutlineGroupWork,
  MdFileDownload,
  MdSubtitles,
  MdMovie,
  MdYoutubeSearchedFor,
  MdImage,
} from 'react-icons/md';
import { IconWrapper } from './components/IconWrapper';

// Register all available features
export function registerFeatures(): void {
  // Register the Prompt Saver feature
  featureRegistry.register({
    id: 'promptSaver',
    label: 'Prompt Saver',
    icon: <IconWrapper icon={MdOutlineSave} className="text-xl" />,
    component: <PromptSaver />,
    order: 0,
  });
  // Register the YouTou feature
  featureRegistry.register({
    id: 'youtou',
    label: 'YouTou Settings',
    icon: <IconWrapper icon={MdYoutubeSearchedFor} className="text-xl" />,
    component: <YouTouSettings />,
    order: 1,
  });
  // Register the Watch Together feature
  featureRegistry.register({
    id: 'watchTogether',
    label: 'Watch Together',
    icon: <IconWrapper icon={MdOutlineGroupWork} className="text-xl" />,
    component: <WatchTogether />,
    order: 2,
  });

  // Register the MAL Downloader feature
  featureRegistry.register({
    id: 'malDownloader',
    label: 'MAL Cover Downloader',
    icon: <IconWrapper icon={MdImage} className="text-xl" />,
    component: <MALDownloader />,
    order: 3,
  });

  // Register the Anime Tracker feature
  // featureRegistry.register({
  //   id: 'animeTracker',
  //   label: 'Anime Tracker',
  //   icon: <IconWrapper icon={MdMovie} className="text-xl" />,
  //   component: <AnimeTracker />,
  //   order: 4,
  // });

  // Coming soon features
  featureRegistry.register({
    id: 'downloadManager',
    label: 'Download Manager',
    icon: <IconWrapper icon={MdFileDownload} className="text-xl" />,
    component: <div className="p-4 text-center text-gray-500">Coming soon</div>,
    order: 5,
  });

  featureRegistry.register({
    id: 'subtitleGrabber',
    label: 'Subtitle Grabber',
    icon: <IconWrapper icon={MdSubtitles} className="text-xl" />,
    component: <div className="p-4 text-center text-gray-500">Coming soon</div>,
    order: 6,
  });
}

// Initialize features on app startup
registerFeatures();
