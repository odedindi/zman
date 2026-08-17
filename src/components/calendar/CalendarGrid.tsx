'use client';

import { useTranslations, useLocale } from '@/i18n/context';
import { cn } from '@/lib/utils';

export interface CalendarEvent {
  id: string;
  entityId: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  title?: string;
  color?: string;
  type: 'regular' | 'holiday' | 'exception';
  exceptionType?: 'cancelled' | 'moved' | 'early_pickup' | 'late_drop';
}

interface CalendarGridProps {
  events: CalendarEvent[];
  date: Date;
  view: 'day' | 'week' | 'month';
  onEventClick?: (event: CalendarEvent) => void;
}

export function CalendarGrid({ events, date, view, onEventClick }: CalendarGridProps) {
  const t = useTranslations('calendar');
  const locale = useLocale();

  if (view === 'day') {
    return renderDayView(events, t, locale, onEventClick);
  }

  if (view === 'week') {
    return renderWeekView(events, date, t, locale, onEventClick);
  }

  return renderMonthView(events, date, t, locale, onEventClick);
}

function renderDayView(
  events: CalendarEvent[],
  t: ReturnType<typeof useTranslations>,
  locale: string,
  onEventClick?: (event: CalendarEvent) => void
) {
  const dayEvents = events.filter((e) => e.date.getDate() === new Date().getDate());
  const sortedEvents = [...dayEvents].sort((a, b) => {
    const aTime = a.startTime || '00:00';
    const bTime = b.startTime || '00:00';
    return aTime.localeCompare(bTime);
  });

  if (sortedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
        <p className="text-lg">{t('noEvents')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedEvents.map((event) => (
        <EventItem
          key={event.id}
          event={event}
          t={t}
          locale={locale}
          onClick={onEventClick}
        />
      ))}
    </div>
  );
}

function renderWeekView(
  events: CalendarEvent[],
  date: Date,
  t: ReturnType<typeof useTranslations>,
  locale: string,
  onEventClick?: (event: CalendarEvent) => void
) {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const daysShort = [
    t('daysShort.sun'),
    t('daysShort.mon'),
    t('daysShort.tue'),
    t('daysShort.wed'),
    t('daysShort.thu'),
    t('daysShort.fri'),
    t('daysShort.sat'),
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr className="border-b border-border">
            {days.map((day, index) => (
              <th
                key={index}
                className="p-3 text-left text-sm font-medium text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm z-10"
              >
                <div className="font-semibold">{daysShort[index]}</div>
                <div className="text-xs">{day.getDate()}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {days.map((day, index) => (
              <td
                key={index}
                className="p-2 border-r border-border vertical-align-top min-h-[200px]"
              >
                <div className="space-y-1">
                  {events
                    .filter((e) => isSameDay(e.date, day))
                    .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'))
                    .map((event) => (
                      <EventItem
                        key={event.id}
                        event={event}
                        t={t}
                        locale={locale}
                        onClick={onEventClick}
                        compact
                      />
                    ))}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function renderMonthView(
  events: CalendarEvent[],
  date: Date,
  t: ReturnType<typeof useTranslations>,
  locale: string,
  onEventClick?: (event: CalendarEvent) => void
) {
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();
  const prevMonthEnd = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

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
    const d = new Date(date.getFullYear(), date.getMonth() - 1, prevMonthEnd - startDay + 1 + i);
    currentWeek.push(d);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(date.getFullYear(), date.getMonth(), day);
    currentWeek.push(d);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    for (let i = currentWeek.length; i < 7; i++) {
      const d = new Date(date.getFullYear(), date.getMonth() + 1, i - currentWeek.length + 1);
      currentWeek.push(d);
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr className="border-b border-border">
            {daysShort.map((day, index) => (
              <th
                key={index}
                className="p-2 text-center text-xs font-medium text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm z-10"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((day, dayIndex) => (
                <td
                  key={dayIndex}
                  className={cn(
                    'p-1 border-r border-b border-border vertical-align-top min-h-[100px]',
                    day?.getMonth() !== date.getMonth() && 'bg-muted/30'
                  )}
                >
                  {day && (
                    <>
                      <div
                        className={cn(
                          'text-xs font-medium',
                          isSameDay(day, new Date()) && 'text-primary'
                        )}
                      >
                        {day.getDate()}
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {events
                          .filter((e) => isSameDay(e.date, day))
                          .slice(0, 3)
                          .map((event) => (
                            <EventItem
                              key={event.id}
                              event={event}
                              t={t}
                              locale={locale}
                              onClick={onEventClick}
                              compact
                              monthView
                            />
                          ))}
                        {events.filter((e) => isSameDay(e.date, day)).length > 3 && (
                          <div className="text-xs text-muted-foreground truncate">
                            +{events.filter((e) => isSameDay(e.date, day)).length - 3} {t('more')}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface EventItemProps {
  event: CalendarEvent;
  t: ReturnType<typeof useTranslations>;
  locale: string;
  onClick?: (event: CalendarEvent) => void;
  compact?: boolean;
  monthView?: boolean;
}

function EventItem({ event, t, locale, onClick, compact, monthView }: EventItemProps) {
  const isCancelled = event.exceptionType === 'cancelled';
  const exceptionLabels: Record<string, string> = {
    cancelled: t('exception.cancelled'),
    moved: t('exception.moved'),
    early_pickup: t('exception.earlyPickup'),
    late_drop: t('exception.lateDrop'),
  };

  const timeString = event.startTime && event.endTime
    ? `${event.startTime} - ${event.endTime}`
    : event.startTime
    ? event.startTime
    : '';

  const handleClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  const baseStyles = cn(
    'relative rounded border transition-colors cursor-pointer',
    'border-l-3',
    event.color ? `border-l-[${event.color}]` : 'border-l-primary',
    event.type === 'holiday' && 'bg-primary/5 border-l-primary',
    event.type === 'exception' && 'bg-amber/5 border-l-amber-500',
    isCancelled && 'opacity-50',
    compact && 'p-1.5 text-xs',
    !compact && 'p-2 text-sm',
    monthView && 'p-1 text-[10px]',
    'hover:bg-muted/50'
  );

  return (
    <div
      className={baseStyles}
      onClick={handleClick}
      style={{ borderLeftColor: event.color }}
    >
      {timeString && !monthView && (
        <div className="font-mono text-xs text-muted-foreground mb-0.5">{timeString}</div>
      )}
      <div
        className={cn(
          'font-medium truncate',
          isCancelled && 'line-through',
          monthView && 'text-[10px]'
        )}
      >
        {event.title ?? ''}
      </div>
      {event.exceptionType && !monthView && (
        <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
          {exceptionLabels[event.exceptionType]}
        </div>
      )}
    </div>
  );
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}