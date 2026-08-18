import type en from '../../messages/en.json';

type Messages = typeof en;

type NamespaceKeys = 'app' | 'nav' | 'hero' | 'features' | 'howItWorks' | 'common' | 'pwa' | 'offline' | 'footer' | 'entities' | 'calendar' | 'holidays' | 'exceptions' | 'settings' | 'schedule'
  | 'pwa.installPrompt' | 'pwa.offlineBanner' | 'pwa.syncStatus' | 'pwa.conflict' | 'pwa.queue'
  | 'features.multipleViews' | 'features.multipleEntities' | 'features.pushNotifications' | 'features.offline' | 'features.autoSync' | 'features.smartCalendar'
  | 'calendar.views' | 'calendar.daysShort' | 'calendar.semester' | 'calendar.exception' | 'calendar.import' | 'calendar.export'
  | 'settings.notifications' | 'settings.sync' | 'settings.storage' | 'settings.about';

type TranslationKey = string & Record<never, never>;

type NamespacedKey<NS extends NamespaceKeys> = string & Record<never, never>;

export type { Messages, NamespaceKeys, NamespacedKey, TranslationKey };
