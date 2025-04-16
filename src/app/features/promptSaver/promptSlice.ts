import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import promptService from '../../../services/promptService';
import { PromptResponseDto } from '../../../types/prompt.types';
import { logger } from '../../../utils/logger';
import { isFuzzyMatch } from '../../../utils/string';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PromptState {
  prompts: Prompt[];
  searchTerm: string;
  isAddModalOpen: boolean;
  editingPrompt: Prompt | null;
  loading: boolean;
  error: string | null;
}

const initialState: PromptState = {
  prompts: [],
  searchTerm: '',
  isAddModalOpen: false,
  editingPrompt: null,
  loading: false,
  error: null,
};

// Map the API response to our internal Prompt interface
const mapPromptFromResponse = (prompt: PromptResponseDto): Prompt => ({
  id: prompt.promptId,
  title: prompt.title,
  content: prompt.content,
  tags: prompt.tags,
  createdAt: prompt.createdAt,
  updatedAt: prompt.updatedAt,
});

// Async thunks for API operations
export const fetchPrompts = createAsyncThunk(
  'prompt/fetchPrompts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await promptService.getUserPrompts();
      logger.log('response', response);

      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch prompts');
    }
  }
);

export const createPrompt = createAsyncThunk(
  'prompt/createPrompt',
  async (promptData: { title: string; content: string; tags: string[] }, { rejectWithValue }) => {
    try {
      const response = await promptService.createPrompt(promptData);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to create prompt');
    }
  }
);

export const updatePromptAsync = createAsyncThunk(
  'prompt/updatePromptAsync',
  async (
    {
      promptId,
      promptData,
    }: { promptId: string; promptData: { title?: string; content?: string; tags?: string[] } },
    { rejectWithValue }
  ) => {
    try {
      const response = await promptService.updatePrompt(promptId, promptData);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to update prompt');
    }
  }
);

export const deletePromptAsync = createAsyncThunk(
  'prompt/deletePromptAsync',
  async (promptId: string, { rejectWithValue }) => {
    try {
      await promptService.deletePrompt(promptId);
      return promptId;
    } catch (error) {
      return rejectWithValue('Failed to delete prompt');
    }
  }
);

export const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setAddModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddModalOpen = action.payload;
      if (!action.payload) {
        state.editingPrompt = null;
      }
    },
    setEditingPrompt: (state, action: PayloadAction<Prompt | null>) => {
      state.editingPrompt = action.payload;
      state.isAddModalOpen = action.payload !== null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch prompts
      .addCase(fetchPrompts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrompts.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts = action.payload.map(mapPromptFromResponse);
      })
      .addCase(fetchPrompts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create prompt
      .addCase(createPrompt.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPrompt.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts.push(mapPromptFromResponse(action.payload));
      })
      .addCase(createPrompt.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update prompt
      .addCase(updatePromptAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePromptAsync.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPrompt = mapPromptFromResponse(action.payload);
        const index = state.prompts.findIndex((prompt) => prompt.id === updatedPrompt.id);
        if (index !== -1) {
          state.prompts[index] = updatedPrompt;
        }
      })
      .addCase(updatePromptAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete prompt
      .addCase(deletePromptAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePromptAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.prompts = state.prompts.filter((prompt) => prompt.id !== action.payload);
      })
      .addCase(deletePromptAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchTerm, setAddModalOpen, setEditingPrompt } = promptSlice.actions;

export const selectPrompts = (state: RootState) => state.prompt.prompts;
export const selectFilteredPrompts = (state: RootState) => {
  const searchTerm = state.prompt.searchTerm.toLowerCase();
  if (!searchTerm) return state.prompt.prompts;

  return state.prompt.prompts.filter(
    (prompt) =>
      isFuzzyMatch(prompt.title.toLowerCase(), searchTerm) ||
      isFuzzyMatch(prompt.content.toLowerCase(), searchTerm) ||
      prompt.tags.some((tag) => isFuzzyMatch(tag.toLowerCase(), searchTerm))
  );
};
export const selectSearchTerm = (state: RootState) => state.prompt.searchTerm;
export const selectIsAddModalOpen = (state: RootState) => state.prompt.isAddModalOpen;
export const selectEditingPrompt = (state: RootState) => state.prompt.editingPrompt;
export const selectLoading = (state: RootState) => state.prompt.loading;
export const selectError = (state: RootState) => state.prompt.error;

export default promptSlice.reducer;
