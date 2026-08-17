'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Loader2, Wifi, WifiOff, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { QueueStatusPanel } from './QueueStatusPanel';

export function SyncStatus({ entityId, entityName }: { entityId?: string; entityName?: string }) {
  const t = useTranslations('pwa.syncStatus');
  const [showPanel, setShowPanel] = useState(false);

  const {
    pendingCount,
    syncStatus,
    lastSynced,
    isOnline,
  } = useOfflineQueue(entityId);

  if (syncStatus === 'idle' && !pendingCount && isOnline) return null;

  const statusIcons = {
    syncing: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
    synced: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
    pending: <RefreshCw className="h-4 w-4 text-amber-500" />,
    offline: <WifiOff className="h-4 w-4 text-amber-500" />,
    idle: <Wifi className="h-4 w-4 text-green-500" />,
  };

  const statusLabels = {
    syncing: t('syncing'),
    synced: t('synced'),
    pending: `${pendingCount} ${t('pending')}`,
    error: t('error'),
    offline: t('offline'),
    idle: t('synced'),
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-full',
          'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-border shadow-lg',
          'transition-all duration-300',
          showPanel ? 'rounded-b-none' : 'rounded-full'
        )}
        aria-expanded={showPanel}
        aria-label={statusLabels[syncStatus]}
      >
        {statusIcons[syncStatus]}
        <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
          {statusLabels[syncStatus]}
          {lastSynced && syncStatus === 'synced' && (
            <>
              <Clock className="h-3 w-3 inline ml-1 -mt-0.5" />
              {lastSynced}
            </>
          )}
        </span>
        {showPanel ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:inline" />
        )}
      </button>

      {showPanel && (
        <QueueStatusPanel entityId={entityId} entityName={entityName} />
      )}
    </div>
  );
}