'use client';

import { useState, useEffect, useCallback } from 'react';

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  offlineAt: Date | null;
}

export function useOffline(): OfflineState & {
  retry: () => void;
} {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    offlineAt: null,
  });

  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({
        ...prev,
        isOnline: true,
        wasOffline: true,
      }));
    };

    const handleOffline = () => {
      setState((prev) => ({
        ...prev,
        isOnline: false,
        wasOffline: true,
        offlineAt: new Date(),
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retry = useCallback(() => {
    if (!state.isOnline) {
      window.location.reload();
    }
  }, [state.isOnline]);

  return {
    ...state,
    retry,
  };
}

export function usePendingChanges(entityId?: string): {
  count: number;
  hasPending: boolean;
} {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!entityId) return;

    const checkCount = async () => {
      try {
        const db = await import('@/lib/db').then((m) => m.getDB());
        const metadata = await db.get('syncMetadata', entityId);
        setCount(metadata?.pendingCount ?? 0);
      } catch {
        setCount(0);
      }
    };

    checkCount();
    const interval = setInterval(checkCount, 5000);
    return () => clearInterval(interval);
  }, [entityId]);

  return { count, hasPending: count > 0 };
}