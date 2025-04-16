import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';
import { logger } from '../../../utils/logger';
import {
  getAllTrackers,
  getTracker,
  createTracker,
  updateTracker as updateTrackerService,
  deleteTracker as deleteTrackerService,
  addCustomStatus,
  removeCustomStatus,
  getStats,
  getDefaultStatuses,
} from '../../../services/animeTracker/animeTrackerService';
import type {
  MediaTracker,
  MediaTrackerStats,
  CreateTrackerDto,
  UpdateTrackerDto,
} from '../../../services/animeTracker/_models';

// Define the state type
interface AnimeTrackerState {
  trackers: MediaTracker[];
  currentTracker: MediaTracker | null;
  stats: MediaTrackerStats | null;
  defaultStatuses: string[];
  currentStatus: string;
  status: 'idle' | 'loading' | 'failed' | 'succeeded';
  error: string | null;
}

// Initial state
const initialState: AnimeTrackerState = {
  trackers: [],
  currentTracker: null,
  stats: null,
  defaultStatuses: [],
  currentStatus: 'watching',
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchTrackers = createAsyncThunk(
  'animeTracker/fetchTrackers',
  async (status: string | undefined, { rejectWithValue }) => {
    try {
      return await getAllTrackers(status);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trackers');
    }
  }
);

export const fetchTracker = createAsyncThunk(
  'animeTracker/fetchTracker',
  async (id: string, { rejectWithValue }) => {
    try {
      return await getTracker(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tracker');
    }
  }
);

export const addTracker = createAsyncThunk(
  'animeTracker/addTracker',
  async (data: CreateTrackerDto, { rejectWithValue }) => {
    try {
      return await createTracker(data);
    } catch (error: any) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to add tracker');
    }
  }
);

export const editTracker = createAsyncThunk(
  'animeTracker/editTracker',
  async ({ id, updateData }: { id: string; updateData: UpdateTrackerDto }, { rejectWithValue }) => {
    try {
      return await updateTrackerService(id, updateData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tracker');
    }
  }
);

export const removeTracker = createAsyncThunk(
  'animeTracker/removeTracker',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteTrackerService(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete tracker');
    }
  }
);

export const addStatus = createAsyncThunk(
  'animeTracker/addStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      return await addCustomStatus(id, status);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add custom status');
    }
  }
);

export const deleteStatus = createAsyncThunk(
  'animeTracker/deleteStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      await removeCustomStatus(id, status);
      return { id, status };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove custom status');
    }
  }
);

export const fetchStats = createAsyncThunk(
  'animeTracker/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await getStats();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const fetchDefaultStatuses = createAsyncThunk(
  'animeTracker/fetchDefaultStatuses',
  async (_, { rejectWithValue }) => {
    try {
      return await getDefaultStatuses();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch default statuses');
    }
  }
);

// Update tracker thunk
export const updateTracker = createAsyncThunk(
  'animeTracker/updateTracker',
  async ({ id, data }: { id: string; data: UpdateTrackerDto }, { rejectWithValue }) => {
    try {
      return await updateTrackerService(id, data);
    } catch (error: any) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update tracker');
    }
  }
);

// Delete tracker thunk
export const deleteTracker = createAsyncThunk(
  'animeTracker/deleteTracker',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteTrackerService(id);
      return id;
    } catch (error: any) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete tracker');
    }
  }
);

// Slice
const animeTrackerSlice = createSlice({
  name: 'animeTracker',
  initialState,
  reducers: {
    setCurrentStatus: (state, action: PayloadAction<string>) => {
      state.currentStatus = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch trackers
      .addCase(fetchTrackers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTrackers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.trackers = action.payload;
      })
      .addCase(fetchTrackers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Fetch single tracker
      .addCase(fetchTracker.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTracker.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentTracker = action.payload;
      })
      .addCase(fetchTracker.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Add tracker
      .addCase(addTracker.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addTracker.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.trackers.push(action.payload);
      })
      .addCase(addTracker.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Edit tracker
      .addCase(editTracker.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(editTracker.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.trackers.findIndex((tracker) => tracker.id === action.payload.id);
        if (index !== -1) {
          state.trackers[index] = action.payload;
        }
        if (state.currentTracker?.id === action.payload.id) {
          state.currentTracker = action.payload;
        }
      })
      .addCase(editTracker.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Remove tracker
      .addCase(removeTracker.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(removeTracker.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.trackers = state.trackers.filter((tracker) => tracker.id !== action.payload);
        if (state.currentTracker?.id === action.payload) {
          state.currentTracker = null;
        }
      })
      .addCase(removeTracker.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Add custom status
      .addCase(addStatus.fulfilled, (state, action) => {
        const index = state.trackers.findIndex((tracker) => tracker.id === action.payload.id);
        if (index !== -1) {
          state.trackers[index] = action.payload;
        }
        if (state.currentTracker?.id === action.payload.id) {
          state.currentTracker = action.payload;
        }
      })

      // Delete custom status
      .addCase(deleteStatus.fulfilled, (state, action) => {
        const { id, status } = action.payload;
        const index = state.trackers.findIndex((tracker) => tracker.id === id);
        if (index !== -1) {
          state.trackers[index].customStatuses = state.trackers[index].customStatuses.filter(
            (s) => s !== status
          );
        }
        if (state.currentTracker?.id === id) {
          state.currentTracker.customStatuses = state.currentTracker.customStatuses.filter(
            (s) => s !== status
          );
        }
      })

      // Fetch stats
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })

      // Fetch default statuses
      .addCase(fetchDefaultStatuses.fulfilled, (state, action) => {
        state.defaultStatuses = action.payload;
      })

      // Update tracker
      .addCase(updateTracker.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateTracker.fulfilled, (state, action) => {
        const index = state.trackers.findIndex((tracker) => tracker.id === action.payload.id);
        if (index !== -1) {
          state.trackers[index] = action.payload;
        }
        state.status = 'succeeded';
      })
      .addCase(updateTracker.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // Delete tracker
      .addCase(deleteTracker.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteTracker.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.trackers = state.trackers.filter((tracker) => tracker.id !== action.payload);
        if (state.currentTracker?.id === action.payload) {
          state.currentTracker = null;
        }
      })
      .addCase(deleteTracker.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Export actions and reducer
export const { setCurrentStatus, clearError, setError } = animeTrackerSlice.actions;

// Selectors
export const selectTrackers = (state: RootState) => state.animeTracker.trackers;
export const selectCurrentTracker = (state: RootState) => state.animeTracker.currentTracker;
export const selectTrackerStats = (state: RootState) => state.animeTracker.stats;
export const selectDefaultStatuses = (state: RootState) => state.animeTracker.defaultStatuses;
export const selectCurrentStatus = (state: RootState) => state.animeTracker.currentStatus;
export const selectStatus = (state: RootState) => state.animeTracker.status;
export const selectError = (state: RootState) => state.animeTracker.error;

export default animeTrackerSlice.reducer;
