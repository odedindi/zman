import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateICS, downloadICS, entityToCalendarEvents, CalendarEvent } from '@/lib/export/ics';
import { generateCSV, downloadCSV } from '@/lib/export/csv';
import { Entity, ScheduleEntry, HolidayEntry, ExceptionEntry } from '@/store/entities';

function createTestEntity(): Entity {
  return {
    id: 'test-entity-1',
    name: 'Test School',
    color: '#3b82f6',
    avatar: '🏫',
    createdBy: 'user-1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function createTestSchedule(overrides: Partial<ScheduleEntry> = {}): ScheduleEntry {
  return {
    id: 'schedule-1',
    entityId: 'test-entity-1',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '14:00',
    location: 'Room 101',
    notes: 'Math class',
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

function createTestHoliday(overrides: Partial<HolidayEntry> = {}): HolidayEntry {
  return {
    id: 'holiday-1',
    entityId: 'test-entity-1',
    name: 'Summer Break',
    startDate: '2024-07-01',
    endDate: '2024-08-31',
    isSchoolHoliday: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

function createTestException(overrides: Partial<ExceptionEntry> = {}): ExceptionEntry {
  return {
    id: 'exception-1',
    entityId: 'test-entity-1',
    date: '2024-05-15',
    type: 'cancelled',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('ICS Export', () => {
  let entity: Entity;
  let schedules: ScheduleEntry[];
  let holidays: HolidayEntry[];
  let exceptions: ExceptionEntry[];

  beforeEach(() => {
    entity = createTestEntity();
    schedules = [createTestSchedule()];
    holidays = [createTestHoliday()];
    exceptions = [];
  });

  describe('generateICS', () => {
    it('should produce valid ICS format with BEGIN:VCALENDAR and END:VCALENDAR', () => {
      const events = entityToCalendarEvents(entity, schedules, holidays, exceptions);
      const ics = generateICS(events);
      
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('END:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('PRODID:-//zman//Schedule PWA//EN');
      expect(ics).toContain('CALSCALE:GREGORIAN');
      expect(ics).toContain('METHOD:PUBLISH');
    });

    it('should contain VEVENT for each event', () => {
      const events = entityToCalendarEvents(entity, schedules, holidays, exceptions);
      const ics = generateICS(events);
      
      const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
      expect(veventCount).toBe(events.length);
    });

    it('should contain RRULE for recurring events', () => {
      const events = entityToCalendarEvents(entity, schedules, holidays, exceptions);
      const ics = generateICS(events);
      
      const recurringEvents = events.filter(e => e.isRecurring);
      expect(recurringEvents.length).toBeGreaterThan(0);
      
      for (const event of recurringEvents) {
        const expectedRrule = `RRULE:FREQ=WEEKLY;BYDAY=${['SU','MO','TU','WE','TH','FR','SA'][event.dayOfWeek!]};UNTIL=${event.validUntil!.replace(/-/g, '')}`;
        expect(ics).toContain(expectedRrule);
      }
    });

    it('should contain proper date formatting for DTSTART and DTEND', () => {
      const events = entityToCalendarEvents(entity, schedules, holidays, exceptions);
      const ics = generateICS(events);
      
      expect(ics).toMatch(/DTSTART:\d{8}T\d{6}/);
      expect(ics).toMatch(/DTEND:\d{8}T\d{6}/);
    });

    it('should contain all-day event format for holidays', () => {
      const events = entityToCalendarEvents(entity, schedules, holidays, exceptions);
      const ics = generateICS(events);
      
      const holidayEvents = events.filter(e => !e.isRecurring && !e.exceptionType && e.endDate);
      for (const event of holidayEvents) {
        expect(ics).toContain(`DTSTART;VALUE=DATE:${event.startDate.replace(/-/g, '')}`);
        if (event.endDate && event.endDate !== event.startDate) {
          expect(ics).toContain(`DTEND;VALUE=DATE:${event.endDate.replace(/-/g, '')}`);
        }
      }
    });

    it('should contain SUMMARY for each event', () => {
      const events = entityToCalendarEvents(entity, schedules, holidays, exceptions);
      const ics = generateICS(events);
      
      for (const event of events) {
        const escapedTitle = event.title.replace(/[\\;,\n\r]/g, (c) => {
          const escapes: Record<string, string> = { '\\': '\\\\', ';': '\\;', ',': '\\,', '\n': '\\n', '\r': '' };
          return escapes[c] || c;
        });
        expect(ics).toContain(`SUMMARY:${escapedTitle}`);
      }
    });

    it('should contain LOCATION when provided', () => {
      const events = entityToCalendarEvents(entity, schedules, holidays, exceptions);
      const ics = generateICS(events);
      
      const scheduleEvents = events.filter(e => e.isRecurring && e.location);
      for (const event of scheduleEvents) {
        const escapedLocation = event.location!.replace(/[\\;,\n\r]/g, (c) => {
          const escapes: Record<string, string> = { '\\': '\\\\', ';': '\\;', ',': '\\,', '\n': '\\n', '\r': '' };
          return escapes[c] || c;
        });
        expect(ics).toContain(`LOCATION:${escapedLocation}`);
      }
    });

    it('should contain DESCRIPTION when provided', () => {
      const events = entityToCalendarEvents(entity, schedules, holidays, exceptions);
      const ics = generateICS(events);
      
      const scheduleEvents = events.filter(e => e.isRecurring && e.description);
      for (const event of scheduleEvents) {
        const escapedDescription = event.description!.replace(/[\\;,\n\r]/g, (c) => {
          const escapes: Record<string, string> = { '\\': '\\\\', ';': '\\;', ',': '\\,', '\n': '\\n', '\r': '' };
          return escapes[c] || c;
        });
        expect(ics).toContain(`DESCRIPTION:${escapedDescription}`);
      }
    });

    it('should contain STATUS:CANCELLED for cancelled exceptions', () => {
      const cancelledException = createTestException({
        date: '2024-01-01',
        type: 'cancelled',
      });
      
      const events = entityToCalendarEvents(entity, schedules, holidays, [cancelledException]);
      const ics = generateICS(events);
      
      expect(ics).toContain('STATUS:CANCELLED');
    });

    it('should escape special characters in text fields', () => {
      const scheduleWithSpecialChars = createTestSchedule({
        location: 'Room 101; Building A',
        notes: 'Notes with commas',
      });
      
      const events = entityToCalendarEvents(entity, [scheduleWithSpecialChars], holidays, exceptions);
      const ics = generateICS(events);
      
      expect(ics).toContain('LOCATION:Room 101\\; Building A');
      expect(ics).toContain('DESCRIPTION:Notes with commas');
    });

    it('should generate unique UID for each event', () => {
      const events = entityToCalendarEvents(entity, schedules, holidays, exceptions);
      const ics = generateICS(events);
      
      const uids = ics.match(/UID:.*@zman/g) || [];
      const uniqueUids = new Set(uids);
      expect(uniqueUids.size).toBe(uids.length);
    });

    it('should include DTSTAMP for each event', () => {
      const events = entityToCalendarEvents(entity, schedules, holidays, exceptions);
      const ics = generateICS(events);
      
      const dtstamps = ics.match(/DTSTAMP:\d{8}T\d{6}Z/g) || [];
      expect(dtstamps.length).toBe(events.length);
    });
  });

  describe('downloadICS', () => {
    it('should create blob and trigger download', () => {
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as Node);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);
      
      downloadICS('test content', 'test.ics');
      
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
      
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});

describe('CSV Export', () => {
  let entity: Entity;
  let schedules: ScheduleEntry[];

  beforeEach(() => {
    entity = createTestEntity();
    schedules = [createTestSchedule()];
  });

  describe('generateCSV', () => {
    it('should produce CSV with correct headers', () => {
      const csv = generateCSV(entity, schedules);
      const lines = csv.split('\n');
      
      expect(lines[0]).toBe('Entity;Day;Start Time;End Time;Location;Notes;Valid From;Valid Until');
    });

    it('should produce CSV with correct data rows', () => {
      const csv = generateCSV(entity, schedules);
      const lines = csv.split('\n');
      
      expect(lines[1]).toContain('Test School');
      expect(lines[1]).toContain('Monday');
      expect(lines[1]).toContain('08:00');
      expect(lines[1]).toContain('14:00');
      expect(lines[1]).toContain('Room 101');
      expect(lines[1]).toContain('Math class');
      expect(lines[1]).toContain('2024-01-01');
      expect(lines[1]).toContain('2024-12-31');
    });

    it('should use semicolon as delimiter', () => {
      const csv = generateCSV(entity, schedules);
      const lines = csv.split('\n');
      
      for (const line of lines) {
        const fields = line.split(';');
        expect(fields.length).toBe(8);
      }
    });

    it('should handle empty location and notes', () => {
      const scheduleNoLocation = createTestSchedule({
        location: undefined,
        notes: undefined,
      });
      
      const csv = generateCSV(entity, [scheduleNoLocation]);
      const lines = csv.split('\n');
      
      const fields = lines[1].split(';');
      expect(fields[4]).toBe('');
      expect(fields[5]).toBe('');
    });

    it('should escape semicolons in values', () => {
      const scheduleWithSemicolon = createTestSchedule({
        location: 'Room 101; Building A',
      });
      
      const csv = generateCSV(entity, [scheduleWithSemicolon]);
      const lines = csv.split('\n');
      
      expect(lines[1]).toContain('"Room 101; Building A"');
    });

    it('should escape double quotes in values', () => {
      const scheduleWithQuotes = createTestSchedule({
        notes: 'Notes with "quotes"',
      });
      
      const csv = generateCSV(entity, [scheduleWithQuotes]);
      const lines = csv.split('\n');
      
      expect(lines[1]).toContain('"Notes with ""quotes"""');
    });

    it('should handle newlines in values by escaping', () => {
      const scheduleWithNewline = createTestSchedule({
        notes: 'Line 1\nLine 2',
      });
      
      const csv = generateCSV(entity, [scheduleWithNewline]);
      
      expect(csv).toContain('"Line 1\nLine 2"');
    });

    it('should handle multiple schedules', () => {
      const schedule2 = createTestSchedule({
        id: 'schedule-2',
        dayOfWeek: 2,
        startTime: '10:00',
        endTime: '12:00',
        location: 'Room 102',
        notes: 'Science',
      });
      
      const csv = generateCSV(entity, [schedules[0], schedule2]);
      const lines = csv.split('\n');
      
      expect(lines.length).toBe(3);
      expect(lines[1]).toContain('Monday');
      expect(lines[2]).toContain('Tuesday');
    });

    it('should map dayOfWeek to correct day names', () => {
      const testCases = [
        { dayOfWeek: 0, expectedDay: 'Sunday' },
        { dayOfWeek: 1, expectedDay: 'Monday' },
        { dayOfWeek: 2, expectedDay: 'Tuesday' },
        { dayOfWeek: 3, expectedDay: 'Wednesday' },
        { dayOfWeek: 4, expectedDay: 'Thursday' },
        { dayOfWeek: 5, expectedDay: 'Friday' },
        { dayOfWeek: 6, expectedDay: 'Saturday' },
      ];
      
      for (const { dayOfWeek, expectedDay } of testCases) {
        const schedule = createTestSchedule({ dayOfWeek });
        const csv = generateCSV(entity, [schedule]);
        const lines = csv.split('\n');
        
        expect(lines[1]).toContain(expectedDay);
      }
    });
  });

  describe('downloadCSV', () => {
    it('should create blob and trigger download', () => {
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
      const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as Node);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as Node);
      
      downloadCSV('test content', 'test.csv');
      
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
      
      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});