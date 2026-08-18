'use client';

import { useState, useEffect, useRef } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://zman-relay.onrender.com';
const HEALTH_URL = WS_URL.replace('wss://', 'https://').replace('ws://', 'http://');

interface WakeUpState {
  isWaking: boolean;
  isReady: boolean;
}

export function useWsWakeUp(): WakeUpState {
  const [isWaking, setIsWaking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const triedRef = useRef(false);

  useEffect(() => {
    if (triedRef.current || isReady) return;
    triedRef.current = true;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const ping = async (attempt: number) => {
      if (cancelled) return;

      try {
        const res = await fetch(`${HEALTH_URL}/health`, {
          signal: AbortSignal.timeout(10000),
        });

        if (cancelled) return;

        if (res.ok) {
          setIsWaking(false);
          setIsReady(true);
          return;
        }
      } catch {
      }

      if (cancelled) return;

      if (attempt < 6) {
        setIsWaking(true);
        const delay = Math.min(2000 * Math.pow(1.5, attempt), 15000);
        timeout = setTimeout(() => ping(attempt + 1), delay);
      } else {
        setIsWaking(false);
        setIsReady(true);
      }
    };

    ping(0);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isReady]);

  return { isWaking, isReady };
}
