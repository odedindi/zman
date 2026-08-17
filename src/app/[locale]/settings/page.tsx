'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from '@/i18n/context';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { useOffline } from '@/hooks/useOffline';
import { getDB, clearAllData } from '@/lib/db';
import { cn } from '@/lib/utils';
import {
  Bell,
  BellOff,
  BellRing,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  Info,
  HardDrive,
  Loader2,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const { toast } = useToast();

  const {
    permission,
    subscription,
    isSupported,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    isSubscribed,
  } = usePushNotifications();

  const { status, lastSynced, pendingCount, isOnline } = useSyncStatus();
  const { isOnline: offlineIsOnline } = useOffline();

  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleTestNotification = async () => {
    if (!isSupported || permission !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(t('notifications.testNotification'), {
        body: t('notifications.testSuccess'),
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        tag: 'test-notification',
        requireInteraction: false,
      });
      toast({
        variant: 'success',
        title: t('notifications.testSuccess'),
      });
    } catch {
      toast({
        variant: 'destructive',
        title: t('common.error'),
      });
    }
  };

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await clearAllData();
      toast({
        variant: 'success',
        title: t('common.save'),
      });
      setShowClearConfirm(false);
      window.location.reload();
    } catch {
      toast({
        variant: 'destructive',
        title: t('common.error'),
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleManualSync = async () => {
    toast({
      title: t('sync.manualSync'),
      description: t('sync.status'),
    });
  };

  const getStorageUsage = async (): Promise<string> => {
    if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
      return 'Unknown';
    }
    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const usedMB = (used / 1024 / 1024).toFixed(2);
      const quotaMB = (quota / 1024 / 1024).toFixed(2);
      return `${usedMB} MB / ${quotaMB} MB`;
    } catch {
      return 'Unknown';
    }
  };

  const [storageUsage, setStorageUsage] = useState('Calculating...');

  useEffect(() => {
    getStorageUsage().then(setStorageUsage);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
            <span>{t('common.back')}</span>
          </Link>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <div className="w-20" />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {t('notifications.title')}
          </h2>
          <p className="text-muted-foreground mb-4">{t('notifications.description')}</p>

          <div className="bg-card border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('notifications.enable')}</p>
                <p className="text-sm text-muted-foreground">
                  {isSubscribed
                    ? t('notifications.disable')
                    : permission === 'denied'
                    ? t('notifications.permissionDenied')
                    : !isSupported
                    ? t('notifications.notSupported')
                    : t('notifications.description')}
                </p>
              </div>
              <button
                onClick={handleToggleNotifications}
                disabled={!isSupported || permission === 'denied' || isLoading}
                className={cn(
                  'relative h-10 w-20 rounded-full transition-colors',
                  isSubscribed
                    ? 'bg-primary'
                    : 'bg-muted',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                aria-label={isSubscribed ? t('notifications.disable') : t('notifications.enable')}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 h-9 w-9 rounded-full bg-white shadow-lg transition-transform',
                    isSubscribed ? 'translate-x-10' : 'translate-x-0'
                  )}
                >
                  {isSubscribed ? (
                    <BellRing className="h-5 w-5 text-primary mx-auto my-1" />
                  ) : (
                    <BellOff className="h-5 w-5 text-muted-foreground mx-auto my-1" />
                  )}
                </span>
              </button>
            </div>

            {permission === 'denied' && (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{t('notifications.permissionDenied')}</span>
              </div>
            )}

            {!isSupported && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4 flex-shrink-0" />
                <span>{t('notifications.notSupported')}</span>
              </div>
            )}

            {isSubscribed && (
              <button
                onClick={handleTestNotification}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
              >
                <Bell className="h-4 w-4" />
                <span>{t('notifications.testNotification')}</span>
              </button>
            )}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            {t('sync.title')}
          </h2>
          <p className="text-muted-foreground mb-4">{t('sync.description')}</p>

          <div className="bg-card border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('sync.status')}</p>
                <p className="text-sm text-muted-foreground">
                  {status === 'synced'
                    ? `${t('pwa.syncStatus.synced')}${lastSynced ? ` · ${lastSynced}` : ''}`
                    : status === 'syncing'
                    ? t('pwa.syncStatus.syncing')
                    : status === 'pending'
                    ? `${pendingCount} ${t('pwa.syncStatus.pending')}`
                    : status === 'error'
                    ? t('pwa.syncStatus.error')
                    : status === 'offline'
                    ? t('pwa.syncStatus.offline')
                    : t('pwa.syncStatus.synced')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    isOnline ? 'bg-green-500' : 'bg-red-500'
                  )}
                />
                <span className="text-sm text-muted-foreground">
                  {isOnline ? t('pwa.offlineBanner.online') : t('pwa.offlineBanner.offline')}
                </span>
              </div>
            </div>

            <button
              onClick={handleManualSync}
              disabled={!isOnline}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="h-4 w-4" />
              <span>{t('sync.manualSync')}</span>
            </button>

            {lastSynced && (
              <p className="text-sm text-muted-foreground text-center">
                {t('sync.lastSynced', { time: lastSynced })}
              </p>
            )}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            {t('storage.title')}
          </h2>
          <p className="text-muted-foreground mb-4">{t('storage.description')}</p>

          <div className="bg-card border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{t('storage.usage')}</span>
              <span className="text-sm font-mono text-muted-foreground">{storageUsage}</span>
            </div>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t('storage.clearData')}</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t('about.title')}
          </h2>

          <div className="bg-card border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('about.version')}</span>
              <span className="font-mono text-sm">0.1.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('about.build')}</span>
              <span className="font-mono text-sm">development</span>
            </div>
          </div>
        </section>
      </main>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">{t('storage.clearData')}</h3>
            <p className="text-muted-foreground mb-6">{t('storage.confirmClear')}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-accent transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleClearData}
                disabled={isClearing}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('common.confirm')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}