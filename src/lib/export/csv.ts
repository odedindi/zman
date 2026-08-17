import { ScheduleEntry, Entity } from '@/store/entities';

export interface CSVRow {
  entity: string;
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  validFrom: string;
  validUntil: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function escapeCSV(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function generateCSVRow(row: CSVRow): string {
  const values = [
    row.entity,
    row.day,
    row.startTime,
    row.endTime,
    row.location,
    row.notes,
    row.validFrom,
    row.validUntil,
  ];
  return values.map(escapeCSV).join(';');
}

export function generateCSV(
  entity: Entity,
  schedules: ScheduleEntry[]
): string {
  const headers = [
    'Entity',
    'Day',
    'Start Time',
    'End Time',
    'Location',
    'Notes',
    'Valid From',
    'Valid Until',
  ];
  
  const rows: CSVRow[] = schedules.map((schedule) => ({
    entity: entity.name,
    day: DAYS[schedule.dayOfWeek],
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    location: schedule.location || '',
    notes: schedule.notes || '',
    validFrom: schedule.validFrom,
    validUntil: schedule.validUntil,
  }));
  
  const headerLine = headers.map(escapeCSV).join(';');
  const dataLines = rows.map(generateCSVRow);
  
  return [headerLine, ...dataLines].join('\n');
}

export function downloadCSV(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}