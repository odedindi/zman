'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from '@/i18n/context';
import { useEntitiesStore, HolidayEntry } from '@/store/entities';
import { HolidayForm } from '@/components/calendar/HolidayForm';
import { CalendarImportDialog } from '@/components/calendar/CalendarImportDialog';
import { Plus, Trash2, Edit, Calendar, Download, Loader2, Flag, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Locale } from '@/i18n';

export default function HolidaysPage() {
  const t = useTranslations('holidays');
  const locale = useLocale() as Locale;
  const store = useEntitiesStore();
  const activeEntityId = store.activeEntityId;
  const activeEntity = activeEntityId ? store.entities[activeEntityId] : null;
  const holidays = activeEntityId ? (store.holidays[activeEntityId] || []) : [];
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayEntry | undefined>(undefined);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const sortedHolidays = [...holidays].sort((a, b) => a.startDate.localeCompare(b.startDate));

  const handleAdd = (data: { name: string; startDate: string; endDate: string; isSchoolHoliday: boolean }) => {
    if (!activeEntityId) return;
    setFormSubmitting(true);
    store.addHoliday({ entityId: activeEntityId, ...data });
    setFormSubmitting(false);
    setShowForm(false);
  };

  const handleEdit = (data: { name: string; startDate: string; endDate: string; isSchoolHoliday: boolean }) => {
    if (!activeEntityId || !editingHoliday) return;
    setFormSubmitting(true);
    store.updateHoliday(activeEntityId, editingHoliday.id, data);
    setFormSubmitting(false);
    setEditingHoliday(undefined);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHoliday(undefined);
  };

  const handleDelete = (id: string) => {
    if (!activeEntityId) return;
    if (confirm(t('confirmDelete'))) {
      store.deleteHoliday(activeEntityId, id);
    }
  };

  const handleStartEdit = (holiday: HolidayEntry) => {
    setEditingHoliday(holiday);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingHoliday(undefined);
    setShowForm(true);
  };

  const handleImport = (importedHolidays: { name: string; startDate: string; endDate: string; type: 'school' | 'public' }[]) => {
    if (!activeEntityId) return;
    importedHolidays.forEach((h) => {
      store.addHoliday({
        entityId: activeEntityId,
        name: h.name,
        startDate: h.startDate,
        endDate: h.endDate,
        isSchoolHoliday: h.type === 'school',
      });
    });
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
              onClick={() => setShowImportDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              <Download className="h-4 w-4" />
              {t('import')}
            </button>
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('addHoliday')}
            </button>
          </div>
        </div>

        {sortedHolidays.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
              <Calendar className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('noHolidays')}</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t('noHolidaysDescription')}</p>
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-5 w-5" />
              {t('addFirstHoliday')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedHolidays.map((holiday) => (
              <article
                key={holiday.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-border',
                  'transition-all hover:shadow-md'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0',
                    holiday.isSchoolHoliday ? 'bg-blue-500' : 'bg-green-500'
                  )}
                >
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{holiday.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(holiday.startDate), 'PPP', { locale: locale as any })} –{' '}
                    {format(new Date(holiday.endDate), 'PPP', { locale: locale as any })}
                    {' '}
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium ml-2',
                      holiday.isSchoolHoliday
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    )}>
                      {holiday.isSchoolHoliday ? t('schoolHoliday') : t('publicHoliday')}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(holiday)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    aria-label={t('edit')}
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(holiday.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label={t('delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingHoliday ? t('editHoliday') : t('addHoliday')}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <HolidayForm
                initialHoliday={editingHoliday}
                onSubmit={editingHoliday ? handleEdit : handleAdd}
                onCancel={handleCancel}
                isLoading={formSubmitting}
              />
            </div>
          </div>
        )}

        <CalendarImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onImport={handleImport}
        />
      </main>
    </div>
  );
}