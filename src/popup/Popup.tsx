import React from 'react';
import { Layout } from '../app/components/Layout';
import { Auth } from '../app/features/auth/Auth';
import { useAppSelector } from '../app/hooks';
import { selectIsAuthenticated } from '../app/features/auth/authSlice';
import { useUI } from '../app/uiContext';
import { useFeatures } from '../app/featureRegistry';

// Lazy load future feature components
// import { WatchTogether } from '../app/features/watchTogether/WatchTogether';
// import { DownloadManager } from '../app/features/downloadManager/DownloadManager';
// import { SubtitleGrabber } from '../app/features/subtitleGrabber/SubtitleGrabber';
// import { AnimeTracker } from '../app/features/animeTracker/AnimeTracker';

const Popup = () => {
  document.body.className = 'w-[700px]';
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { activeTab } = useUI();
  const { getFeature } = useFeatures();

  const renderActiveFeature = () => {
    if (!isAuthenticated) {
      return <Auth />;
    }

    const feature = getFeature(activeTab);
    return (
      feature?.component ?? <div className="p-4 text-center text-gray-500">Feature not found</div>
    );
  };

  return <Layout>{renderActiveFeature()}</Layout>;
};

export default Popup;
