import { describe, it, expect, beforeEach } from 'vitest';
import { Entity, ScheduleEntry, HolidayEntry, ExceptionEntry } from '@/store/entities';
import { entityToCalendarEvents, CalendarEvent } from '@/lib/export/ics';

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

describe('Calendar Computation', () => {
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

  describe('Schedule filtering by dayOfWeek', () => {
    it('should include schedule on matching dayOfWeek', () => {
      const events = entityToCalendarEvents(entity, schedules, [], []);
      
      const mondayEvents = events.filter(e => e.dayOfWeek === 1);
      expect(mondayEvents.length).toBeGreaterThan(0);
    });

    it('should not include schedule on non-matching dayOfWeek', () => {
      const events = entityToCalendarEvents(entity, schedules, [], []);
      
      const tuesdayEvents = events.filter(e => e.dayOfWeek === 2);
      expect(tuesdayEvents.length).toBe(0);
    });

    it('should filter schedules by validFrom date', () => {
      const futureSchedule = createTestSchedule({
        validFrom: '2025-01-01',
        validUntil: '2025-12-31',
      });
      
      const events = entityToCalendarEvents(entity, [futureSchedule], [], []);
      
      const eventsIn2024 = events.filter(e => e.startDate.startsWith('2024'));
      expect(eventsIn2024.length).toBe(0);
    });

    it('should filter schedules by validUntil date', () => {
      const pastSchedule = createTestSchedule({
        validFrom: '2023-01-01',
        validUntil: '2023-12-31',
      });
      
      const events = entityToCalendarEvents(entity, [pastSchedule], [], []);
      
      const eventsIn2024 = events.filter(e => e.startDate.startsWith('2024'));
      expect(eventsIn2024.length).toBe(0);
    });

    it('should include schedules within valid date range', () => {
      const events = entityToCalendarEvents(entity, schedules, [], []);
      
      const eventsIn2024 = events.filter(e => e.startDate.startsWith('2024'));
      expect(eventsIn2024.length).toBeGreaterThan(0);
    });
  });

  describe('Exception handling', () => {
    it('should apply cancelled exception to event', () => {
      const cancelledException = createTestException({
        date: '2024-01-01',
        type: 'cancelled',
      });
      
      const events = entityToCalendarEvents(entity, schedules, [], [cancelledException]);
      
      const cancelledEvent = events.find(e => e.startDate === '2024-01-01' && e.exceptionType === 'cancelled');
      expect(cancelledEvent).toBeDefined();
      expect(cancelledEvent?.title).toContain('Cancelled');
    });

    it('should apply moved exception with new times', () => {
      const movedException = createTestException({
        date: '2024-01-01',
        type: 'moved',
        newStartTime: '10:00',
        newEndTime: '16:00',
      });
      
      const events = entityToCalendarEvents(entity, schedules, [], [movedException]);
      
      const movedEvent = events.find(e => e.startDate === '2024-01-01' && e.exceptionType === 'moved');
      expect(movedEvent).toBeDefined();
      expect(movedEvent?.startTime).toBe('10:00');
      expect(movedEvent?.endTime).toBe('16:00');
    });

    it('should apply early_pickup exception', () => {
      const earlyPickupException = createTestException({
        date: '2024-01-01',
        type: 'early_pickup',
        newEndTime: '12:00',
      });
      
      const events = entityToCalendarEvents(entity, schedules, [], [earlyPickupException]);
      
      const earlyEvent = events.find(e => e.startDate === '2024-01-01' && e.exceptionType === 'early_pickup');
      expect(earlyEvent).toBeDefined();
      expect(earlyEvent?.endTime).toBe('12:00');
    });

    it('should apply late_drop exception', () => {
      const lateDropException = createTestException({
        date: '2024-01-01',
        type: 'late_drop',
        newStartTime: '09:00',
      });
      
      const events = entityToCalendarEvents(entity, schedules, [], [lateDropException]);
      
      const lateEvent = events.find(e => e.startDate === '2024-01-01' && e.exceptionType === 'late_drop');
      expect(lateEvent).toBeDefined();
      expect(lateEvent?.startTime).toBe('09:00');
    });

    it('should not apply exception on different date', () => {
      const exception = createTestException({
        date: '2024-01-08',
        type: 'cancelled',
      });
      
      const events = entityToCalendarEvents(entity, schedules, [], [exception]);
      
      const jan1Event = events.find(e => e.startDate === '2024-01-01');
      expect(jan1Event?.exceptionType).toBeUndefined();
    });
  });

  describe('Holiday handling', () => {
    it('should include holidays as events', () => {
      const events = entityToCalendarEvents(entity, [], holidays, []);
      
      const holidayEvent = events.find(e => e.title === 'Summer Break');
      expect(holidayEvent).toBeDefined();
      expect(holidayEvent?.startDate).toBe('2024-07-01');
      expect(holidayEvent?.endDate).toBe('2024-08-31');
    });

    it('should include holidays even with future dates', () => {
      const futureHoliday = createTestHoliday({
        startDate: '2025-07-01',
        endDate: '2025-08-31',
      });
      
      const events = entityToCalendarEvents(entity, [], [futureHoliday], []);
      
      const holidayEvent = events.find(e => e.title === 'Summer Break');
      expect(holidayEvent).toBeDefined();
      expect(holidayEvent?.startDate).toBe('2025-07-01');
    });

    it('should include multi-day holidays as single event with start and end date', () => {
      const events = entityToCalendarEvents(entity, [], holidays, []);
      
      const holidayEvent = events.find(e => e.title === 'Summer Break');
      expect(holidayEvent).toBeDefined();
      expect(holidayEvent?.startDate).toBe('2024-07-01');
      expect(holidayEvent?.endDate).toBe('2024-08-31');
      expect(holidayEvent?.isRecurring).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple schedules per day', () => {
      const schedule2 = createTestSchedule({
        id: 'schedule-2',
        dayOfWeek: 1,
        startTime: '15:00',
        endTime: '17:00',
        location: 'Room 102',
        notes: 'Sports',
      });
      
      const events = entityToCalendarEvents(entity, [schedules[0], schedule2], [], []);
      
      const mondayEvents = events.filter(e => e.dayOfWeek === 1 && e.startDate === '2024-01-01');
      expect(mondayEvents.length).toBe(2);
    });

    it('should handle schedule with no location', () => {
      const scheduleNoLocation = createTestSchedule({
        location: undefined,
      });
      
      const events = entityToCalendarEvents(entity, [scheduleNoLocation], [], []);
      
      const event = events.find(e => e.startDate === '2024-01-01');
      expect(event).toBeDefined();
      expect(event?.location).toBeUndefined();
    });

    it('should handle schedule with no notes', () => {
      const scheduleNoNotes = createTestSchedule({
        notes: undefined,
      });
      
      const events = entityToCalendarEvents(entity, [scheduleNoNotes], [], []);
      
      const event = events.find(e => e.startDate === '2024-01-01');
      expect(event).toBeDefined();
      expect(event?.description).toBeUndefined();
    });

    it('should generate recurring events with RRULE data', () => {
      const events = entityToCalendarEvents(entity, schedules, [], []);
      
      const recurringEvent = events.find(e => e.isRecurring === true);
      expect(recurringEvent).toBeDefined();
      expect(recurringEvent?.dayOfWeek).toBe(1);
      expect(recurringEvent?.validFrom).toBe('2024-01-01');
      expect(recurringEvent?.validUntil).toBe('2024-12-31');
    });

    it('should handle empty schedules array', () => {
      const events = entityToCalendarEvents(entity, [], holidays, []);
      
      const scheduleEvents = events.filter(e => e.isRecurring === true);
      expect(scheduleEvents.length).toBe(0);
      
      const holidayEvents = events.filter(e => e.title === 'Summer Break');
      expect(holidayEvents.length).toBe(1);
    });

    it('should handle empty holidays array', () => {
      const events = entityToCalendarEvents(entity, schedules, [], []);
      
      const holidayEvents = events.filter(e => !e.isRecurring && !e.exceptionType);
      expect(holidayEvents.length).toBe(0);
      
      const scheduleEvents = events.filter(e => e.isRecurring === true);
      expect(scheduleEvents.length).toBeGreaterThan(0);
    });

    it('should handle empty exceptions array', () => {
      const events = entityToCalendarEvents(entity, schedules, holidays, []);
      
      const scheduleEvents = events.filter(e => e.isRecurring === true);
      expect(scheduleEvents.length).toBeGreaterThan(0);
      
      const exceptionEvents = events.filter(e => e.exceptionType);
      expect(exceptionEvents.length).toBe(0);
    });

    it('should handle validFrom/validUntil boundaries correctly', () => {
      const singleDaySchedule = createTestSchedule({
        validFrom: '2024-06-15',
        validUntil: '2024-06-15',
        dayOfWeek: 6,
      });
      
      const events = entityToCalendarEvents(entity, [singleDaySchedule], [], []);
      
      const event = events.find(e => e.startDate === '2024-06-15');
      expect(event).toBeDefined();
      
      const otherEvents = events.filter(e => e.startDate !== '2024-06-15');
      expect(otherEvents.length).toBe(0);
    });
  });
});