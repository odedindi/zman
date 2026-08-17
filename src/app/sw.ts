import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

/// <reference lib="webworker" />

const swSelf = self as unknown as ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[];
};

const manifest = (self as any).__SW_MANIFEST as (PrecacheEntry | string)[];

const serwist = new Serwist({
  precacheEntries: manifest,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  disableDevLogs: true,
  precacheOptions: {
    cleanupOutdatedCaches: true,
    ignoreURLParametersMatching: [/.*/],
  },
  fallbacks: {
    entries: [
      { url: '/offline', matcher: ({ request }) => request.destination === 'document' },
    ],
  },
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// Push notification handler
swSelf.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  
  const title = data.title || 'zman';
  const options = {
    body: data.body || 'You have a schedule update',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    vibrate: data.vibrate || [100, 50, 100],
    data: {
      url: data.url || '/',
      entityId: data.entityId,
      date: data.date,
    },
    actions: data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    tag: data.tag || 'zman-notification',
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(
    swSelf.registration.showNotification(title, options)
  );
});

// Notification click handler
swSelf.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/';
  const entityId = event.notification.data?.entityId;
  const date = event.notification.data?.date;

  // Build the full URL with entity and date context
  let targetUrl = urlToOpen;
  if (entityId && date) {
    targetUrl = `/en/calendar/day/${date}`;
  } else if (entityId) {
    targetUrl = `/en/calendar/month/${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  }

  event.waitUntil(
    swSelf.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url.includes(swSelf.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Open new window if none exists
      return swSelf.clients.openWindow(targetUrl);
    })
  );
});

// Push subscription change handler
swSelf.addEventListener('pushsubscriptionchange', (event) => {
  if (!event.oldSubscription) return;

  event.waitUntil(
    swSelf.registration.pushManager.subscribe(event.oldSubscription.options).then((subscription) => {
      // Send new subscription to server
      return fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
    })
  );
});
