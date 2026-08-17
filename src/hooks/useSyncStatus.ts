'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useYjsDoc } from './useYjsDoc';
import { OfflineQueue } from '@/lib/yjs/offline-queue';

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'pending' | 'error' | 'offline';

interface SyncState {
  status: SyncStatus;
  lastSynced: string | null;
  pendingCount: number;
  isOnline: boolean;
}

export function useSyncStatus(entityId?: string): SyncState {
  const [state, setState] = useState<SyncState>({
    status: 'idle',
    lastSynced: null,
    pendingCount: 0,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  const { providers } = useYjsDoc(entityId || '');
  const syncHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true, status: 'pending' }));
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false, status: 'offline' }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!providers) return;

    const { websocketProvider } = providers;
    if (!websocketProvider) return;

    const updateConnectionStatus = () => {
      const isConnected = websocketProvider.wsconnected;
      setState((prev) => ({
        ...prev,
        status: isConnected ? (prev.pendingCount > 0 ? 'syncing' : 'synced') : 'offline',
      }));
    };

    const handleSync = () => {
      setState((prev) => ({
        ...prev,
        status: 'synced',
        lastSynced: new Date().toLocaleTimeString(),
        pendingCount: 0,
      }));
    };

    syncHandlerRef.current = handleSync;

    websocketProvider.on('status', updateConnectionStatus);
    websocketProvider.on('sync', handleSync);

    return () => {
      websocketProvider.off('status', updateConnectionStatus);
      if (syncHandlerRef.current) {
        websocketProvider.off('sync', syncHandlerRef.current);
      }
    };
  }, [providers]);

  useEffect(() => {
    if (!entityId) return;

    const checkPending = async () => {
      const queue = new OfflineQueue(null);
      const count = await queue.getPendingCount(entityId);
      setState((prev) => ({ ...prev, pendingCount: count }));
    };

    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, [entityId]);

  return state;
}