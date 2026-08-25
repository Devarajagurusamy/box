export interface PromptLink {
  id: string;
  title: string;
  url: string;
}

export type AIModelType = 
  | 'ChatGPT'
  | 'Claude'
  | 'Gemini'
  | 'DeepSeek'
  | 'Midjourney'
  | 'Cursor'
  | 'General';

export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  categoryId: string;
  tags: string[];
  model: AIModelType;
  links: PromptLink[];
  isFavorite: boolean;
  copyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // lucide icon identifier
  color: string; // tailwind color token / hex / accent class
  description: string;
}

export interface QuickToolLink {
  id: string;
  name: string;
  url: string;
  iconName: string;
  category: string;
  description: string;
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: string | null; // null = all
  selectedModel: AIModelType | 'ALL';
  onlyFavorites: boolean;
  selectedTag: string | null;
  sortBy: 'recent' | 'popular' | 'alpha';
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
