'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, X, GitMerge } from 'lucide-react';
import { useTranslations } from '@/i18n/context';
import { cn } from '@/lib/utils';

interface ConflictInfo {
  entityId: string;
  entityName: string;
  localChanges: number;
  remoteChanges: number;
}

interface ConflictBannerProps {
  conflicts: ConflictInfo[];
  onAcceptLocal: (entityId: string) => void;
  onAcceptRemote: (entityId: string) => void;
  onMerge: (entityId: string) => void;
  onDismiss: () => void;
}

export function ConflictBanner({
  conflicts,
  onAcceptLocal,
  onAcceptRemote,
  onMerge,
  onDismiss,
}: ConflictBannerProps) {
  const t = useTranslations('pwa.conflict');
  const [show, setShow] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (conflicts.length > 0) {
      setShow(true);
      setCurrentIndex(0);
    } else {
      setShow(false);
    }
  }, [conflicts]);

  if (!show || conflicts.length === 0) return null;

  const currentConflict = conflicts[currentIndex];
  const hasMultiple = conflicts.length > 1;

  const handleAcceptLocal = useCallback(() => {
    onAcceptLocal(currentConflict.entityId);
    goToNext();
  }, [currentConflict.entityId, onAcceptLocal]);

  const handleAcceptRemote = useCallback(() => {
    onAcceptRemote(currentConflict.entityId);
    goToNext();
  }, [currentConflict.entityId, onAcceptRemote]);

  const handleMerge = useCallback(() => {
    onMerge(currentConflict.entityId);
    goToNext();
  }, [currentConflict.entityId, onMerge]);

  const goToNext = useCallback(() => {
    if (currentIndex < conflicts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShow(false);
      onDismiss();
    }
  }, [currentIndex, conflicts.length, onDismiss]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    onDismiss();
  }, [onDismiss]);

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-4 py-3',
        'animate-slide-down transition-all duration-300',
        'bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5 p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{t('title')}</p>
              {hasMultiple && (
                <span className="text-xs text-muted-foreground px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  {currentIndex + 1} / {conflicts.length}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{t('description')}</p>
            <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="font-medium text-foreground">{currentConflict.entityName}</p>
              <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {t('localChanges', { count: currentConflict.localChanges })}
                </span>
                <span className="flex items-center gap-1">
                  <GitMerge className="h-3 w-3 text-blue-500" />
                  {t('remoteChanges', { count: currentConflict.remoteChanges })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={t('dismiss')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAcceptLocal}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {t('acceptLocal')}
          </button>
          <button
            onClick={handleAcceptRemote}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <GitMerge className="h-4 w-4" />
            {t('acceptRemote')}
          </button>
          <button
            onClick={handleMerge}
            className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <GitMerge className="h-4 w-4" />
            {t('merge')}
          </button>
        </div>
      </div>
    </div>
  );
}