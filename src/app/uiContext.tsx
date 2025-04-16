import React, { createContext, useState, useContext, useEffect } from 'react';

type FeatureId =
  | 'promptSaver'
  | 'watchTogether'
  | 'downloadManager'
  | 'subtitleGrabber'
  | 'animeTracker'
  | 'youtou';

interface UIContextType {
  activeTab: FeatureId;
  setActiveTab: React.Dispatch<React.SetStateAction<FeatureId>>;
  sidebarExpanded: boolean;
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<FeatureId>('promptSaver');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Load saved tab preference on mount
  useEffect(() => {
    const savedTab = localStorage.getItem('harmoni-active-tab') as FeatureId | null;
    if (savedTab) {
      setActiveTab(savedTab);
    }

    const savedSidebarState = localStorage.getItem('harmoni-sidebar-expanded');
    if (savedSidebarState !== null) {
      setSidebarExpanded(savedSidebarState === 'true');
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('harmoni-active-tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('harmoni-sidebar-expanded', String(sidebarExpanded));
  }, [sidebarExpanded]);

  return (
    <UIContext.Provider value={{ activeTab, setActiveTab, sidebarExpanded, setSidebarExpanded }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
