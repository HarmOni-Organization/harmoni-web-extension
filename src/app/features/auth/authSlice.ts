import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import browser from 'webextension-polyfill';
import { loginUser, registerUser } from '../../../services/auth';
import type { User } from '../../../services/auth/_models';
import type { RootState } from '../../store';
import { logger } from '../../../utils/logger';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { emailOrUsername: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await loginUser(credentials);
      logger.log('user', user);

      // Store token in browser storage for API interceptor
      if (user.token) {
        await browser.storage.local.set({ authToken: user.token });
      }
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    registrationData: { username: string; password: string; email?: string },
    { rejectWithValue }
  ) => {
    try {
      const user = await registerUser(registrationData);
      // Store token in browser storage for API interceptor
      if (user.token) {
        await browser.storage.local.set({ authToken: user.token });
      }
      return user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      browser.storage.local.remove('authToken').catch((error) => {
        logger.error('Error removing auth token:', error);
      });
    },
    setAuthCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      browser.storage.local.set({ authToken: action.payload.token }).catch((error) => {
        logger.error('Error setting auth token:', error);
      });
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.token = action.payload.token || null;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.token = action.payload.token || null;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout, setAuthCredentials, clearError } = authSlice.actions;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
