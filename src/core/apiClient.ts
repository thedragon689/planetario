export interface FetchRetryOptions {
  retries?: number;
  baseDelayMs?: number;
  ttlMs?: number;
  init?: RequestInit;
}

interface CacheEntry<T> {
  expires: number;
  promise: Promise<T>;
}

const cache = new Map<string, CacheEntry<unknown>>();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildCacheKey(url: string, init?: RequestInit) {
  return `${init?.method || 'GET'}:${url}:${init?.body || ''}`;
}

/**
 * Fetch JSON con retry esponenziale e cache TTL opzionale.
 */
export async function fetchJson<T>(
  url: string | URL,
  { retries = 2, baseDelayMs = 400, ttlMs = 0, init }: FetchRetryOptions = {}
): Promise<T> {
  const href = String(url);
  const cacheKey = buildCacheKey(href, init);

  if (ttlMs > 0) {
    const hit = cache.get(cacheKey) as CacheEntry<T> | undefined;
    if (hit && hit.expires > Date.now()) return hit.promise;
  }

  const run = async (): Promise<T> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(href, init);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${href}`);
        }
        return (await response.json()) as T;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < retries) {
          await sleep(baseDelayMs * 2 ** attempt);
        }
      }
    }

    throw lastError ?? new Error(`Fetch failed: ${href}`);
  };

  const promise = run();

  if (ttlMs > 0) {
    cache.set(cacheKey, { expires: Date.now() + ttlMs, promise });
  }

  return promise;
}

export function clearApiCache() {
  cache.clear();
}
