'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => {
      setIsOnline(true);
      setTimeout(() => window.location.href = '/', 1000);
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-6">
          <WifiOff className="h-12 w-12 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold mb-4">אתה במצב אופליין</h1>
        <p className="text-muted-foreground mb-8">
          נראה שאין חיבור לאינטרנט. zman עובד גם אופליין - 
          הנתונים שלך נשמרים מקומית ויסתנכרנו כשתחזור לרשת.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            נסה שוב
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
          >
            <Home className="h-5 w-5" />
            לדף הבית
          </Link>
        </div>
        {isOnline && (
          <p className="mt-6 text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
            <WifiOff className="h-5 w-5" />
            החיבור חזר! מפנה לדף הבית...
          </p>
        )}
      </div>
    </main>
  );
}