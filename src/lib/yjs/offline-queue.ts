'use client';

import * as Y from 'yjs';

export interface QueuedMutation {
  id: string;
  entityId: string;
  type: 'create' | 'update' | 'delete';
  collection: 'schedule' | 'holidays' | 'exceptions';
  payload: { id: string; [key: string]: any };
  timestamp: number;
  retryCount: number;
}

const DB_NAME = 'zman-offline-queue';
const STORE_NAME = 'mutations';
const MAX_RETRIES = 5;

class OfflineQueueDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('entityId', 'entityId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async enqueue(mutation: QueuedMutation): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(mutation);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(): Promise<QueuedMutation[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByEntity(entityId: string): Promise<QueuedMutation[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('entityId');
      const request = index.getAll(entityId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async remove(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async update(mutation: QueuedMutation): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(mutation);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

const offlineQueueDB = new OfflineQueueDB();

export class OfflineQueue {
  private wsProvider: any = null;
  private isProcessing = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor(wsProvider: any = null) {
    this.wsProvider = wsProvider;
  }

  setWebsocketProvider(wsProvider: any): void {
    this.wsProvider = wsProvider;
  }

  async enqueue(
    entityId: string,
    type: 'create' | 'update' | 'delete',
    collection: 'schedule' | 'holidays' | 'exceptions',
    payload: { id: string; [key: string]: any }
  ): Promise<string> {
    const mutation: QueuedMutation = {
      id: crypto.randomUUID(),
      entityId,
      type,
      collection,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await offlineQueueDB.enqueue(mutation);
    await this.registerBackgroundSync();
    return mutation.id;
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing || !this.wsProvider) return;
    
    this.isProcessing = true;
    
    try {
      const mutations = await offlineQueueDB.getAll();
      
      for (const mutation of mutations) {
        if (mutation.retryCount >= MAX_RETRIES) {
          await offlineQueueDB.remove(mutation.id);
          continue;
        }

        const success = await this.applyMutation(mutation);
        
        if (success) {
          await offlineQueueDB.remove(mutation.id);
        } else {
          mutation.retryCount++;
          await offlineQueueDB.update(mutation);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async applyMutation(mutation: QueuedMutation): Promise<boolean> {
    if (!this.wsProvider || !this.wsProvider.doc) return false;

    try {
      const { doc } = this.wsProvider;
      const collection = doc.getMap(mutation.collection) || doc.getArray(mutation.collection);

      switch (mutation.type) {
        case 'create':
          if (collection instanceof Y.Map) {
            collection.set(mutation.payload.id, mutation.payload);
          } else if (collection instanceof Y.Array) {
            collection.push([mutation.payload]);
          }
          break;
        case 'update':
          if (collection instanceof Y.Map) {
            const existing = collection.get(mutation.payload.id);
            if (existing) {
              collection.set(mutation.payload.id, { ...existing, ...mutation.payload });
            }
          }
          break;
        case 'delete':
          if (collection instanceof Y.Map) {
            collection.delete(mutation.payload.id);
          } else if (collection instanceof Y.Array) {
            const index = collection.toArray().findIndex(
              (item: any) => item.id === mutation.payload.id
            );
            if (index >= 0) collection.delete(index, 1);
          }
          break;
      }

      return true;
    } catch (error) {
      console.error('Failed to apply mutation:', error);
      return false;
    }
  }

  async registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('zman-offline-sync');
      } catch (error) {
        console.warn('Background sync registration failed:', error);
      }
    }
  }

  startAutoSync(intervalMs = 30000): void {
    if (this.syncInterval) return;
    
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.processQueue();
      }
    }, intervalMs);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async getPendingCount(entityId?: string): Promise<number> {
    if (entityId) {
      const mutations = await offlineQueueDB.getByEntity(entityId);
      return mutations.length;
    }
    const mutations = await offlineQueueDB.getAll();
    return mutations.length;
  }
}