import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarGrid, CalendarEvent } from '@/components/calendar/CalendarGrid';
import { I18nProvider } from '@/i18n/context';

const mockMessages = {
  calendar: {
    noEvents: 'No events',
    more: 'more',
    daysShort: {
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
    },
    exception: {
      cancelled: 'Cancelled',
      moved: 'Moved',
      earlyPickup: 'Early pickup',
      lateDrop: 'Late drop',
    },
  },
};

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider locale="en" messages={mockMessages}>
      {ui}
    </I18nProvider>
  );
}

const createMockEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
  id: 'event-1',
  entityId: 'entity-1',
  date: new Date('2024-01-15'),
  startTime: '08:00',
  endTime: '14:00',
  title: 'Math Class',
  color: '#3b82f6',
  type: 'regular',
  ...overrides,
});

describe('CalendarGrid', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Day View', () => {
    it('should render events for the current day', () => {
      const events = [
        createMockEvent({ date: new Date('2024-01-15'), title: 'Math Class' }),
        createMockEvent({ id: 'event-2', date: new Date('2024-01-15'), title: 'Science Class' }),
      ];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="day" />);

      expect(screen.getByText('Math Class')).toBeInTheDocument();
      expect(screen.getByText('Science Class')).toBeInTheDocument();
    });

    it('should not render events for other days', () => {
      const events = [
        createMockEvent({ date: new Date('2024-01-15'), title: 'Math Class' }),
        createMockEvent({ id: 'event-2', date: new Date('2024-01-16'), title: 'Science Class' }),
      ];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="day" />);

      expect(screen.getByText('Math Class')).toBeInTheDocument();
      expect(screen.queryByText('Science Class')).not.toBeInTheDocument();
    });

    it('should show "No events" message when no events for the day', () => {
      const events = [
        createMockEvent({ date: new Date('2024-01-16'), title: 'Science Class' }),
      ];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="day" />);

      expect(screen.getByText('No events')).toBeInTheDocument();
    });

    it('should sort events by start time', () => {
      const events = [
        createMockEvent({ id: 'event-1', startTime: '10:00', endTime: '12:00', title: 'Late Class' }),
        createMockEvent({ id: 'event-2', startTime: '08:00', endTime: '10:00', title: 'Early Class' }),
      ];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="day" />);

      const eventElements = screen.getAllByText(/Class/);
      expect(eventElements[0]).toHaveTextContent('Early Class');
      expect(eventElements[1]).toHaveTextContent('Late Class');
    });

    it('should call onEventClick when event is clicked', () => {
      const onEventClick = vi.fn();
      const events = [createMockEvent()];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="day" onEventClick={onEventClick} />);

      fireEvent.click(screen.getByText('Math Class'));
      expect(onEventClick).toHaveBeenCalledWith(events[0]);
    });

    it('should display time range for events with start and end time', () => {
      const events = [createMockEvent({ startTime: '08:00', endTime: '14:00' })];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="day" />);

      expect(screen.getByText('08:00 - 14:00')).toBeInTheDocument();
    });

    it('should display only start time when end time is missing', () => {
      const events = [createMockEvent({ startTime: '08:00', endTime: undefined })];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="day" />);

      expect(screen.getByText('08:00')).toBeInTheDocument();
    });

    it('should display event color as left border', () => {
      const events = [createMockEvent({ color: '#ef4444' })];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="day" />);

      const eventElement = screen.getByText('Math Class').closest('div')?.parentElement;
      expect(eventElement).toBeInTheDocument();
      expect(eventElement?.className).toContain('border-l');
    });
  });

  describe('Week View', () => {
    it('should render 7 day columns', () => {
      const events = [createMockEvent({ date: new Date('2024-01-15') })];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="week" />);

      const dayHeaders = screen.getAllByRole('columnheader');
      expect(dayHeaders.length).toBe(7);
    });

    it('should show day names and dates in headers', () => {
      const events = [createMockEvent({ date: new Date('2024-01-15') })];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="week" />);

      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should render events in correct day column', () => {
      const events = [
        createMockEvent({ id: 'event-1', date: new Date('2024-01-15'), title: 'Monday Event' }),
        createMockEvent({ id: 'event-2', date: new Date('2024-01-16'), title: 'Tuesday Event' }),
      ];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="week" />);

      expect(screen.getByText('Monday Event')).toBeInTheDocument();
      expect(screen.getByText('Tuesday Event')).toBeInTheDocument();
    });

    it('should sort events by time within each day', () => {
      const events = [
        createMockEvent({ id: 'event-1', date: new Date('2024-01-15'), startTime: '10:00', title: 'Late Event' }),
        createMockEvent({ id: 'event-2', date: new Date('2024-01-15'), startTime: '08:00', title: 'Early Event' }),
      ];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="week" />);

      const eventElements = screen.getAllByText(/Event/);
      expect(eventElements[0]).toHaveTextContent('Early Event');
      expect(eventElements[1]).toHaveTextContent('Late Event');
    });

    it('should show exception type label for exceptions', () => {
      const events = [
        createMockEvent({ 
          type: 'exception', 
          exceptionType: 'cancelled',
          title: 'Cancelled Class',
        }),
      ];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="week" />);

      expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    it('should apply strikethrough for cancelled events', () => {
      const events = [
        createMockEvent({ 
          type: 'exception', 
          exceptionType: 'cancelled',
          title: 'Cancelled Class',
        }),
      ];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="week" />);

      const eventElement = screen.getByText('Cancelled Class').closest('div');
      expect(eventElement).toBeInTheDocument();
      expect(eventElement?.className).toContain('line-through');
    });

    it('should show amber border for exception events', () => {
      const events = [
        createMockEvent({ 
          type: 'exception', 
          exceptionType: 'moved',
          title: 'Moved Class',
        }),
      ];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="week" />);

      const eventElement = screen.getByText('Moved Class').closest('div')?.parentElement;
      expect(eventElement).toBeInTheDocument();
      expect(eventElement?.className).toContain('border-l');
    });
  });

  describe('Month View', () => {
    it('should render calendar grid with weeks', () => {
      const events = [createMockEvent({ date: new Date('2024-01-15') })];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="month" />);

      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });

    it('should show day numbers', () => {
      const events = [createMockEvent({ date: new Date('2024-01-15') })];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="month" />);

      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should highlight current day', () => {
      const events = [createMockEvent({ date: new Date('2024-01-15') })];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="month" />);

      const todayText = screen.getByText('15');
      const dayNumberDiv = todayText.closest('div');
      expect(dayNumberDiv).toBeInTheDocument();
      expect(dayNumberDiv?.className).toContain('text-primary');
    });

    it('should show events for each day', () => {
      const events = [
        createMockEvent({ id: 'event-1', date: new Date('2024-01-15'), title: 'Event 1' }),
        createMockEvent({ id: 'event-2', date: new Date('2024-01-16'), title: 'Event 2' }),
      ];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="month" />);

      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
    });

    it('should limit events to 3 per day and show "+N more"', () => {
      const events = [
        createMockEvent({ id: 'event-1', date: new Date('2024-01-15'), title: 'Event 1' }),
        createMockEvent({ id: 'event-2', date: new Date('2024-01-15'), title: 'Event 2' }),
        createMockEvent({ id: 'event-3', date: new Date('2024-01-15'), title: 'Event 3' }),
        createMockEvent({ id: 'event-4', date: new Date('2024-01-15'), title: 'Event 4' }),
        createMockEvent({ id: 'event-5', date: new Date('2024-01-15'), title: 'Event 5' }),
      ];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="month" />);

      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
      expect(screen.getByText('Event 3')).toBeInTheDocument();
      expect(screen.getByText('+2 more')).toBeInTheDocument();
    });

    it('should show holiday events with primary background', () => {
      const events = [
        createMockEvent({ 
          type: 'holiday', 
          title: 'Summer Break',
        }),
      ];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="month" />);

      const eventElement = screen.getByText('Summer Break').closest('div')?.parentElement;
      expect(eventElement).toBeInTheDocument();
      expect(eventElement?.className).toContain('bg-primary');
    });

    it('should show days from previous/next month with muted background', () => {
      const events: CalendarEvent[] = [];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="month" />);

      // January 2024 starts on Monday, so Dec 31 (Sunday) should be shown
      const prevMonthDays = screen.getAllByText('31');
      const prevMonthDay = prevMonthDays.find(el => el.closest('td')?.className.includes('bg-muted'));
      expect(prevMonthDay).toBeInTheDocument();
    });
  });

  describe('Event Types', () => {
    it('should render regular events with entity color border', () => {
      const events = [createMockEvent({ type: 'regular', color: '#3b82f6' })];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="day" />);

      const eventElement = screen.getByText('Math Class').closest('div')?.parentElement;
      expect(eventElement).toBeInTheDocument();
      expect(eventElement?.className).toContain('border-l');
    });

    it('should render holiday events with primary border', () => {
      const events = [createMockEvent({ type: 'holiday', title: 'Holiday' })];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="day" />);

      const eventElement = screen.getByText('Holiday').closest('div')?.parentElement;
      expect(eventElement).toBeInTheDocument();
      expect(eventElement?.className).toContain('border-l');
    });

    it('should render exception events with amber border', () => {
      const events = [createMockEvent({ type: 'exception', exceptionType: 'moved', title: 'Exception' })];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="day" />);

      const eventElement = screen.getByText('Exception').closest('div')?.parentElement;
      expect(eventElement).toBeInTheDocument();
      expect(eventElement?.className).toContain('border-l');
    });

    it('should apply opacity for cancelled events', () => {
      const events = [createMockEvent({ type: 'exception', exceptionType: 'cancelled', title: 'Cancelled Event' })];

      renderWithI18n(<CalendarGrid events={events} date={new Date('2024-01-15')} view="day" />);

      const eventElement = screen.getByText('Cancelled Event').closest('div');
      expect(eventElement).toBeInTheDocument();
      expect(eventElement?.className).toContain('line-through');
    });
  });
});