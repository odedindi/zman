'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { OfflineQueue, QueuedMutation } from '@/lib/yjs/offline-queue';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'pending' | 'error' | 'offline';

interface UseOfflineQueueReturn {
  pendingCount: number;
  mutations: QueuedMutation[];
  syncStatus: SyncStatus;
  lastSynced: string | null;
  isOnline: boolean;
  syncNow: () => Promise<void>;
  clearQueue: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DB_NAME = 'zman-offline-queue';
const STORE_NAME = 'mutations';

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

export function useOfflineQueue(entityId?: string): UseOfflineQueueReturn {
  const [pendingCount, setPendingCount] = useState(0);
  const [mutations, setMutations] = useState<QueuedMutation[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const queueRef = useRef<OfflineQueue | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    queueRef.current = new OfflineQueue(null);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('pending');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!queueRef.current) return;

    try {
      const [count, allMutations] = await Promise.all([
        queueRef.current.getPendingCount(entityId),
        offlineQueueDB.getAll(),
      ]);

      setPendingCount(count);
      setMutations(allMutations);
    } catch (error) {
      console.error('Failed to refresh offline queue:', error);
    }
  }, [entityId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const syncNow = useCallback(async () => {
    if (!queueRef.current || isProcessingRef.current || !isOnline) return;

    isProcessingRef.current = true;
    setSyncStatus('syncing');

    try {
      await queueRef.current.processQueue();
      setLastSynced(new Date().toLocaleTimeString());
      setSyncStatus('synced');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    } finally {
      isProcessingRef.current = false;
      await refresh();
    }
  }, [isOnline, refresh]);

  const clearQueue = useCallback(async () => {
    try {
      await offlineQueueDB.clear();
      setPendingCount(0);
      setMutations([]);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Failed to clear queue:', error);
    }
  }, []);

  return {
    pendingCount,
    mutations,
    syncStatus,
    lastSynced,
    isOnline,
    syncNow,
    clearQueue,
    refresh,
  };
}