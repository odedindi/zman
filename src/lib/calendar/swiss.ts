import { CalendarHoliday } from './israel';

const SWISS_CANTONS = [
  'ZH', 'BE', 'LU', 'UR', 'SZ', 'OW', 'NW', 'GL', 'ZG', 'FR',
  'SO', 'BS', 'BL', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG',
  'TI', 'VD', 'VS', 'NE', 'GE', 'JU',
] as const;

export type SwissCanton = (typeof SWISS_CANTONS)[number];

export function getSwissHolidays(year: number, canton: SwissCanton = 'ZH'): CalendarHoliday[] {
  const holidays: CalendarHoliday[] = [];

  const addHoliday = (name: string, nameDe: string, month: number, day: number, duration: number, type: 'school' | 'public', cantons?: SwissCanton[]) => {
    if (cantons && !cantons.includes(canton)) return;
    const start = new Date(year, month - 1, day);
    const end = new Date(year, month - 1, day + duration - 1);
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    holidays.push({
      name,
      nameHe: nameDe,
      startDate: formatDate(start),
      endDate: formatDate(end),
      type,
    });
  };

  addHoliday("New Year's Day", 'Neujahr', 1, 1, 1, 'public');
  addHoliday('Berchtoldstag', 'Berchtoldstag', 1, 2, 1, 'public', ['ZH', 'BE', 'LU', 'OW', 'NW', 'GL', 'ZG', 'FR', 'SO', 'SH', 'AR', 'AI', 'SG', 'GR', 'AG', 'TG', 'TI', 'VD', 'VS', 'NE', 'JU']);
  addHoliday('Epiphany', 'Heilige Drei Könige', 1, 6, 1, 'public', ['UR', 'SZ', 'TI', 'VS']);
  addHoliday('Republic Day', 'Tag der Republik', 3, 1, 1, 'public', ['NE']);
  addHoliday('St. Joseph\'s Day', 'Josefstag', 3, 19, 1, 'public', ['UR', 'SZ', 'TI', 'VS']);
  addHoliday('Näfelser Fahrt', 'Näfelser Fahrt', 4, 3, 1, 'public', ['GL']);
  addHoliday('Good Friday', 'Karfreitag', 4, 18, 1, 'public');
  addHoliday('Easter Monday', 'Ostermontag', 4, 21, 1, 'public');
  addHoliday('Sechseläuten', 'Sechseläuten', 4, 21, 1, 'public', ['ZH']);
  addHoliday('Labour Day', 'Tag der Arbeit', 5, 1, 1, 'public', ['BL', 'BS', 'JU', 'NE', 'SH', 'SO', 'TG', 'TI', 'VD', 'ZH']);
  addHoliday('Ascension Day', 'Auffahrt', 5, 29, 1, 'public');
  addHoliday('Whit Monday', 'Pfingstmontag', 6, 9, 1, 'public');
  addHoliday('Corpus Christi', 'Fronleichnam', 6, 19, 1, 'public', ['AI', 'GL', 'JU', 'LU', 'NW', 'OW', 'SZ', 'TI', 'UR', 'VS', 'ZG']);
  addHoliday('St. Peter and Paul', 'Peter und Paul', 6, 29, 1, 'public', ['TI', 'VS']);
  addHoliday('National Day', 'Nationalfeiertag', 8, 1, 1, 'public');
  addHoliday('Assumption', 'Mariä Himmelfahrt', 8, 15, 1, 'public', ['AI', 'GL', 'LU', 'NW', 'OW', 'SZ', 'TI', 'UR', 'VS', 'ZG']);
  addHoliday('Knabenschiessen', 'Knabenschiessen', 9, 8, 1, 'public', ['ZH']);
  addHoliday('Jeûne genevois', 'Jeûne genevois', 9, 11, 1, 'public', ['GE']);
  addHoliday('St. Nicholas', 'Samichlaus', 12, 6, 1, 'school');
  addHoliday('Immaculate Conception', 'Unbefleckte Empfängnis', 12, 8, 1, 'public', ['AI', 'GL', 'LU', 'NW', 'OW', 'SZ', 'TI', 'UR', 'VS', 'ZG']);
  addHoliday('Christmas Eve', 'Heiligabend', 12, 24, 1, 'school');
  addHoliday('Christmas Day', 'Weihnachten', 12, 25, 1, 'public');
  addHoliday('St. Stephen\'s Day', 'Stephanstag', 12, 26, 1, 'public', ['AG', 'AI', 'AR', 'BL', 'BS', 'FR', 'GL', 'GR', 'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH']);

  return holidays;
}

export function getSwissCantons(): SwissCanton[] {
  return [...SWISS_CANTONS];
}