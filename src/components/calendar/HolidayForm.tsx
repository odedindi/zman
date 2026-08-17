'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/context';
import { X, Save, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HolidayEntry } from '@/store/entities';

interface HolidayFormProps {
  initialHoliday?: HolidayEntry;
  onSubmit: (data: { name: string; startDate: string; endDate: string; isSchoolHoliday: boolean }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function HolidayForm({ initialHoliday, onSubmit, onCancel, isLoading }: HolidayFormProps) {
  const t = useTranslations('holidays');
  const [formData, setFormData] = useState({
    name: initialHoliday?.name || '',
    startDate: initialHoliday?.startDate || '',
    endDate: initialHoliday?.endDate || '',
    isSchoolHoliday: initialHoliday?.isSchoolHoliday ?? true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialHoliday) {
      setFormData({
        name: initialHoliday.name,
        startDate: initialHoliday.startDate,
        endDate: initialHoliday.endDate,
        isSchoolHoliday: initialHoliday.isSchoolHoliday,
      });
    }
  }, [initialHoliday]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired');
    }
    if (!formData.startDate) {
      newErrors.startDate = t('startDateRequired');
    }
    if (!formData.endDate) {
      newErrors.endDate = t('endDateRequired');
    }
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = t('endDateAfterStart');
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
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          {t('holidayName')}
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent',
            errors.name && 'border-red-500'
          )}
          placeholder={t('holidayNamePlaceholder')}
          required
          maxLength={100}
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium mb-2">
            {t('startDate')}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className={cn(
                'w-full px-4 py-3 pl-10 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent',
                errors.startDate && 'border-red-500'
              )}
              required
            />
          </div>
          {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-2">
            {t('endDate')}
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className={cn(
                'w-full px-4 py-3 pl-10 rounded-lg border bg-background focus:ring-2 focus:ring-primary focus:border-transparent',
                errors.endDate && 'border-red-500'
              )}
              required
            />
          </div>
          {errors.endDate && <p className="mt-1 text-sm text-red-500">{errors.endDate}</p>}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isSchoolHoliday}
            onChange={(e) => setFormData({ ...formData, isSchoolHoliday: e.target.checked })}
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
          />
          <span className="text-sm">{t('isSchoolHoliday')}</span>
        </label>
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
          {initialHoliday ? t('saveChanges') : t('createHoliday')}
        </button>
      </div>
    </form>
  );
}