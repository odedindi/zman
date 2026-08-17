export interface CalendarHoliday {
  name: string;
  nameHe: string;
  startDate: string;
  endDate: string;
  type: 'school' | 'public';
}

export function getIsraeliHolidays(year: number): CalendarHoliday[] {
  const holidays: CalendarHoliday[] = [];

  const addHoliday = (name: string, nameHe: string, month: number, day: number, duration: number, type: 'school' | 'public') => {
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day + duration - 1);
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    holidays.push({
      name,
      nameHe,
      startDate: formatDate(start),
      endDate: formatDate(end),
      type,
    });
  };

  addHoliday('Rosh Hashanah', 'ראש השנה', 9, 15, 2, 'public');
  addHoliday('Yom Kippur', 'יום כיפור', 9, 24, 1, 'public');
  addHoliday('Sukkot', 'סוכות', 10, 1, 7, 'school');
  addHoliday('Simchat Torah', 'שמחת תורה', 10, 8, 1, 'public');
  addHoliday('Hanukkah', 'חנוכה', 12, 25, 8, 'school');
  addHoliday('Purim', 'פורים', 3, 14, 1, 'school');
  addHoliday('Passover', 'פסח', 4, 15, 7, 'school');
  addHoliday('Yom HaAtzmaut', 'יום העצמאות', 5, 5, 1, 'public');
  addHoliday('Shavuot', 'שבועות', 6, 6, 1, 'public');

  return holidays;
}