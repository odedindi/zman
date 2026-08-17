'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from '@/i18n/context';
import { useEntitiesStore, Entity, ScheduleEntry, HolidayEntry, ExceptionEntry } from '@/store/entities';
import { CalendarGrid, CalendarEvent } from '@/components/calendar/CalendarGrid';
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { format, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, isSameDay, isSameMonth } from 'date-fns';
import { cn } from '@/lib/utils';

interface MonthViewPageProps {
  params: Promise<{ month: string; locale: string }>;
}

export default function MonthViewPage({ params }: MonthViewPageProps) {
  const t = useTranslations('calendar');
  const locale = useLocale();
  const store = useEntitiesStore();

  const activeEntityId = store.activeEntityId;
  const entity = activeEntityId ? store.entities[activeEntityId] : null;
  const schedules = activeEntityId ? (store.schedules[activeEntityId] || []) : [];
  const exceptions = activeEntityId ? (store.exceptions[activeEntityId] || []) : [];
  const holidays = activeEntityId ? (store.holidays[activeEntityId] || []) : [];

  const [monthParam, setMonthParam] = useState<string>('');
  const [monthDate, setMonthDate] = useState<Date>(new Date());

  useEffect(() => {
    params.then((p) => {
      setMonthParam(p.month);
      const [yearStr, monthStr] = p.month.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const date = new Date(year, month, 1);
      setMonthDate(date);
    });
  }, [params]);

  const prevMonth = format(subMonths(monthDate, 1), 'yyyy-MM');
  const nextMonth = format(addMonths(monthDate, 1), 'yyyy-MM');
  const todayMonth = format(new Date(), 'yyyy-MM');

  const events = useMemo((): CalendarEvent[] => {
    if (!activeEntityId || !monthParam) return [];

    const computedEvents: CalendarEvent[] = [];
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      const currentDate = new Date(d);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const dayOfWeek = currentDate.getDay();

      for (const schedule of schedules) {
        if (
          schedule.dayOfWeek === dayOfWeek &&
          schedule.validFrom <= dateStr &&
          schedule.validUntil >= dateStr
        ) {
          const exception = exceptions.find((e) => e.date === dateStr);
          let startTime = schedule.startTime;
          let endTime = schedule.endTime;
          let title = schedule.location || '';
          let type: CalendarEvent['type'] = 'regular';
          let exceptionType: CalendarEvent['exceptionType'] = undefined;

          if (exception) {
            if (exception.type === 'cancelled') {
              type = 'exception';
              exceptionType = 'cancelled';
              title = t('exception.cancelled');
            } else {
              startTime = exception.newStartTime || startTime;
              endTime = exception.newEndTime || endTime;
              type = 'exception';
              exceptionType = exception.type;
              title = exception.notes || exception.type;
            }
          }

          computedEvents.push({
            id: `${activeEntityId}-${schedule.id}-${dateStr}`,
            entityId: activeEntityId,
            date: currentDate,
            startTime,
            endTime,
            title,
            color: entity?.color,
            type,
            exceptionType,
          });
        }
      }

      for (const holiday of holidays) {
        if (dateStr >= holiday.startDate && dateStr <= holiday.endDate) {
          computedEvents.push({
            id: `${activeEntityId}-holiday-${holiday.id}-${dateStr}`,
            entityId: activeEntityId,
            date: currentDate,
            title: holiday.name,
            color: entity?.color,
            type: 'holiday',
          });
        }
      }
    }

    return computedEvents;
  }, [activeEntityId, monthDate, monthParam, schedules, exceptions, holidays, entity, t]);

  const monthLabel = format(monthDate, 'MMMM yyyy');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            {t('backToHome')}
          </Link>
          <h1 className="text-xl font-bold">{monthLabel}</h1>
          <div className="w-20" />
        </div>
        <nav className="border-t bg-background/50 px-4 py-2 flex items-center justify-center gap-2 overflow-x-auto">
          <Link
            href={`/${locale}/calendar/day/${format(new Date(), 'yyyy-MM-dd')}`}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors whitespace-nowrap"
          >
            {t('views.day')}
          </Link>
          <Link
            href={`/${locale}/calendar/week/${format(new Date(), 'yyyy-\'W\'ww')}`}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors whitespace-nowrap"
          >
            {t('views.week')}
          </Link>
          <Link
            href={`/${locale}/calendar/month/${todayMonth}`}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
              isSameMonth(new Date(), monthDate)
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            <Calendar className="h-3.5 w-3.5 inline mr-1" />
            {t('today')}
          </Link>
          <Link
            href={`/${locale}/calendar/semester`}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors whitespace-nowrap"
          >
            {t('views.semester')}
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">
        {entity ? (
          <div className="max-w-full mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: entity.color }}
                >
                  {entity.avatar}
                </div>
                <div>
                  <h2 className="font-semibold">{entity.name}</h2>
                  <p className="text-sm text-muted-foreground">{t('views.month')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/${locale}/calendar/month/${prevMonth}`}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={t('previous')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Link>
                <Link
                  href={`/${locale}/calendar/month/${todayMonth}`}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isSameMonth(new Date(), monthDate)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {t('today')}
                </Link>
                <Link
                  href={`/${locale}/calendar/month/${nextMonth}`}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={t('next')}
                >
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <CalendarGrid
              events={events}
              date={monthDate}
              view="month"
            />
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('noEvents')}</h2>
            <p className="text-muted-foreground">Select an entity to view their schedule</p>
          </div>
        )}
      </main>
    </div>
  );
}