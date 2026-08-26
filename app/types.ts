export type AIModelType =
  | 'ChatGPT'
  | 'Claude'
  | 'Gemini'
  | 'DeepSeek'
  | 'Midjourney'
  | 'Cursor'
  | 'General'
  | string;

export type VaultSpace = 'public' | 'personal';

export interface PromptLink {
  id: string;
  title: string;
  url: string;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  categoryId: string;
  tags: string[];
  model?: AIModelType;
  links: PromptLink[];
  isFavorite: boolean;
  copyCount: number;
  createdAt: string;
  updatedAt: string;
  userId?: string | null;
  isPublic?: boolean;
  authorName?: string;
  likedBy?: string[];
  originalPromptId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  userId?: string | null;
  isPublic?: boolean;
}

export interface QuickToolLink {
  id: string;
  name: string;
  url: string;
  iconName: string;
  category: string;
  description: string;
  userId?: string | null;
  isPublic?: boolean;
  authorName?: string;
  likedBy?: string[];
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
