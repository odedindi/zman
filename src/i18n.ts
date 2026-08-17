export const locales = ['en', 'he', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  he: 'עברית',
  en: 'English',
  de: 'Deutsch',
};

export const localeDirections: Record<Locale, 'rtl' | 'ltr'> = {
  he: 'rtl',
  en: 'ltr',
  de: 'ltr',
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}