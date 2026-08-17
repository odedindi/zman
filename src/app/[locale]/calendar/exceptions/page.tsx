'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from '@/i18n/context';
import { useEntitiesStore, ExceptionEntry } from '@/store/entities';
import { ExceptionForm } from '@/components/calendar/ExceptionForm';
import { Plus, Trash2, Edit, Calendar, AlertTriangle, Clock, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Locale } from '@/i18n';

type ExceptionType = 'cancelled' | 'moved' | 'early_pickup' | 'late_drop';

export default function ExceptionsPage() {
  const t = useTranslations('exceptions');
  const locale = useLocale() as Locale;
  const store = useEntitiesStore();
  const activeEntityId = store.activeEntityId;
  const activeEntity = activeEntityId ? store.entities[activeEntityId] : null;
  const exceptions = activeEntityId ? (store.exceptions[activeEntityId] || []) : [];
  const [showForm, setShowForm] = useState(false);
  const [editingException, setEditingException] = useState<ExceptionEntry | undefined>(undefined);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const sortedExceptions = [...exceptions].sort((a, b) => a.date.localeCompare(b.date));

  const groupedByMonth = sortedExceptions.reduce((acc, exception) => {
    const monthKey = exception.date.substring(0, 7);
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(exception);
    return acc;
  }, {} as Record<string, ExceptionEntry[]>);

  const monthKeys = Object.keys(groupedByMonth).sort().reverse();

  const handleAdd = (data: { date: string; type: ExceptionType; newStartTime?: string; newEndTime?: string; notes?: string }) => {
    if (!activeEntityId) return;
    setFormSubmitting(true);
    store.addException({ entityId: activeEntityId, ...data });
    setFormSubmitting(false);
    setShowForm(false);
  };

  const handleEdit = (data: { date: string; type: ExceptionType; newStartTime?: string; newEndTime?: string; notes?: string }) => {
    if (!activeEntityId || !editingException) return;
    setFormSubmitting(true);
    store.updateException(activeEntityId, editingException.id, data);
    setFormSubmitting(false);
    setEditingException(undefined);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingException(undefined);
  };

  const handleDelete = (id: string) => {
    if (!activeEntityId) return;
    if (confirm(t('confirmDelete'))) {
      store.deleteException(activeEntityId, id);
    }
  };

  const handleStartEdit = (exception: ExceptionEntry) => {
    setEditingException(exception);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingException(undefined);
    setShowForm(true);
  };

  const handleQuickAdd = (type: ExceptionType, daysOffset: number = 0) => {
    if (!activeEntityId) return;
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    const dateStr = date.toISOString().split('T')[0];
    store.addException({
      entityId: activeEntityId,
      date: dateStr,
      type,
    });
  };

  const getTypeBadge = (type: ExceptionType) => {
    const badges = {
      cancelled: { label: t('cancelled'), icon: AlertTriangle, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
      moved: { label: t('moved'), icon: Clock, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      early_pickup: { label: t('earlyPickup'), icon: Clock, color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
      late_drop: { label: t('lateDrop'), icon: Clock, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    };
    const badge = badges[type];
    const Icon = badge.icon;
    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', badge.color)}>
        <Icon className="h-3 w-3" />
        {badge.label}
      </span>
    );
  };

  if (!activeEntity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Link
            href={`/${locale}/entities`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            {t('noEntity')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/${locale}/calendar/month/${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="text-2xl">←</span>
            {t('common.back')}
          </Link>
          <h1 className="text-xl font-bold">{t('title')}</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: activeEntity.color }}
            >
              {activeEntity.avatar}
            </div>
            <h2 className="text-lg font-semibold">{activeEntity.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('addException')}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleQuickAdd('cancelled', 1)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {t('cancelTomorrow')}
          </button>
          <button
            onClick={() => handleQuickAdd('early_pickup', 0)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-lg text-sm font-medium hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
          >
            <Clock className="h-3.5 w-3.5" />
            {t('earlyPickupToday')}
          </button>
          <button
            onClick={() => handleQuickAdd('late_drop', 0)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            <Clock className="h-3.5 w-3.5" />
            {t('lateDropToday')}
          </button>
        </div>

        {sortedExceptions.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
              <Calendar className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('noExceptions')}</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t('noExceptionsDescription')}</p>
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              {t('addFirstException')}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {monthKeys.map((monthKey) => {
              const monthExceptions = groupedByMonth[monthKey];
              const [year, month] = monthKey.split('-').map(Number);
              const monthDate = new Date(year, month - 1, 1);
              return (
                <section key={monthKey}>
<h3 className="text-lg font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {format(monthDate, 'MMMM yyyy', { locale: locale as any })}
                    </h3>
                  <div className="space-y-3">
                    {monthExceptions.map((exception) => (
                      <article
                        key={exception.id}
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-border',
                          'transition-all hover:shadow-md'
                        )}
                      >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0 bg-gray-500">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">
                              {format(new Date(exception.date), 'PPP', { locale: locale as any })}
                            </span>
                            {getTypeBadge(exception.type)}
                          </div>
                          {(exception.newStartTime || exception.newEndTime) && (
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {exception.newStartTime && `${exception.newStartTime}`}
                              {exception.newStartTime && exception.newEndTime && ' – '}
                              {exception.newEndTime && `${exception.newEndTime}`}
                            </p>
                          )}
                          {exception.notes && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{exception.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(exception)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            aria-label={t('edit')}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exception.id)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            aria-label={t('delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingException ? t('editException') : t('addException')}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ExceptionForm
                initialException={editingException}
                onSubmit={editingException ? handleEdit : handleAdd}
                onCancel={handleCancel}
                isLoading={formSubmitting}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}