'use client';

import { subscribeToPush, unsubscribeFromPush, getStoredSubscription, isPushSupported } from './notifications';

const RELAY_SERVER_URL = process.env.NEXT_PUBLIC_WS_URL?.replace('wss://', 'https://').replace('ws://', 'http://') || '';

interface SubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime: number | null;
}

export async function sendSubscriptionToServer(subscription: PushSubscription): Promise<boolean> {
  if (!RELAY_SERVER_URL) {
    console.warn('Relay server URL not configured, skipping server subscription');
    return false;
  }

  try {
    const payload: SubscriptionPayload = subscription.toJSON() as SubscriptionPayload;
    const response = await fetch(`${RELAY_SERVER_URL}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send subscription to server:', error);
    return false;
  }
}

export async function removeSubscriptionFromServer(subscription: PushSubscription): Promise<boolean> {
  if (!RELAY_SERVER_URL) {
    console.warn('Relay server URL not configured, skipping server unsubscription');
    return false;
  }

  try {
    const payload = { endpoint: subscription.endpoint };
    const response = await fetch(`${RELAY_SERVER_URL}/api/push/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to remove subscription from server:', error);
    return false;
  }
}

export async function refreshSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    return null;
  }

  const existingSubscription = await getStoredSubscription();
  if (existingSubscription) {
    const isExpired = existingSubscription.expirationTime && existingSubscription.expirationTime < Date.now();
    if (isExpired) {
      await unsubscribeFromPush();
      return await subscribeAndRegister();
    }
    return existingSubscription;
  }

  return await subscribeAndRegister();
}

async function subscribeAndRegister(): Promise<PushSubscription | null> {
  const subscription = await subscribeToPush();
  if (subscription) {
    await sendSubscriptionToServer(subscription);
  }
  return subscription;
}

export async function handleSubscriptionChange(): Promise<void> {
  if (!isPushSupported()) return;

  const subscription = await getStoredSubscription();
  if (subscription) {
    await sendSubscriptionToServer(subscription);
  }
}

export async function initializePushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    return null;
  }

  const existingSubscription = await getStoredSubscription();
  if (existingSubscription) {
    const isExpired = existingSubscription.expirationTime && existingSubscription.expirationTime < Date.now();
    if (!isExpired) {
      await sendSubscriptionToServer(existingSubscription);
      return existingSubscription;
    }
  }

  return await subscribeAndRegister();
}