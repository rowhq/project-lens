/**
 * Offline Storage Utility
 * Uses IndexedDB for persisting data offline
 */

import { useState, useEffect } from "react";

const DB_NAME = "truplat-offline";
const DB_VERSION = 1;

// Store names
export const STORES = {
  EARNINGS: "earnings",
  JOBS: "jobs",
  PROFILE: "profile",
  QUEUE: "sync-queue",
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Open or create the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.EARNINGS)) {
        db.createObjectStore(STORES.EARNINGS, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORES.JOBS)) {
        const jobsStore = db.createObjectStore(STORES.JOBS, { keyPath: "id" });
        jobsStore.createIndex("status", "status", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.PROFILE)) {
        db.createObjectStore(STORES.PROFILE, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORES.QUEUE)) {
        const queueStore = db.createObjectStore(STORES.QUEUE, {
          keyPath: "id",
          autoIncrement: true,
        });
        queueStore.createIndex("type", "type", { unique: false });
        queueStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });

  return dbPromise;
}

/**
 * Get data from a store
 */
export async function getData<T>(
  storeName: StoreName,
  key: string,
): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.data) {
          // Check if data is expired (24 hours)
          const expiry = result.expiresAt || 0;
          if (Date.now() > expiry) {
            resolve(null);
          } else {
            resolve(result.data as T);
          }
        } else {
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.error("IndexedDB getData error:", error);
    return null;
  }
}

/**
 * Save data to a store
 */
export async function setData<T>(
  storeName: StoreName,
  key: string,
  data: T,
  ttlMs: number = 24 * 60 * 60 * 1000, // Default 24 hours
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put({
        key,
        data,
        updatedAt: Date.now(),
        expiresAt: Date.now() + ttlMs,
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("IndexedDB setData error:", error);
  }
}

/**
 * Delete data from a store
 */
export async function deleteData(
  storeName: StoreName,
  key: string,
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("IndexedDB deleteData error:", error);
  }
}

/**
 * Get all data from a store
 */
export async function getAllData<T>(storeName: StoreName): Promise<T[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result || [];
        // Filter out expired items and extract data
        const validData = results
          .filter((item) => !item.expiresAt || Date.now() < item.expiresAt)
          .map((item) => item.data as T);
        resolve(validData);
      };
    });
  } catch (error) {
    console.error("IndexedDB getAllData error:", error);
    return [];
  }
}

/**
 * Clear all data from a store
 */
export async function clearStore(storeName: StoreName): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("IndexedDB clearStore error:", error);
  }
}

/**
 * Add item to sync queue (for offline actions)
 */
export async function addToSyncQueue(
  type: string,
  payload: unknown,
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.QUEUE, "readwrite");
      const store = transaction.objectStore(STORES.QUEUE);
      const request = store.add({
        type,
        payload,
        createdAt: Date.now(),
        attempts: 0,
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("IndexedDB addToSyncQueue error:", error);
  }
}

/**
 * Get all items from sync queue
 */
export async function getSyncQueue(): Promise<
  Array<{
    id: number;
    type: string;
    payload: unknown;
    createdAt: number;
    attempts: number;
  }>
> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.QUEUE, "readonly");
      const store = transaction.objectStore(STORES.QUEUE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  } catch (error) {
    console.error("IndexedDB getSyncQueue error:", error);
    return [];
  }
}

/**
 * Remove item from sync queue
 */
export async function removeFromSyncQueue(id: number): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.QUEUE, "readwrite");
      const store = transaction.objectStore(STORES.QUEUE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("IndexedDB removeFromSyncQueue error:", error);
  }
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * Hook to track online/offline status
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => {
    if (typeof window === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}
