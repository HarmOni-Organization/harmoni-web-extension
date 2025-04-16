export interface CreatePromptDto {
  title?: string;
  content: string;
  tags?: string[];
}

export interface UpdatePromptDto {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface GetPromptDto {
  promptId: string;
}

export interface GetUserPromptsDto {
  userId: string;
}

export interface PromptResponseDto {
  promptId: string;
  title: string;
  content: string;
  userId: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
