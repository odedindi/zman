import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ZmanDBSchema extends DBSchema {
  entities: {
    key: string;
    value: {
      id: string;
      name: string;
      color: string;
      avatar?: string;
      createdBy: string;
      createdAt: number;
      updatedAt: number;
    };
    indexes: { 'by-creator': string; 'by-name': string };
  };
  schedules: {
    key: string;
    value: {
      id: string;
      entityId: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      location?: string;
      notes?: string;
      validFrom: string;
      validUntil: string;
      createdAt: number;
      updatedAt: number;
    };
    indexes: { 'by-entity': string };
  };
  holidays: {
    key: string;
    value: {
      id: string;
      entityId: string;
      name: string;
      startDate: string;
      endDate: string;
      isSchoolHoliday: boolean;
      createdAt: number;
      updatedAt: number;
    };
    indexes: { 'by-entity': string; 'by-date': string };
  };
  exceptions: {
    key: string;
    value: {
      id: string;
      entityId: string;
      date: string;
      type: 'cancelled' | 'moved' | 'early_pickup' | 'late_drop';
      newStartTime?: string;
      newEndTime?: string;
      notes?: string;
      createdAt: number;
      updatedAt: number;
    };
    indexes: { 'by-entity': string; 'by-date': string };
  };
  schoolCalendars: {
    key: string;
    value: {
      id: string;
      name: string;
      country: 'israel' | 'switzerland';
      canton?: string;
      yearStart: string;
      yearEnd: string;
      holidays: Array<{
        id: string;
        name: string;
        startDate: string;
        endDate: string;
        isSchoolHoliday: boolean;
      }>;
      terms: Array<{
        id: string;
        name: string;
        startDate: string;
        endDate: string;
      }>;
      createdAt: number;
      updatedAt: number;
    };
    indexes: { 'by-country': string };
  };
  userSettings: {
    key: string;
    value: {
      key: string;
      value: unknown;
      updatedAt: number;
    };
  };
  syncMetadata: {
    key: string;
    value: {
      entityId: string;
      lastSynced: number;
      pendingCount: number;
      version: number;
    };
  };
}

let dbInstance: IDBPDatabase<ZmanDBSchema> | null = null;

export async function getDB(): Promise<IDBPDatabase<ZmanDBSchema>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ZmanDBSchema>('zman-db', 1, {
    upgrade(db) {
      // Entities store
      if (!db.objectStoreNames.contains('entities')) {
        const entitiesStore = db.createObjectStore('entities', { keyPath: 'id' });
        entitiesStore.createIndex('by-creator', 'createdBy');
        entitiesStore.createIndex('by-name', 'name');
      }

      // Schedules store
      if (!db.objectStoreNames.contains('schedules')) {
        const schedulesStore = db.createObjectStore('schedules', { keyPath: 'id' });
        schedulesStore.createIndex('by-entity', 'entityId');
      }

      // Holidays store
      if (!db.objectStoreNames.contains('holidays')) {
        const holidaysStore = db.createObjectStore('holidays', { keyPath: 'id' });
        holidaysStore.createIndex('by-entity', 'entityId');
        holidaysStore.createIndex('by-date', 'startDate');
      }

      // Exceptions store
      if (!db.objectStoreNames.contains('exceptions')) {
        const exceptionsStore = db.createObjectStore('exceptions', { keyPath: 'id' });
        exceptionsStore.createIndex('by-entity', 'entityId');
        exceptionsStore.createIndex('by-date', 'date');
      }

      // School calendars store
      if (!db.objectStoreNames.contains('schoolCalendars')) {
        const calendarsStore = db.createObjectStore('schoolCalendars', { keyPath: 'id' });
        calendarsStore.createIndex('by-country', 'country');
      }

      // User settings store
      if (!db.objectStoreNames.contains('userSettings')) {
        db.createObjectStore('userSettings', { keyPath: 'key' });
      }

      // Sync metadata store
      if (!db.objectStoreNames.contains('syncMetadata')) {
        const syncStore = db.createObjectStore('syncMetadata', { keyPath: 'entityId' });
      }
    },
  });

  return dbInstance;
}

export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// Entity operations
export async function createEntity(entity: ZmanDBSchema['entities']['value']): Promise<void> {
  const db = await getDB();
  await db.add('entities', entity);
}

export async function updateEntity(entity: ZmanDBSchema['entities']['value']): Promise<void> {
  const db = await getDB();
  await db.put('entities', { ...entity, updatedAt: Date.now() });
}

export async function deleteEntity(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('entities', id);
}

export async function getEntity(id: string): Promise<ZmanDBSchema['entities']['value'] | undefined> {
  const db = await getDB();
  return db.get('entities', id);
}

export async function getAllEntities(): Promise<ZmanDBSchema['entities']['value'][]> {
  const db = await getDB();
  return db.getAll('entities');
}

export async function getEntitiesByCreator(creatorId: string): Promise<ZmanDBSchema['entities']['value'][]> {
  const db = await getDB();
  return db.getAllFromIndex('entities', 'by-creator', creatorId);
}

// Schedule operations
export async function createSchedule(schedule: ZmanDBSchema['schedules']['value']): Promise<void> {
  const db = await getDB();
  await db.add('schedules', schedule);
}

export async function updateSchedule(schedule: ZmanDBSchema['schedules']['value']): Promise<void> {
  const db = await getDB();
  await db.put('schedules', { ...schedule, updatedAt: Date.now() });
}

export async function deleteSchedule(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('schedules', id);
}

export async function getSchedulesByEntity(entityId: string): Promise<ZmanDBSchema['schedules']['value'][]> {
  const db = await getDB();
  return db.getAllFromIndex('schedules', 'by-entity', entityId);
}

// Holiday operations
export async function createHoliday(holiday: ZmanDBSchema['holidays']['value']): Promise<void> {
  const db = await getDB();
  await db.add('holidays', holiday);
}

export async function updateHoliday(holiday: ZmanDBSchema['holidays']['value']): Promise<void> {
  const db = await getDB();
  await db.put('holidays', { ...holiday, updatedAt: Date.now() });
}

export async function deleteHoliday(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('holidays', id);
}

export async function getHolidaysByEntity(entityId: string): Promise<ZmanDBSchema['holidays']['value'][]> {
  const db = await getDB();
  return db.getAllFromIndex('holidays', 'by-entity', entityId);
}

export async function getHolidaysByDateRange(startDate: string, endDate: string): Promise<ZmanDBSchema['holidays']['value'][]> {
  const db = await getDB();
  const range = IDBKeyRange.bound(startDate, endDate);
  return db.getAllFromIndex('holidays', 'by-date', range);
}

// Exception operations
export async function createException(exception: ZmanDBSchema['exceptions']['value']): Promise<void> {
  const db = await getDB();
  await db.add('exceptions', exception);
}

export async function updateException(exception: ZmanDBSchema['exceptions']['value']): Promise<void> {
  const db = await getDB();
  await db.put('exceptions', { ...exception, updatedAt: Date.now() });
}

export async function deleteException(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('exceptions', id);
}

export async function getExceptionsByEntity(entityId: string): Promise<ZmanDBSchema['exceptions']['value'][]> {
  const db = await getDB();
  return db.getAllFromIndex('exceptions', 'by-entity', entityId);
}

export async function getExceptionByDate(entityId: string, date: string): Promise<ZmanDBSchema['exceptions']['value'] | undefined> {
  const db = await getDB();
  const exceptions = await db.getAllFromIndex('exceptions', 'by-entity', entityId);
  return exceptions.find(e => e.date === date);
}

// School calendar operations
export async function createSchoolCalendar(calendar: ZmanDBSchema['schoolCalendars']['value']): Promise<void> {
  const db = await getDB();
  await db.add('schoolCalendars', calendar);
}

export async function getSchoolCalendar(id: string): Promise<ZmanDBSchema['schoolCalendars']['value'] | undefined> {
  const db = await getDB();
  return db.get('schoolCalendars', id);
}

export async function getSchoolCalendarsByCountry(country: 'israel' | 'switzerland'): Promise<ZmanDBSchema['schoolCalendars']['value'][]> {
  const db = await getDB();
  return db.getAllFromIndex('schoolCalendars', 'by-country', country);
}

// User settings operations
export async function setUserSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB();
  await db.put('userSettings', { key, value, updatedAt: Date.now() });
}

export async function getUserSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const setting = await db.get('userSettings', key);
  return setting?.value as T | undefined;
}

// Sync metadata operations
export async function updateSyncMetadata(
  entityId: string,
  metadata: Partial<ZmanDBSchema['syncMetadata']['value']>
): Promise<void> {
  const db = await getDB();
  const existing = await db.get('syncMetadata', entityId);
  await db.put('syncMetadata', {
    entityId,
    lastSynced: metadata.lastSynced ?? existing?.lastSynced ?? 0,
    pendingCount: metadata.pendingCount ?? existing?.pendingCount ?? 0,
    version: (existing?.version ?? 0) + 1,
  });
}

export async function getSyncMetadata(entityId: string): Promise<ZmanDBSchema['syncMetadata']['value'] | undefined> {
  const db = await getDB();
  return db.get('syncMetadata', entityId);
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const stores = ['entities', 'schedules', 'holidays', 'exceptions', 'schoolCalendars', 'syncMetadata'] as const;
  const tx = db.transaction(stores, 'readwrite');
  await Promise.all(stores.map(store => tx.objectStore(store).clear()));
  await tx.done;
}