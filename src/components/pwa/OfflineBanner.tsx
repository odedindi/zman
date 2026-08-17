'use client';

import { WifiOff, Wifi } from 'lucide-react';
import { useTranslations } from '@/i18n/context';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function OfflineBanner({ isOnline }: { isOnline: boolean }) {
  const t = useTranslations();
  const [show, setShow] = useState(!isOnline);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
    } else {
      setTimeout(() => setShow(false), 3000);
    }
  }, [isOnline]);

  if (!show) return null;

  return (
    <div className={cn(
      'fixed top-0 left-0 right-0 z-50 px-4 py-2.5 text-center text-sm font-medium',
      'animate-slide-down transition-all duration-300',
      isOnline ? 'bg-green-600 text-white' : 'bg-amber-600 text-white'
    )} role="alert" aria-live="polite">
      <div className="flex items-center justify-center gap-2">
        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        <span>{isOnline ? t('pwa.offlineBanner.online') : t('pwa.offlineBanner.offline')}</span>
      </div>
    </div>
  );
}