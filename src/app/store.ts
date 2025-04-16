import { wrapStore } from '@eduardoac-skimlinks/webext-redux';
import { combineReducers, configureStore, type Action, type ThunkAction } from '@reduxjs/toolkit';
import { webExtensionStorage } from '../utils/webExtensionStorage';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'reduxjs-toolkit-persist';
import type { WebStorage } from 'reduxjs-toolkit-persist/lib/types';

import authReducer from './features/auth/authSlice';
import counterReducer from './features/counter/counterSlice';
import promptReducer from './features/promptSaver/promptSlice';
import animeTrackerReducer from './features/animeTracker/animeTrackerSlice';

const persistConfig = {
  key: 'root',
  storage: webExtensionStorage as WebStorage,
};

const reducers = combineReducers({
  auth: authReducer,
  counter: counterReducer,
  prompt: promptReducer,
  animeTracker: animeTrackerReducer,
});

const persistedReducer: typeof reducers = persistReducer(persistConfig, reducers);
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const initializeWrappedStore = () => wrapStore(store);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;
