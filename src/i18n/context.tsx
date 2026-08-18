'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { Locale, locales, defaultLocale } from '@/i18n';
import type {
  Messages as EnMessages,
  NamespaceKeys,
  NamespacedKey,
  TranslationKey,
} from './types';

type Messages = EnMessages;

interface I18nContextValue {
  locale: Locale;
  messages: Record<string, unknown>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
  locale: Locale;
  messages: Record<string, unknown>;
}

function resolveMessage(messages: Record<string, unknown>, key: string): string | undefined {
  const parts = key.split('.');
  let current: unknown = messages;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export function I18nProvider({ children, locale, messages }: I18nProviderProps) {
  const t = useMemo(
    () => (key: TranslationKey, params?: Record<string, string | number>) => {
      let message = resolveMessage(messages, key) || key;
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

export function useTranslations(): (key: TranslationKey, params?: Record<string, string | number>) => string;
export function useTranslations<NS extends NamespaceKeys>(
  namespace: NS
): (key: NamespacedKey<NS> | TranslationKey, params?: Record<string, string | number>) => string;
export function useTranslations(namespace?: string) {
  const { t, messages } = useI18n();

  if (!namespace) {
    return t;
  }

  return (key: string, params?: Record<string, string | number>) => {
    const fullKey = `${namespace}.${key}`;
    let message = resolveMessage(messages, fullKey) || resolveMessage(messages, key) || key;
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
