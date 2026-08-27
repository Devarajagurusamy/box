import { Category, Prompt, QuickToolLink, VaultSpace } from './types';

export interface DBStatus {
  connected: boolean;
  status: 'connected' | 'disconnected' | 'unconfigured' | 'error';
  database?: string;
  host?: string;
  message?: string;
}

// In-Memory Cache Store with TTL & In-Flight Request Deduplication
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 15000; // 15 seconds fast client-side TTL
const cache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

export function invalidateClientCache(scope?: VaultSpace) {
  if (scope) {
    for (const key of cache.keys()) {
      if (key.includes(`scope=${scope}`)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

let lastDbStatus: { data: DBStatus; timestamp: number } | null = null;

export async function checkDBStatus(): Promise<DBStatus> {
  const now = Date.now();
  if (lastDbStatus && now - lastDbStatus.timestamp < 10000) {
    return lastDbStatus.data;
  }

  const cacheKey = 'db-status';
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const request = (async () => {
    try {
      const res = await fetchWithTimeout('/api/status', { cache: 'no-store' }, 2500);
      if (!res.ok) {
        return { connected: false, status: 'error' as const, message: `HTTP ${res.status}` };
      }
      const data: DBStatus = await res.json();
      lastDbStatus = { data, timestamp: Date.now() };
      return data;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to reach API';
      const fallback: DBStatus = { connected: false, status: 'disconnected', message: errorMsg };
      lastDbStatus = { data: fallback, timestamp: Date.now() };
      return fallback;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, request);
  return request;
}

// Prompts API with caching & deduplication
export async function apiFetchPrompts(scope: VaultSpace = 'public', bypassCache = false): Promise<Prompt[] | null> {
  const cacheKey = `prompts?scope=${scope}`;
  const now = Date.now();

  if (!bypassCache) {
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const request = (async () => {
    try {
      const res = await fetchWithTimeout(`/api/prompts?scope=${scope}`, { cache: 'no-store' }, 3500);
      if (!res.ok) return null;
      const data: Prompt[] = await res.json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      return null;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, request);
  return request;
}

export async function apiSavePrompt(prompt: Prompt): Promise<boolean> {
  invalidateClientCache();
  try {
    const res = await fetchWithTimeout(`/api/prompts/${prompt.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt),
    }, 4000);
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiCreatePrompt(prompt: Partial<Prompt>): Promise<Prompt | null> {
  invalidateClientCache();
  try {
    const res = await fetchWithTimeout('/api/prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompt),
    }, 4000);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiToggleLikePrompt(id: string): Promise<{ success: boolean; isFavorite: boolean; likesCount?: number } | null> {
  invalidateClientCache();
  try {
    const res = await fetchWithTimeout(`/api/prompts/${id}/like`, {
      method: 'POST',
    }, 3000);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiDeletePrompt(id: string): Promise<boolean> {
  invalidateClientCache();
  try {
    const res = await fetchWithTimeout(`/api/prompts/${id}`, { method: 'DELETE' }, 3500);
    return res.ok;
  } catch {
    return false;
  }
}

// Categories API with caching & deduplication
export async function apiFetchCategories(scope: VaultSpace = 'public', bypassCache = false): Promise<Category[] | null> {
  const cacheKey = `categories?scope=${scope}`;
  const now = Date.now();

  if (!bypassCache) {
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const request = (async () => {
    try {
      const res = await fetchWithTimeout(`/api/categories?scope=${scope}`, { cache: 'no-store' }, 3500);
      if (!res.ok) return null;
      const data: Category[] = await res.json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      return null;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, request);
  return request;
}

export async function apiSaveCategory(category: Category): Promise<boolean> {
  invalidateClientCache();
  try {
    const res = await fetchWithTimeout(`/api/categories/${category.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    }, 4000);
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiDeleteCategory(id: string): Promise<boolean> {
  invalidateClientCache();
  try {
    const res = await fetchWithTimeout(`/api/categories/${id}`, { method: 'DELETE' }, 3500);
    return res.ok;
  } catch {
    return false;
  }
}

// Quick Links API with caching & deduplication
export async function apiFetchQuickLinks(scope: VaultSpace = 'public', bypassCache = false): Promise<QuickToolLink[] | null> {
  const cacheKey = `quick-links?scope=${scope}`;
  const now = Date.now();

  if (!bypassCache) {
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const request = (async () => {
    try {
      const res = await fetchWithTimeout(`/api/quick-links?scope=${scope}`, { cache: 'no-store' }, 3500);
      if (!res.ok) return null;
      const data: QuickToolLink[] = await res.json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch {
      return null;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, request);
  return request;
}

export async function apiSaveQuickLink(link: QuickToolLink): Promise<boolean> {
  invalidateClientCache();
  try {
    const res = await fetchWithTimeout('/api/quick-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link),
    }, 4000);
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiToggleLikeQuickLink(id: string): Promise<{ success: boolean; isFavorite: boolean; likesCount?: number } | null> {
  invalidateClientCache();
  try {
    const res = await fetchWithTimeout(`/api/quick-links/${id}/like`, {
      method: 'POST',
    }, 3000);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiDeleteQuickLink(id: string): Promise<boolean> {
  invalidateClientCache();
  try {
    const res = await fetchWithTimeout(`/api/quick-links/${id}`, { method: 'DELETE' }, 3500);
    return res.ok;
  } catch {
    return false;
  }
}

// Clear Database
export async function apiClearDatabase(): Promise<boolean> {
  invalidateClientCache();
  try {
    const res = await fetchWithTimeout('/api/vault/seed', { method: 'POST' }, 5000);
    return res.ok;
  } catch {
    return false;
  }
}
