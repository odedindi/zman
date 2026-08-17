'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/i18n/context';
import { X, Check, Loader2, Calendar, ChevronDown, ChevronUp, Flag, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIsraeliHolidays, CalendarHoliday } from '@/lib/calendar/israel';
import { getSwissHolidays, getSwissCantons, SwissCanton } from '@/lib/calendar/swiss';

interface CalendarImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (holidays: CalendarHoliday[]) => void;
}

export function CalendarImportDialog({ isOpen, onClose, onImport }: CalendarImportDialogProps) {
  const t = useTranslations('calendar.import');
  const [activeTab, setActiveTab] = useState<'israel' | 'swiss'>('israel');
  const [year, setYear] = useState(new Date().getFullYear());
  const [canton, setCanton] = useState<SwissCanton>('ZH');
  const [selectedHolidays, setSelectedHolidays] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [israelHolidays, setIsraelHolidays] = useState<CalendarHoliday[]>([]);
  const [swissHolidays, setSwissHolidays] = useState<CalendarHoliday[]>([]);

  useEffect(() => {
    setIsraelHolidays(getIsraeliHolidays(year));
    setSwissHolidays(getSwissHolidays(year, canton));
    setSelectedHolidays(new Set());
  }, [year, canton]);

  const currentHolidays = activeTab === 'israel' ? israelHolidays : swissHolidays;

  const toggleHoliday = (holiday: CalendarHoliday) => {
    const key = `${holiday.startDate}-${holiday.name}`;
    const newSet = new Set(selectedHolidays);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setSelectedHolidays(newSet);
  };

  const isSelected = (holiday: CalendarHoliday) => {
    const key = `${holiday.startDate}-${holiday.name}`;
    return selectedHolidays.has(key);
  };

  const handleImport = async () => {
    if (selectedHolidays.size === 0) return;
    setIsImporting(true);
    const toImport = currentHolidays.filter((h) => isSelected(h));
    onImport(toImport);
    setIsImporting(false);
    onClose();
  };

  const handleSelectAll = () => {
    if (selectedHolidays.size === currentHolidays.length) {
      setSelectedHolidays(new Set());
    } else {
      const newSet = new Set(currentHolidays.map((h) => `${h.startDate}-${h.name}`));
      setSelectedHolidays(newSet);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold">{t('title')}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b p-4 bg-muted/50">
          <button
            onClick={() => setActiveTab('israel')}
            className={cn(
              'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'israel'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Flag className="h-4 w-4 inline mr-2" />
            {t('israel')}
          </button>
          <button
            onClick={() => setActiveTab('swiss')}
            className={cn(
              'flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'swiss'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <MapPin className="h-4 w-4 inline mr-2" />
            {t('swiss')}
          </button>
        </div>

        <div className="p-4 border-b bg-muted/30 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium">{t('year')}</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'swiss' && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">{t('canton')}</label>
              <select
                value={canton}
                onChange={(e) => setCanton(e.target.value as SwissCanton)}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {getSwissCantons().map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">{t('selectHolidays')}</h3>
            <button
              onClick={handleSelectAll}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {selectedHolidays.size === currentHolidays.length && currentHolidays.length > 0
                ? <ChevronUp className="h-4 w-4" />
                : <ChevronDown className="h-4 w-4" />}
              {selectedHolidays.size === currentHolidays.length && currentHolidays.length > 0
                ? t('deselectAll')
                : t('selectAll')}
            </button>
          </div>

          {currentHolidays.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t('noHolidaysForYear')}</p>
          ) : (
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {currentHolidays.map((holiday) => (
                <label
                  key={`${holiday.startDate}-${holiday.name}`}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
                    isSelected(holiday)
                      ? 'bg-primary/5 border-primary'
                      : 'border-border hover:bg-muted/50'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected(holiday)}
                    onChange={() => toggleHoliday(holiday)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{holiday.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {holiday.startDate === holiday.endDate
                        ? holiday.startDate
                        : `${holiday.startDate} – ${holiday.endDate}`}
                      {' '}
                      <span className={cn(
                        'px-1.5 py-0.5 rounded text-xs font-medium',
                        holiday.type === 'school'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      )}>
                        {holiday.type === 'school' ? t('school') : t('public')}
                      </span>
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleImport}
            disabled={selectedHolidays.size === 0 || isImporting}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
            <Check className="h-4 w-4" />
            {isImporting ? t('importing') : t('importSelected', { count: selectedHolidays.size })}
          </button>
        </div>
      </div>
    </div>
  );
}