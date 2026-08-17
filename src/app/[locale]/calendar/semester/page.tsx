'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from '@/i18n/context';
import { useEntitiesStore, Entity, ScheduleEntry, HolidayEntry, ExceptionEntry } from '@/store/entities';
import { CalendarGrid, CalendarEvent } from '@/components/calendar/CalendarGrid';
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, getMonth, getYear } from 'date-fns';
import { cn } from '@/lib/utils';

interface SemesterViewPageProps {
  params: Promise<{ locale: string }>;
}

export default function SemesterViewPage({ params }: SemesterViewPageProps) {
  const t = useTranslations('calendar');
  const locale = useLocale();
  const store = useEntitiesStore();

  const activeEntityId = store.activeEntityId;
  const entity = activeEntityId ? store.entities[activeEntityId] : null;
  const schedules = activeEntityId ? (store.schedules[activeEntityId] || []) : [];
  const exceptions = activeEntityId ? (store.exceptions[activeEntityId] || []) : [];
  const holidays = activeEntityId ? (store.holidays[activeEntityId] || []) : [];

  const [offset, setOffset] = useState(0);
  const currentDate = new Date();

  const semesterStart = startOfMonth(addMonths(currentDate, offset - 2));
  const semesterEnd = endOfMonth(addMonths(currentDate, offset + 3));

  const months = useMemo(() => {
    const result: Date[] = [];
    for (let m = new Date(semesterStart); m <= semesterEnd; m.setMonth(m.getMonth() + 1)) {
      result.push(new Date(m));
    }
    return result;
  }, [semesterStart, semesterEnd]);

  const events = useMemo((): CalendarEvent[] => {
    if (!activeEntityId) return [];

    const computedEvents: CalendarEvent[] = [];

    for (const monthDate of months) {
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
    }

    return computedEvents;
  }, [activeEntityId, months, schedules, exceptions, holidays, entity, t]);

  const prevSemester = () => setOffset((o) => o - 6);
  const nextSemester = () => setOffset((o) => o + 6);
  const currentSemester = () => setOffset(0);

  const semesterLabel = `${format(semesterStart, 'MMM yyyy')} - ${format(semesterEnd, 'MMM yyyy')}`;

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
          <h1 className="text-xl font-bold">{t('views.semester')}</h1>
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
            href={`/${locale}/calendar/month/${format(new Date(), 'yyyy-MM')}`}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors whitespace-nowrap"
          >
            {t('views.month')}
          </Link>
          <Link
            href={`/${locale}/calendar/semester`}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground whitespace-nowrap"
          >
            <Calendar className="h-3.5 w-3.5 inline mr-1" />
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
                  <p className="text-sm text-muted-foreground">{semesterLabel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevSemester}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={t('previous')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={currentSemester}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    offset === 0
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {t('today')}
                </button>
                <button
                  onClick={nextSemester}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label={t('next')}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {months.map((monthDate) => (
                <MonthMiniCalendar
                  key={monthDate.toISOString()}
                  monthDate={monthDate}
                  events={events.filter((e) => isSameMonthLocal(e.date, monthDate))}
                  entity={entity}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">{t('semester.progress')}</h3>
              <SemesterProgressBar
                semesterStart={semesterStart}
                semesterEnd={semesterEnd}
                events={events}
                entityColor={entity.color}
              />
            </div>
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

interface MonthMiniCalendarProps {
  monthDate: Date;
  events: CalendarEvent[];
  entity: Entity;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}

function MonthMiniCalendar({ monthDate, events, entity, locale, t }: MonthMiniCalendarProps) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const startDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  const prevMonthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth(), 0).getDate();

  const daysShort = [
    t('daysShort.sun'),
    t('daysShort.mon'),
    t('daysShort.tue'),
    t('daysShort.wed'),
    t('daysShort.thu'),
    t('daysShort.fri'),
    t('daysShort.sat'),
  ];

  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    const d = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, prevMonthEnd - startDay + 1 + i);
    currentWeek.push(d);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    for (let i = currentWeek.length; i < 7; i++) {
      const d = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, i - currentWeek.length + 1);
      currentWeek.push(d);
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-border p-4">
      <div className="font-semibold mb-2 text-center">
        {format(monthDate, 'MMMM yyyy')}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
        {daysShort.map((day, index) => (
          <div key={index}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.map((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <div
              key={`${weekIndex}-${dayIndex}`}
              className={cn(
                'aspect-square flex flex-col items-center justify-center text-xs rounded',
                day?.getMonth() !== monthDate.getMonth() && 'text-muted-foreground/50',
                isSameDayLocal(day, new Date()) && day?.getDate() === new Date().getDate() && 'bg-primary text-primary-foreground font-bold'
              )}
            >
              {day && (
                <>
                  <span>{day.getDate()}</span>
                  <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
                    {events
                      .filter((e) => isSameDayLocal(e.date, day))
                      .slice(0, 2)
                      .map((event) => (
                        <div
                          key={event.id}
                          className="w-1.5 h-1.5 rounded"
                          style={{ backgroundColor: event.color || entity.color }}
                        />
                      ))}
                    {events.filter((e) => isSameDayLocal(e.date, day)).length > 2 && (
                      <span className="text-[8px] text-muted-foreground">
                        +{events.filter((e) => isSameDayLocal(e.date, day)).length - 2}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function isSameDayLocal(a: Date | null | undefined, b: Date): boolean {
  if (!a) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonthLocal(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

interface SemesterProgressBarProps {
  semesterStart: Date;
  semesterEnd: Date;
  events: CalendarEvent[];
  entityColor: string | undefined;
}

function SemesterProgressBar({ semesterStart, semesterEnd, events, entityColor }: SemesterProgressBarProps) {
  const now = new Date();
  const totalDays = Math.ceil((semesterEnd.getTime() - semesterStart.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - semesterStart.getTime()) / (1000 * 60 * 60 * 24)));
  const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

  const eventDays = new Set(events.map((e) => format(e.date, 'yyyy-MM-dd')));
  const totalEventDays = eventDays.size;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
        <span className="text-sm text-muted-foreground">{totalEventDays} event days</span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: entityColor || '#3b82f6',
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{format(semesterStart, 'MMM d')}</span>
        <span>{format(now, 'MMM d')}</span>
        <span>{format(semesterEnd, 'MMM d')}</span>
      </div>
    </div>
  );
}