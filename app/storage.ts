import { Category, Prompt, QuickToolLink } from './types';

export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_QUICK_LINKS: QuickToolLink[] = [];

export const INITIAL_PROMPTS: Prompt[] = [];

const STORAGE_KEYS = {
  PROMPTS: 'box_prompts_vault_v1',
  CATEGORIES: 'box_categories_vault_v1',
  QUICK_LINKS: 'box_quick_links_v1',
};

export function getStoredCategories(): Category[] {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!item) return [];
    return JSON.parse(item);
  } catch {
    return [];
  }
}

export function saveStoredCategories(categories: Category[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function getStoredPrompts(): Prompt[] {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem(STORAGE_KEYS.PROMPTS);
    if (!item) return [];
    return JSON.parse(item);
  } catch {
    return [];
  }
}

export function saveStoredPrompts(prompts: Prompt[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
}

export function getStoredQuickLinks(): QuickToolLink[] {
  if (typeof window === 'undefined') return [];
  try {
    const item = localStorage.getItem(STORAGE_KEYS.QUICK_LINKS);
    if (!item) return [];
    return JSON.parse(item);
  } catch {
    return [];
  }
}

export function saveStoredQuickLinks(links: QuickToolLink[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.QUICK_LINKS, JSON.stringify(links));
}

export function exportVaultJSON(): string {
  const data = {
    appName: 'BOX Prompt Vault',
    version: '1.0',
    exportDate: new Date().toISOString(),
    categories: getStoredCategories(),
    prompts: getStoredPrompts(),
    quickLinks: getStoredQuickLinks(),
  };
  return JSON.stringify(data, null, 2);
}

export function importVaultJSON(jsonString: string): { success: boolean; message: string; count?: number } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.prompts)) {
      return { success: false, message: 'Invalid JSON format: missing prompts array.' };
    }

    if (Array.isArray(parsed.categories)) {
      saveStoredCategories(parsed.categories);
    }
    if (Array.isArray(parsed.prompts)) {
      saveStoredPrompts(parsed.prompts);
    }
    if (Array.isArray(parsed.quickLinks)) {
      saveStoredQuickLinks(parsed.quickLinks);
    }

    return {
      success: true,
      message: `Imported ${parsed.prompts.length} prompts and ${parsed.categories?.length || 0} categories.`,
      count: parsed.prompts.length,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown parsing error';
    return { success: false, message: `Failed to import JSON: ${errorMsg}` };
  }
}

export function clearVaultData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.PROMPTS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.QUICK_LINKS);
}
