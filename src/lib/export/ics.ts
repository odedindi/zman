import { ScheduleEntry, HolidayEntry, ExceptionEntry, Entity } from '@/store/entities';

export interface CalendarEvent {
  title: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
  color?: string;
  isRecurring?: boolean;
  dayOfWeek?: number;
  validFrom?: string;
  validUntil?: string;
  exceptionType?: string;
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

function formatICSDate(dateStr: string, timeStr?: string): string {
  const date = dateStr.replace(/-/g, '');
  if (timeStr) {
    const time = timeStr.replace(/:/g, '');
    return `${date}T${time}00`;
  }
  return `${date}`;
}

function formatICSDateTime(dateStr: string, timeStr: string): string {
  const date = dateStr.replace(/-/g, '');
  const time = timeStr.replace(/:/g, '');
  return `${date}T${time}00`;
}

function getDayOfWeekICS(dayOfWeek: number): string {
  const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  return days[dayOfWeek];
}

function generateVEVENT(event: CalendarEvent, options?: { companyName?: string }): string {
  const lines: string[] = ['BEGIN:VEVENT'];
  
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@zman`;
  lines.push(`UID:${uid}`);
  
  const dtStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  lines.push(`DTSTAMP:${dtStamp}`);
  
  if (event.startTime && event.endTime) {
    lines.push(`DTSTART:${formatICSDateTime(event.startDate, event.startTime)}`);
    lines.push(`DTEND:${formatICSDateTime(event.startDate, event.endTime)}`);
  } else if (event.startTime) {
    lines.push(`DTSTART:${formatICSDateTime(event.startDate, event.startTime)}`);
    lines.push(`DTEND:${formatICSDateTime(event.startDate, event.endTime || '23:59')}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${formatICSDate(event.startDate)}`);
    if (event.endDate && event.endDate !== event.startDate) {
      lines.push(`DTEND;VALUE=DATE:${formatICSDate(event.endDate)}`);
    }
  }
  
  lines.push(`SUMMARY:${escapeICS(event.title)}`);
  
  if (event.location) {
    lines.push(`LOCATION:${escapeICS(event.location)}`);
  }
  
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
  }
  
  if (event.isRecurring && event.dayOfWeek !== undefined && event.validFrom && event.validUntil) {
    const byDay = getDayOfWeekICS(event.dayOfWeek);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${byDay};UNTIL=${formatICSDate(event.validUntil)}`);
  }
  
  if (event.exceptionType === 'cancelled') {
    lines.push(`STATUS:CANCELLED`);
  }
  
  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

export function generateICS(
  events: CalendarEvent[],
  options?: { fileName?: string; companyName?: string }
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//zman//Schedule PWA//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  
  for (const event of events) {
    lines.push(generateVEVENT(event, options));
  }
  
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICS(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function scheduleToCalendarEvents(
  entity: Entity,
  schedule: ScheduleEntry,
  exceptions: ExceptionEntry[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const exceptionMap = new Map(exceptions.map((e) => [e.date, e]));
  
  const startDate = new Date(schedule.validFrom);
  const endDate = new Date(schedule.validUntil);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();
    
    if (dayOfWeek !== schedule.dayOfWeek) continue;
    
    const exception = exceptionMap.get(dateStr);
    let startTime = schedule.startTime;
    let endTime = schedule.endTime;
    let title = schedule.location || entity.name;
    let exceptionType: string | undefined;
    
    if (exception) {
      if (exception.type === 'cancelled') {
        exceptionType = 'cancelled';
        title = `Cancelled: ${title}`;
      } else {
        startTime = exception.newStartTime || startTime;
        endTime = exception.newEndTime || endTime;
        exceptionType = exception.type;
        title = exception.notes || exception.type;
      }
    }
    
    events.push({
      title,
      startDate: dateStr,
      startTime,
      endTime,
      location: schedule.location,
      description: schedule.notes,
      color: entity.color,
      isRecurring: true,
      dayOfWeek: schedule.dayOfWeek,
      validFrom: schedule.validFrom,
      validUntil: schedule.validUntil,
      exceptionType,
    });
  }
  
  return events;
}

function holidayToCalendarEvents(entity: Entity, holiday: HolidayEntry): CalendarEvent[] {
  return [{
    title: holiday.name,
    startDate: holiday.startDate,
    endDate: holiday.endDate,
    location: entity.name,
    color: entity.color,
    isRecurring: false,
  }];
}

export function entityToCalendarEvents(
  entity: Entity,
  schedules: ScheduleEntry[],
  holidays: HolidayEntry[],
  exceptions: ExceptionEntry[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  
  for (const schedule of schedules) {
    events.push(...scheduleToCalendarEvents(entity, schedule, exceptions));
  }
  
  for (const holiday of holidays) {
    events.push(...holidayToCalendarEvents(entity, holiday));
  }
  
  return events;
}