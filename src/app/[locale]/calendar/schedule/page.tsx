'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from '@/i18n/context';
import { useEntitiesStore, ScheduleEntry } from '@/store/entities';
import { ScheduleForm } from '@/components/schedule/ScheduleForm';
import { ScheduleList } from '@/components/schedule/ScheduleList';
import { Plus, Trash2, Edit, Clock, Loader2, X, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SchedulePage() {
  const t = useTranslations('schedule');
  const locale = useLocale();
  const store = useEntitiesStore();
  const activeEntityId = store.activeEntityId;
  const activeEntity = activeEntityId ? store.entities[activeEntityId] : null;
  const schedules = activeEntityId ? (store.schedules[activeEntityId] || []) : [];
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | undefined>(undefined);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const handleAdd = (data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    location?: string;
    notes?: string;
    validFrom: string;
    validUntil: string;
  }) => {
    if (!activeEntityId) return;
    setFormSubmitting(true);
    store.addSchedule({ entityId: activeEntityId, ...data });
    setFormSubmitting(false);
    setShowForm(false);
  };

  const handleEdit = (data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    location?: string;
    notes?: string;
    validFrom: string;
    validUntil: string;
  }) => {
    if (!activeEntityId || !editingSchedule) return;
    setFormSubmitting(true);
    store.updateSchedule(activeEntityId, editingSchedule.id, data);
    setFormSubmitting(false);
    setEditingSchedule(undefined);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSchedule(undefined);
  };

  const handleDelete = (id: string) => {
    if (!activeEntityId) return;
    if (confirm(t('confirmDelete'))) {
      store.deleteSchedule(activeEntityId, id);
    }
  };

  const handleStartEdit = (schedule: ScheduleEntry) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingSchedule(undefined);
    setShowForm(true);
  };

  if (!activeEntity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Link
            href={`/${locale}/kids`}
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
            <ChevronLeft className="h-5 w-5" />
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
        </div>

        <ScheduleList
          schedules={schedules}
          entityColor={activeEntity.color}
          onEdit={handleStartEdit}
          onDelete={handleDelete}
          onAdd={handleNew}
        />

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingSchedule ? t('editSchedule') : t('addSchedule')}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ScheduleForm
                initialSchedule={editingSchedule}
                onSubmit={editingSchedule ? handleEdit : handleAdd}
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