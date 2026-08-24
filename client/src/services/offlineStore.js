/**
 * offlineStore.js
 *
 * A small IndexedDB wrapper used specifically by Public Mode to persist
 * the structured data a citizen has already viewed (village risk, safe
 * locations, safety guidance) so it remains available if they lose
 * connectivity. This is separate from the Workbox/Cache-API layer
 * (vite-plugin-pwa) which caches network *responses* — this store keeps
 * app-level structured records with a "lastSynced" timestamp so the UI
 * can clearly say when the data was last refreshed.
 */

const DB_NAME = "disaster-relocation-offline";
const DB_VERSION = 1;
const STORE = "public-cache";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveOffline(key, value) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ key, value, syncedAt: new Date().toISOString() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("[offlineStore] save failed", err);
    return false;
  }
}

export async function loadOffline(key) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[offlineStore] load failed", err);
    return null;
  }
}

export async function listOfflineKeys(prefix = "") {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAllKeys();
      req.onsuccess = () => resolve((req.result || []).filter((k) => k.startsWith(prefix)));
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[offlineStore] list failed", err);
    return [];
  }
}

/**
 * Fetch-and-cache helper: tries the network first (via the provided
 * fetcher function), saves the result to IndexedDB, and falls back to
 * the last cached copy if the network call fails (offline).
 */
export async function fetchWithOfflineFallback(key, fetcher) {
  try {
    const data = await fetcher();
    await saveOffline(key, data);
    return { data, fromCache: false, syncedAt: new Date().toISOString() };
  } catch (err) {
    const cached = await loadOffline(key);
    if (cached) {
      return { data: cached.value, fromCache: true, syncedAt: cached.syncedAt };
    }
    throw err;
  }
}
