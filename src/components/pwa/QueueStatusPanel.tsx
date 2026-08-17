'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Trash2, X, ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useTranslations } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { QueuedMutation } from '@/lib/yjs/offline-queue';

interface QueueStatusPanelProps {
  entityId?: string;
  entityName?: string;
}

const operationLabels: Record<QueuedMutation['type'], string> = {
  create: 'created',
  update: 'updated',
  delete: 'deleted',
};

const operationIcons: Record<QueuedMutation['type'], React.ReactNode> = {
  create: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  update: <AlertCircle className="h-4 w-4 text-blue-500" />,
  delete: <AlertCircle className="h-4 w-4 text-red-500" />,
};

export function QueueStatusPanel({ entityId, entityName }: QueueStatusPanelProps) {
  const t = useTranslations('pwa.queue');
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const {
    pendingCount,
    mutations,
    syncStatus,
    lastSynced,
    isOnline,
    syncNow,
    clearQueue,
    refresh,
  } = useOfflineQueue(entityId);

  useEffect(() => {
    if (isOnline && syncStatus !== 'syncing') {
      const interval = setInterval(() => {
        refresh();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOnline, syncStatus, refresh]);

  const filteredMutations = entityId
    ? mutations.filter((m) => m.entityId === entityId)
    : mutations;

  const handleClearQueue = useCallback(async () => {
    if (confirmClear) {
      await clearQueue();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 5000);
    }
  }, [clearQueue, confirmClear]);

  if (pendingCount === 0 && !isExpanded) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-40',
        'bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-border',
        'transition-all duration-300',
        isExpanded ? 'w-96' : 'auto'
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-t-xl',
          'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-border',
          isExpanded ? 'rounded-b-none' : 'rounded-b-xl'
        )}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? t('title') : `${pendingCount} ${t('noPending')}`}
      >
        <div className="flex items-center gap-2">
          {syncStatus === 'syncing' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          {syncStatus === 'synced' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {syncStatus === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
          {syncStatus === 'pending' && <RefreshCw className="h-4 w-4 text-amber-500" />}
          {syncStatus === 'offline' && <RefreshCw className="h-4 w-4 text-amber-500" />}
          {syncStatus === 'idle' && pendingCount > 0 && <RefreshCw className="h-4 w-4 text-amber-500" />}
          <span className="text-xs font-medium text-foreground">
            {pendingCount > 0 ? `${pendingCount} ${t('title')}` : t('noPending')}
          </span>
          {entityName && (
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-secondary rounded-full">
              {entityName}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {lastSynced && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t('lastSync', { time: lastSynced })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={syncNow}
                disabled={syncStatus === 'syncing' || !isOnline || pendingCount === 0}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                  'bg-primary text-primary-foreground hover:bg-primary/90',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {syncStatus === 'syncing' ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                {t('syncNow')}
              </button>
              {pendingCount > 0 && (
                <button
                  onClick={handleClearQueue}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                    confirmClear
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  <Trash2 className="h-3 w-3" />
                  {confirmClear ? t('confirmClear') : t('clearQueue')}
                </button>
              )}
            </div>
          </div>

          {filteredMutations.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_2fr_1fr] gap-2 text-xs font-medium text-muted-foreground px-2 pb-1 border-b border-border">
                <span>{t('entity')}</span>
                <span>{t('operation')}</span>
                <span className="text-right">{t('time')}</span>
              </div>
              {filteredMutations.map((mutation) => (
                <div
                  key={mutation.id}
                  className="grid grid-cols-[1fr_2fr_1fr] gap-2 items-center px-2 py-2 text-xs border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-medium text-foreground truncate">
                      {mutation.payload.name || mutation.entityId.slice(0, 8)}
                    </span>
                    <span className="text-muted-foreground">{mutation.collection}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {operationIcons[mutation.type]}
                    <span className="capitalize text-foreground">
                      {t(operationLabels[mutation.type])}
                    </span>
                    <span className="text-muted-foreground px-1.5 py-0.5 bg-secondary rounded text-[10px]">
                      {mutation.retryCount > 0 ? `retry ${mutation.retryCount}` : ''}
                    </span>
                  </div>
                  <span className="text-right text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(mutation.timestamp), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{t('noPending')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}