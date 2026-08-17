'use client';

import { useState, useEffect } from 'react';
import { X, Download, Calendar, FileSpreadsheet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslations } from '@/i18n/context';
import { useEntitiesStore, Entity, ScheduleEntry, HolidayEntry, ExceptionEntry } from '@/store/entities';
import { generateICS, downloadICS, entityToCalendarEvents, CalendarEvent } from '@/lib/export/ics';
import { generateCSV, downloadCSV } from '@/lib/export/csv';
import { cn } from '@/lib/utils';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
  const t = useTranslations('calendar.export');
  const store = useEntitiesStore();
  
  const activeEntityId = store.activeEntityId;
  const entity = activeEntityId ? store.entities[activeEntityId] : null;
  const schedules = activeEntityId ? (store.schedules[activeEntityId] || []) : [];
  const holidays = activeEntityId ? (store.holidays[activeEntityId] || []) : [];
  const exceptions = activeEntityId ? (store.exceptions[activeEntityId] || []) : [];
  
  const [includeSchedules, setIncludeSchedules] = useState(true);
  const [includeHolidays, setIncludeHolidays] = useState(true);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [icsDownloading, setIcsDownloading] = useState(false);
  const [csvDownloading, setCsvDownloading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  useEffect(() => {
    if (isOpen && entity) {
      const today = new Date();
      const startOfSemester = new Date(today.getFullYear(), today.getMonth() < 6 ? 0 : 6, 1);
      const endOfSemester = new Date(today.getFullYear(), today.getMonth() < 6 ? 5 : 11, 31);
      
      setDateFrom(startOfSemester.toISOString().split('T')[0]);
      setDateTo(endOfSemester.toISOString().split('T')[0]);
    }
  }, [isOpen, entity]);
  
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);
  
  const filterEventsByDate = (events: CalendarEvent[]): CalendarEvent[] => {
    if (!dateFrom && !dateTo) return events;
    return events.filter((event) => {
      const eventDate = event.startDate;
      if (dateFrom && eventDate < dateFrom) return false;
      if (dateTo && eventDate > dateTo) return false;
      return true;
    });
  };
  
  const handleICSDownload = async () => {
    if (!entity) return;
    
    setIcsDownloading(true);
    setMessage(null);
    
    try {
      const allEvents = entityToCalendarEvents(entity, schedules, holidays, exceptions);
      let filteredEvents = allEvents;
      
      if (!includeSchedules) {
        filteredEvents = filteredEvents.filter((e) => !e.isRecurring);
      }
      if (!includeHolidays) {
        filteredEvents = filteredEvents.filter((e) => e.isRecurring === false && !e.exceptionType);
      }
      
      filteredEvents = filterEventsByDate(filteredEvents);
      
      if (filteredEvents.length === 0) {
        setMessage({ type: 'error', text: t('noData') });
        setIcsDownloading(false);
        return;
      }
      
      const icsContent = generateICS(filteredEvents, { companyName: 'zman' });
      const fileName = `${entity.name}-schedule-${dateFrom || 'all'}-to-${dateTo || 'all'}.ics`;
      downloadICS(icsContent, fileName);
      setMessage({ type: 'success', text: t('exportSuccess') });
    } catch {
      setMessage({ type: 'error', text: t('exportError') });
    } finally {
      setIcsDownloading(false);
    }
  };
  
  const handleCSVDownload = () => {
    if (!entity) return;
    
    setCsvDownloading(true);
    setMessage(null);
    
    try {
      let filteredSchedules = schedules;
      
      if (dateFrom) {
        filteredSchedules = filteredSchedules.filter((s) => s.validUntil >= dateFrom);
      }
      if (dateTo) {
        filteredSchedules = filteredSchedules.filter((s) => s.validFrom <= dateTo);
      }
      
      if (filteredSchedules.length === 0) {
        setMessage({ type: 'error', text: t('noData') });
        setCsvDownloading(false);
        return;
      }
      
      const csvContent = generateCSV(entity, filteredSchedules);
      const fileName = `${entity.name}-schedule-${dateFrom || 'all'}-to-${dateTo || 'all'}.csv`;
      downloadCSV(csvContent, fileName);
      setMessage({ type: 'success', text: t('exportSuccess') });
    } catch {
      setMessage({ type: 'error', text: t('exportError') });
    } finally {
      setCsvDownloading(false);
    }
  };
  
  const eventCount = entity ? entityToCalendarEvents(entity, schedules, holidays, exceptions).length : 0;
  const scheduleCount = schedules.length;
  const holidayCount = holidays.length;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md bg-background rounded-xl shadow-xl border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={t('close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {!entity ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('noData')}</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                  {entity.name}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">{t('includeSchedules')}</div>
                  <div className="font-medium">{scheduleCount}</div>
                  <div className="text-muted-foreground">{t('includeHolidays')}</div>
                  <div className="font-medium">{holidayCount}</div>
                  <div className="text-muted-foreground">Total Events</div>
                  <div className="font-medium">{eventCount}</div>
                </div>
              </div>
              
              <div className="border-t border-border pt-6 space-y-6">
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {t('ics')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('icsDescription')}</p>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeSchedules}
                        onChange={(e) => setIncludeSchedules(e.target.checked)}
                        className="rounded border-input bg-background h-4 w-4"
                      />
                      <span className="text-sm">{t('includeSchedules')}</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeHolidays}
                        onChange={(e) => setIncludeHolidays(e.target.checked)}
                        className="rounded border-input bg-background h-4 w-4"
                      />
                      <span className="text-sm">{t('includeHolidays')}</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        {t('from')}
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        {t('to')}
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleICSDownload}
                    disabled={icsDownloading || csvDownloading}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {icsDownloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t('downloading')}</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>{t('download')}</span>
                      </>
                    )}
                  </button>
                </div>
                
                <div className="border-t border-border pt-6">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5" />
                    {t('csv')}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{t('csvDescription')}</p>
                  
                  <button
                    onClick={handleCSVDownload}
                    disabled={icsDownloading || csvDownloading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-input bg-background text-foreground rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {csvDownloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t('downloading')}</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        <span>{t('download')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
          
          {message && (
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                message.type === 'success'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
              )}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}