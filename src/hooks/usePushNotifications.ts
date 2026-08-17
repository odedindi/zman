'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getStoredSubscription,
  isPushSupported,
} from '@/lib/push/notifications';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (supported) {
        const currentPermission = Notification.permission;
        setPermission(currentPermission);

        const storedSubscription = await getStoredSubscription();
        if (storedSubscription) {
          setSubscription(storedSubscription);
        }
      }

      setIsLoading(false);
    };

    initialize();
  }, []);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const newPermission = await requestNotificationPermission();
    setPermission(newPermission);

    if (newPermission === 'granted') {
      const newSubscription = await subscribeToPush();
      if (newSubscription) {
        setSubscription(newSubscription);
      }
    }

    return newPermission;
  }, []);

  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (permission !== 'granted') {
      const newPermission = await requestNotificationPermission();
      if (newPermission !== 'granted') {
        return null;
      }
    }

    const newSubscription = await subscribeToPush();
    if (newSubscription) {
      setSubscription(newSubscription);
    }

    return newSubscription;
  }, [permission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    const success = await unsubscribeFromPush();
    if (success) {
      setSubscription(null);
    }
    return success;
  }, []);

  return {
    permission,
    subscription,
    isSupported,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
    isSubscribed: !!subscription,
  };
}