'use client';

import { useTranslations } from '@/i18n/context';
import { ScheduleEntry } from '@/store/entities';
import { Edit, Trash2, MapPin, FileText, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleListProps {
  schedules: ScheduleEntry[];
  entityColor: string;
  onEdit: (schedule: ScheduleEntry) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
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

export function ScheduleList({ schedules, entityColor, onEdit, onDelete, onAdd }: ScheduleListProps) {
  const t = useTranslations('schedule');

  const groupedByDay = DAYS_OF_WEEK.map((day) => ({
    day: day.value,
    label: t(day.label),
    schedules: schedules.filter((s) => s.dayOfWeek === day.value),
  }));

  const hasAnySchedules = schedules.length > 0;

  return (
    <div className="space-y-6">
      <button
        onClick={onAdd}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        <span className="h-5 w-5" />
        {t('addSchedule')}
      </button>

      {!hasAnySchedules && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
            <Clock className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('noSchedules')}</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t('noSchedules')}</p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <span className="h-5 w-5" />
            {t('addFirst')}
          </button>
        </div>
      )}

      {hasAnySchedules && (
        <div className="space-y-6">
          {groupedByDay.map(({ day, label, schedules: daySchedules }) => (
            daySchedules.length > 0 && (
              <section key={day} className="space-y-3">
                <h3 className="text-lg font-semibold text-muted-foreground flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entityColor }}
                  />
                  {label}
                </h3>
                <div className="space-y-3">
                  {daySchedules.map((schedule) => (
                    <article
                      key={schedule.id}
                      className={cn(
                        'flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-border',
                        'transition-all hover:shadow-md'
                      )}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                        style={{ backgroundColor: entityColor }}
                      >
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {schedule.startTime} – {schedule.endTime}
                          </span>
                        </div>
                        {schedule.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {schedule.location}
                          </p>
                        )}
                        {schedule.notes && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1 line-clamp-1">
                            <FileText className="h-3.5 w-3.5" />
                            {schedule.notes}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('validFrom')}: {schedule.validFrom} – {t('validUntil')}: {schedule.validUntil}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(schedule)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          aria-label={t('edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(schedule.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          aria-label={t('delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )
          ))}
        </div>
      )}
    </div>
  );
}