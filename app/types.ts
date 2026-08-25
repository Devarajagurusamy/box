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
  model?: string;
  links: PromptLink[];
  isFavorite: boolean;
  copyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
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

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
