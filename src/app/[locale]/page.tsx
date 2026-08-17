'use client';

import { Calendar, Users, Bell, Wifi, CheckCircle2, Loader2, Download, X, RefreshCw, Home, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { useTranslations, useLocale } from '@/i18n/context';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const features = [
  { icon: Calendar, key: 'multipleViews' },
  { icon: Users, key: 'multipleEntities' },
  { icon: Bell, key: 'pushNotifications' },
  { icon: Wifi, key: 'offline' },
  { icon: CheckCircle2, key: 'autoSync' },
  { icon: Loader2, key: 'smartCalendar' },
];

const steps = [
  { step: '1', key: 'createEntity' },
  { step: '2', key: 'setSchedule' },
  { step: '3', key: 'shareWithPartner' },
];

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'he';

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">zman</h1>
          <nav className="flex items-center gap-4">
            <Link href={`/${locale}/entities`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.entities')}
            </Link>
            <Link href={`/${locale}/settings`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('nav.settings')}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t('hero.betaBadge')}
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
            {t('hero.title')}
            <br />
            <span className="text-primary">{t('hero.subtitle')}</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors">
              {t('hero.ctaPrimary')}
            </button>
            <button className="w-full sm:w-auto bg-secondary text-secondary-foreground px-8 py-3 rounded-lg font-semibold text-lg hover:bg-secondary/80 transition-colors">
              {t('hero.ctaSecondary')}
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold text-center mb-12">{t('features.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <article
                key={index}
                className={cn(
                  'group p-6 rounded-xl bg-white dark:bg-gray-800 border border-border',
                  'transition-all duration-300 hover:shadow-lg hover:border-primary/50'
                )}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h4 className="text-lg font-semibold mb-2">{t(`features.${feature.key}.title`)}</h4>
                <p className="text-muted-foreground">{t(`features.${feature.key}.desc`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold text-center mb-12">{t('howItWorks.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((stepItem, index) => (
              <div key={index} className="text-center relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-1 bg-border -z-10" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                  {stepItem.step}
                </div>
                <h4 className="text-lg font-semibold mb-2">{t(`howItWorks.steps.${index}.title`)}</h4>
                <p className="text-muted-foreground">{t(`howItWorks.steps.${index}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 bg-background/50">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">zman - {t('app.tagline')}</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">{t('footer.privacy')}</Link>
            <Link href="#" className="hover:text-foreground transition-colors">{t('footer.terms')}</Link>
            <Link href="#" className="hover:text-foreground transition-colors">{t('footer.openSource')}</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}