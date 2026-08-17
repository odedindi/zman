'use client';

import { useSyncStatus } from '@/hooks/useSyncStatus';
import { RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslations } from '@/i18n/context';
import { cn } from '@/lib/utils';

export function SyncStatus({ isOnline }: { isOnline: boolean }) {
  const t = useTranslations();
  const { status, lastSynced, pendingCount } = useSyncStatus();

  if (status === 'idle' && !pendingCount) return null;

  const icons = {
    syncing: <Loader2 className="h-4 w-4 animate-spin" />,
    synced: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
    pending: <RefreshCw className="h-4 w-4 text-amber-500" />,
    offline: <RefreshCw className="h-4 w-4 text-amber-500" />,
    idle: null,
  };

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full',
      'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-border shadow-lg',
      'transition-all duration-300'
    )}>
      {icons[status]}
      <span className="text-xs font-medium text-muted-foreground">
        {status === 'syncing' && t('pwa.syncStatus.syncing')}
        {status === 'synced' && `${t('pwa.syncStatus.synced')}${lastSynced ? ` · ${lastSynced}` : ''}`}
        {status === 'pending' && `${pendingCount} ${t('pwa.syncStatus.pending')}`}
        {status === 'error' && t('pwa.syncStatus.error')}
      </span>
    </div>
  );
}