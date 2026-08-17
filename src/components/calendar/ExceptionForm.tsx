'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/context';
import { X, Save, Loader2, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExceptionEntry } from '@/store/entities';

type ExceptionType = 'cancelled' | 'moved' | 'early_pickup' | 'late_drop';

interface ExceptionFormProps {
  initialException?: ExceptionEntry;
  onSubmit: (data: { date: string; type: ExceptionType; newStartTime?: string; newEndTime?: string; notes?: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EXCEPTION_TYPES: { value: ExceptionType; label: string; icon: React.ReactNode }[] = [
  { value: 'cancelled', label: 'exceptions.cancelled', icon: <AlertTriangle className="h-4 w-4" /> },
  { value: 'moved', label: 'exceptions.moved', icon: <Clock className="h-4 w-4" /> },
  { value: 'early_pickup', label: 'exceptions.earlyPickup', icon: <Clock className="h-4 w-4" /> },
  { value: 'late_drop', label: 'exceptions.lateDrop', icon: <Clock className="h-4 w-4" /> },
];

const TIME_TYPES: ExceptionType[] = ['moved', 'early_pickup', 'late_drop'];

export function ExceptionForm({ initialException, onSubmit, onCancel, isLoading }: ExceptionFormProps) {
  const t = useTranslations('exceptions');
  const [formData, setFormData] = useState({
    date: initialException?.date || '',
    type: initialException?.type || 'cancelled',
    newStartTime: initialException?.newStartTime || '',
    newEndTime: initialException?.newEndTime || '',
    notes: initialException?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialException) {
      setFormData({
        date: initialException.date,
        type: initialException.type,
        newStartTime: initialException.newStartTime || '',
        newEndTime: initialException.newEndTime || '',
        notes: initialException.notes || '',
      });
    }
  }, [initialException]);

  const showTimeFields = TIME_TYPES.includes(formData.type as ExceptionType);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.date) {
      newErrors.date = t('dateRequired');
    }
    if (showTimeFields) {
      if (!formData.newStartTime) {
        newErrors.newStartTime = t('startTimeRequired');
      }
      if (!formData.newEndTime) {
        newErrors.newEndTime = t('endTimeRequired');
      }
      if (formData.newStartTime && formData.newEndTime && formData.newEndTime <= formData.newStartTime) {
        newErrors.newEndTime = t('endTimeAfterStart');
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        date: formData.date,
        type: formData.type as ExceptionType,
        newStartTime: showTimeFields ? formData.newStartTime : undefined,
        newEndTime: showTimeFields ? formData.newEndTime : undefined,
        notes: formData.notes || undefined,
      };
      onSubmit(submitData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-2">
          {t('date')}
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={cn(
              'w-full px-4 py-3 pl-10 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent',
              errors.date && 'border-red-500'
            )}
            required
          />
        </div>
        {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-2">
          {t('type')}
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as ExceptionType })}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {EXCEPTION_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.label)}
            </option>
          ))}
        </select>
      </div>

      {formData.type === 'cancelled' && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {t('cancelledWarning')}
          </p>
        </div>
      )}

      {showTimeFields && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="newStartTime" className="block text-sm font-medium mb-2">
              {t('newStartTime')}
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                id="newStartTime"
                type="time"
                value={formData.newStartTime}
                onChange={(e) => setFormData({ ...formData, newStartTime: e.target.value })}
                className={cn(
                  'w-full px-4 py-3 pl-10 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent',
                  errors.newStartTime && 'border-red-500'
                )}
                required
              />
            </div>
            {errors.newStartTime && <p className="mt-1 text-sm text-red-500">{errors.newStartTime}</p>}
          </div>

          <div>
            <label htmlFor="newEndTime" className="block text-sm font-medium mb-2">
              {t('newEndTime')}
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                id="newEndTime"
                type="time"
                value={formData.newEndTime}
                onChange={(e) => setFormData({ ...formData, newEndTime: e.target.value })}
                className={cn(
                  'w-full px-4 py-3 pl-10 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent',
                  errors.newEndTime && 'border-red-500'
                )}
                required
              />
            </div>
            {errors.newEndTime && <p className="mt-1 text-sm text-red-500">{errors.newEndTime}</p>}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-2">
          {t('notes')}
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={t('notesPlaceholder')}
        />
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4 inline mr-2" />
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Save className="h-4 w-4" />
          {initialException ? t('saveChanges') : t('createException')}
        </button>
      </div>
    </form>
  );
}