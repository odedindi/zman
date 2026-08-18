import { notFound } from 'next/navigation';
import { locales, type Locale, localeDirections } from '@i18n';
import { Providers } from '../providers';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolvedLocale = locale as Locale;
  
  if (!locales.includes(resolvedLocale)) {
    notFound();
  }

  const messages = (await import(`../../../messages/${resolvedLocale}.json`)).default;
  const direction = localeDirections[resolvedLocale];

  return (
    <div dir={direction} className={resolvedLocale === 'he' ? 'font-hebrew' : ''}>
      <Providers locale={resolvedLocale} messages={messages}>
        {children}
      </Providers>
    </div>
  );
}
