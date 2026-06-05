import { CACHE_TTL_MS } from './config.js';

const store = new Map();
const inflight = new Map();

export function getCached(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

export function setCached(key, data) {
  store.set(key, { data, ts: Date.now() });
}

export async function cached(key, fetcher) {
  const hit = getCached(key);
  if (hit != null) return hit;

  if (inflight.has(key)) return inflight.get(key);

  const promise = Promise.resolve()
    .then(fetcher)
    .then((data) => {
      setCached(key, data);
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

export function cacheKey(...parts) {
  return parts.filter(Boolean).join(':');
}