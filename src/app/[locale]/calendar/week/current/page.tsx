'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';

export default function CurrentWeekRedirect() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  useEffect(() => {
    const today = new Date();
    const weekStr = format(today, 'yyyy-\'W\'ww');
    router.push(`/${locale}/calendar/week/${weekStr}`);
  }, [locale, router]);

  return null;
}