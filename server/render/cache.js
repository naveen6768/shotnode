/**
 * Tiny LRU: max entries, per-entry TTL. Keyed by request path.
 */
export function createCache({ max = 500, ttlMs = 60_000, now = () => Date.now() } = {}) {
  const store = new Map();
  return {
    get(key) {
      const hit = store.get(key);
      if (!hit) return null;
      if (now() - hit.at > ttlMs) {
        store.delete(key);
        return null;
      }
      store.delete(key);
      store.set(key, hit);
      return hit.value;
    },
    set(key, value) {
      if (store.has(key)) store.delete(key);
      store.set(key, { value, at: now() });
      while (store.size > max) {
        const oldest = store.keys().next();
        if (oldest.done) break;
        store.delete(oldest.value);
      }
    },
    clear() {
      store.clear();
    },
    get size() {
      return store.size;
    },
  };
}
