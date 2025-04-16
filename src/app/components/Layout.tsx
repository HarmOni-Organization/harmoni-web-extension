import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks';
import { selectIsAuthenticated, logout } from '../features/auth/authSlice';
import { useUI } from '../uiContext';
import { useFeatures } from '../featureRegistry';
import { HiMenuAlt2, HiX, HiLogout } from 'react-icons/hi';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { activeTab, setActiveTab, sidebarExpanded, setSidebarExpanded } = useUI();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { features } = useFeatures();
  const dispatch = useAppDispatch();

  // Set first available feature as active tab if current tab doesn't exist
  useEffect(() => {
    if (features.length > 0 && !features.some((f) => f.id === activeTab)) {
      setActiveTab(features[0].id as any);
    }
  }, [features, activeTab, setActiveTab]);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full flex flex-col bg-white">
        <header className="p-4 bg-white shadow-sm border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-indigo-600">HarmOni</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          {/* Auth pages will be rendered here */}
          {children}
        </main>
      </div>
    );
  }

  const activeFeature = features.find((feature) => feature.id === activeTab);

  return (
    <div className="w-full flex flex-col bg-white h-[500px]">
      <header className="p-4 bg-white shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="text-indigo-600 hover:text-indigo-800"
              aria-label="Toggle sidebar"
            >
              {sidebarExpanded ? <HiX size={24} /> : <HiMenuAlt2 size={24} />}
            </button>
            <h1 className="text-xl font-bold text-indigo-600">HarmOni</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded border border-gray-300 transition-colors"
            aria-label="Logout"
          >
            <HiLogout className="text-gray-500" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`bg-white border-r border-gray-200 transition-all duration-300 ${
            sidebarExpanded ? 'w-64' : 'w-16'
          } flex flex-col`}
        >
          {features.map((feature) => (
            <button
              key={feature.id}
              className={`flex items-center py-3 px-4 transition-colors ${
                activeTab === feature.id
                  ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(feature.id as any)}
              aria-label={feature.label}
              aria-current={activeTab === feature.id ? 'page' : undefined}
            >
              <span className="flex-shrink-0">{feature.icon}</span>
              {sidebarExpanded && (
                <span className="ml-3 truncate transition-opacity duration-300 opacity-100">
                  {feature.label}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="w-full h-full">
            {activeFeature?.id === 'promptSaver' ? children : activeFeature?.component}
          </div>
        </main>
      </div>
    </div>
  );
};
