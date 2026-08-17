'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { Locale, locales, defaultLocale } from '@/i18n';

type Messages = Record<string, string>;

interface I18nContextValue {
  locale: Locale;
  messages: Messages;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  locale: Locale;
  messages: Messages;
}

export function I18nProvider({ children, locale, messages }: I18nProviderProps) {
  const t = useMemo(
    () => (key: string, params?: Record<string, string | number>) => {
      let message = messages[key] || key;
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          message = message.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
        });
      }
      return message;
    },
    [messages]
  );

  return (
    <I18nContext.Provider value={{ locale, messages, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useLocale() {
  return useI18n().locale;
}

export function useTranslations(namespace?: string) {
  const { t, messages } = useI18n();
  
  if (!namespace) {
    return t;
  }
  
  return (key: string, params?: Record<string, string | number>) => {
    const fullKey = `${namespace}.${key}`;
    let message = messages[fullKey] || messages[key] || key;
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        message = message.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value));
      });
    }
    return message;
  };
}

export function getDirection(locale: Locale) {
  return localeDirections[locale];
}

const localeDirections: Record<Locale, 'rtl' | 'ltr'> = {
  en: 'ltr',
  he: 'rtl',
  de: 'ltr',
};