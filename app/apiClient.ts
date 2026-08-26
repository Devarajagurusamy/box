import { Category, Prompt, QuickToolLink, VaultSpace } from './types';

export interface DBStatus {
  connected: boolean;
  status: 'connected' | 'disconnected' | 'unconfigured' | 'error';
  database?: string;
  host?: string;
  message?: string;
}

export async function checkDBStatus(): Promise<DBStatus> {
  try {
    const res = await fetch('/api/status', { cache: 'no-store' });
    if (!res.ok) {
      return { connected: false, status: 'error', message: `HTTP ${res.status}` };
    }
    return await res.json();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to reach API';
    return { connected: false, status: 'disconnected', message: errorMsg };
  }
}

// Prompts API
export async function apiFetchPrompts(scope: VaultSpace = 'public'): Promise<Prompt[] | null> {
  try {
    const res = await fetch(`/api/prompts?scope=${scope}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiSavePrompt(prompt: Prompt): Promise<boolean> {
  try {
    const res = await fetch(`/api/prompts/${prompt.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiCreatePrompt(prompt: Partial<Prompt>): Promise<Prompt | null> {
  try {
    const res = await fetch('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiToggleLikePrompt(id: string): Promise<{ success: boolean; isFavorite: boolean; likesCount?: number } | null> {
  try {
    const res = await fetch(`/api/prompts/${id}/like`, {
      method: 'POST',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiDeletePrompt(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

// Categories API
export async function apiFetchCategories(scope: VaultSpace = 'public'): Promise<Category[] | null> {
  try {
    const res = await fetch(`/api/categories?scope=${scope}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiSaveCategory(category: Category): Promise<boolean> {
  try {
    const res = await fetch(`/api/categories/${category.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiDeleteCategory(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

// Quick Links API
export async function apiFetchQuickLinks(scope: VaultSpace = 'public'): Promise<QuickToolLink[] | null> {
  try {
    const res = await fetch(`/api/quick-links?scope=${scope}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiSaveQuickLink(link: QuickToolLink): Promise<boolean> {
  try {
    const res = await fetch('/api/quick-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiDeleteQuickLink(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/quick-links/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

// Clear Database
export async function apiClearDatabase(): Promise<boolean> {
  try {
    const res = await fetch('/api/vault/seed', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}
