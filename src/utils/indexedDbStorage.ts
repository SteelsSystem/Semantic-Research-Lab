/**
 * VaporSphere IndexedDB Storage Engine
 * High-capacity, persistent local storage for Research Cases, vector memory,
 * and audio blobs without hitting localStorage 5MB quota constraints.
 */

import { ResearchCase } from '../types/cognitive';

const DB_NAME = 'vaporsphere_db';
const DB_VERSION = 1;
const STORE_CASES = 'research_cases';
const STORE_AUDIO = 'audio_cache';

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const req = window.indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_CASES)) {
        db.createObjectStore(STORE_CASES, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO);
      }
    };

    req.onsuccess = (e) => {
      dbInstance = (e.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    req.onerror = () => {
      reject(req.error || new Error('Failed to open IndexedDB'));
    };
  });

  return dbPromise;
}

export class IndexedDbStorage {
  /**
   * Persists all cases into IndexedDB (can store large transcripts and rich analysis safely)
   */
  static async saveAllCases(cases: ResearchCase[]): Promise<void> {
    try {
      const db = await getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_CASES], 'readwrite');
        const store = tx.objectStore(STORE_CASES);
        for (const c of cases) {
          store.put(c);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('IndexedDB saveAllCases warning:', err);
    }
  }

  /**
   * Loads all cases from IndexedDB
   */
  static async loadAllCases(): Promise<ResearchCase[]> {
    try {
      const db = await getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_CASES], 'readonly');
        const store = tx.objectStore(STORE_CASES);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('IndexedDB loadAllCases warning:', err);
      return [];
    }
  }

  /**
   * Stores synthesized audio in IndexedDB cache to prevent re-fetching without bloating localStorage
   */
  static async setAudio(key: string, base64: string): Promise<void> {
    try {
      const db = await getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_AUDIO], 'readwrite');
        const store = tx.objectStore(STORE_AUDIO);
        store.put(base64, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('IndexedDB setAudio warning:', err);
    }
  }

  /**
   * Retrieves cached audio by message key
   */
  static async getAudio(key: string): Promise<string | null> {
    try {
      const db = await getDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_AUDIO], 'readonly');
        const store = tx.objectStore(STORE_AUDIO);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      return null;
    }
  }
}
