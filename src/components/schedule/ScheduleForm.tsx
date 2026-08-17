'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/context';
import { X, Save, Loader2, Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScheduleEntry } from '@/store/entities';

interface ScheduleFormProps {
  initialSchedule?: ScheduleEntry;
  onSubmit: (data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    location?: string;
    notes?: string;
    validFrom: string;
    validUntil: string;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'schedule.sunday' },
  { value: 1, label: 'schedule.monday' },
  { value: 2, label: 'schedule.tuesday' },
  { value: 3, label: 'schedule.wednesday' },
  { value: 4, label: 'schedule.thursday' },
  { value: 5, label: 'schedule.friday' },
  { value: 6, label: 'schedule.saturday' },
];

export function ScheduleForm({ initialSchedule, onSubmit, onCancel, isLoading }: ScheduleFormProps) {
  const t = useTranslations('schedule');
  const [formData, setFormData] = useState({
    dayOfWeek: initialSchedule?.dayOfWeek ?? new Date().getDay(),
    startTime: initialSchedule?.startTime || '08:00',
    endTime: initialSchedule?.endTime || '15:00',
    location: initialSchedule?.location || '',
    notes: initialSchedule?.notes || '',
    validFrom: initialSchedule?.validFrom || new Date().toISOString().split('T')[0],
    validUntil: initialSchedule?.validUntil || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialSchedule) {
      setFormData({
        dayOfWeek: initialSchedule.dayOfWeek,
        startTime: initialSchedule.startTime,
        endTime: initialSchedule.endTime,
        location: initialSchedule.location || '',
        notes: initialSchedule.notes || '',
        validFrom: initialSchedule.validFrom,
        validUntil: initialSchedule.validUntil,
      });
    } else if (!formData.validUntil) {
      const sixMonthsLater = new Date();
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
      setFormData((prev) => ({ ...prev, validUntil: sixMonthsLater.toISOString().split('T')[0] }));
    }
  }, [initialSchedule]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      newErrors.endTime = t('timeError');
    }
    if (formData.validFrom && formData.validUntil && formData.validUntil < formData.validFrom) {
      newErrors.validUntil = t('dateError');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="dayOfWeek" className="block text-sm font-medium mb-2">
          {t('dayOfWeek')}
        </label>
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => setFormData({ ...formData, dayOfWeek: day.value })}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all border-2',
                formData.dayOfWeek === day.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:bg-muted'
              )}
              aria-pressed={formData.dayOfWeek === day.value}
            >
              {t(day.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium mb-2">
            {t('startTime')}
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className={cn(
                'w-full px-4 py-3 pl-10 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent',
                errors.startTime && 'border-red-500'
              )}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium mb-2">
            {t('endTime')}
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className={cn(
                'w-full px-4 py-3 pl-10 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent',
                errors.endTime && 'border-red-500'
              )}
              required
            />
          </div>
          {errors.endTime && <p className="mt-1 text-sm text-red-500">{errors.endTime}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium mb-2">
          {t('location')}
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-3 pl-10 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={t('noLocation')}
            maxLength={100}
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-2">
          {t('notes')}
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 pl-10 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder={t('noNotes')}
            maxLength={500}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="validFrom" className="block text-sm font-medium mb-2">
            {t('validFrom')}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              id="validFrom"
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              className={cn(
                'w-full px-4 py-3 pl-10 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent',
                errors.validFrom && 'border-red-500'
              )}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="validUntil" className="block text-sm font-medium mb-2">
            {t('validUntil')}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              id="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className={cn(
                'w-full px-4 py-3 pl-10 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent',
                errors.validUntil && 'border-red-500'
              )}
              required
            />
          </div>
          {errors.validUntil && <p className="mt-1 text-sm text-red-500">{errors.validUntil}</p>}
        </div>
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
          {initialSchedule ? t('editSchedule') : t('addSchedule')}
        </button>
      </div>
    </form>
  );
}