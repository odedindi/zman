import type { Metadata, Viewport } from 'next';
import { Inter, Assistant } from 'next/font/google';
import { notFound } from 'next/navigation';
import { locales, type Locale, localeDirections } from '@i18n';
import '../globals.css';
import { Providers } from '../providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const assistant = Assistant({
  subsets: ['hebrew'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hebrew',
  display: 'swap',
});

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
    <html lang={resolvedLocale} dir={direction} className={`${inter.variable} ${assistant.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background font-hebrew antialiased">
        <Providers locale={resolvedLocale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}