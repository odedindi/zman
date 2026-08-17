export const locales = ['en', 'he', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  he: 'עברית',
  de: 'Deutsch',
};

export const localeDirections: Record<Locale, 'rtl' | 'ltr'> = {
  en: 'ltr',
  he: 'rtl',
  de: 'ltr',
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}