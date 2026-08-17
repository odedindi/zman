'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, X } from 'lucide-react';
import { useTranslations } from '@/i18n/context';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt({ deferredPrompt }: { deferredPrompt: BeforeInstallPromptEvent | null }) {
  const t = useTranslations();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (deferredPrompt && !dismissed) {
      const timer = setTimeout(() => setShow(true), 30_000);
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt, dismissed]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
      setDismissed(true);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    setDismissed(true);
  }, []);

  if (!show || !deferredPrompt) return null;

  return (
    <div className={cn(
      'fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-80',
      'z-50 animate-slide-up'
    )} role="dialog" aria-label={t('pwa.installPrompt.title')}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-border p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Download className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">{t('pwa.installPrompt.title')}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{t('pwa.installPrompt.description')}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleInstall}
            className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium
              hover:bg-primary/90 transition-colors"
          >
            {t('pwa.installPrompt.install')}
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-secondary text-secondary-foreground py-2 px-4 rounded-lg font-medium
              hover:bg-secondary/80 transition-colors"
          >
            {t('pwa.installPrompt.later')}
          </button>
        </div>
      </div>
    </div>
  );
}