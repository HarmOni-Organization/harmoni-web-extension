import harmOniApi from './harmOniApi';
import {
  CreatePromptDto,
  UpdatePromptDto,
  GetPromptDto,
  GetUserPromptsDto,
  PromptResponseDto,
} from '../types/prompt.types';

export const promptService = {
  /**
   * Create a new prompt
   */
  createPrompt: async (prompt: CreatePromptDto): Promise<PromptResponseDto> => {
    const response = await harmOniApi.post('/prompts', prompt);
    return response.data;
  },

  /**
   * Get all prompts for the current user
   */
  getUserPrompts: async (): Promise<PromptResponseDto[]> => {
    const response = await harmOniApi.get('/prompts');
    return response.data;
  },

  /**
   * Get a specific prompt by ID
   */
  getPrompt: async ({ promptId }: GetPromptDto): Promise<PromptResponseDto> => {
    const response = await harmOniApi.get(`/prompts/${promptId}`);
    return response.data;
  },

  /**
   * Update an existing prompt
   */
  updatePrompt: async (promptId: string, prompt: UpdatePromptDto): Promise<PromptResponseDto> => {
    const response = await harmOniApi.put(`/prompts/${promptId}`, prompt);
    return response.data;
  },

  /**
   * Delete a prompt
   */
  deletePrompt: async (promptId: string): Promise<void> => {
    await harmOniApi.delete(`/prompts/${promptId}`);
  },

  /**
   * Get all prompts for a specific user (admin only)
   */
  getPromptsByUser: async ({ userId }: GetUserPromptsDto): Promise<PromptResponseDto[]> => {
    const response = await harmOniApi.get(`/prompts/user/${userId}`);
    return response.data;
  },
};

export default promptService;
