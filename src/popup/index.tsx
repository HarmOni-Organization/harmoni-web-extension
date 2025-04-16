import '../global.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { proxyStore } from '../app/proxyStore';
import { UIProvider } from '../app/uiContext';
import Popup from './Popup';

// Initialize features
import '../app/initFeatures';

proxyStore.ready().then(() => {
  createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <Provider store={proxyStore}>
        <UIProvider>
          <Popup />
        </UIProvider>
      </Provider>
    </React.StrictMode>
  );
});
