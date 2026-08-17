'use client';

import * as Y from 'yjs';
import { createYjsProviders, getYjsProviders, destroyYjsProviders, YjsProviders } from './providers';

export interface EntityDoc {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  createdBy: string;
  schedule: Y.Map<ScheduleEntry>;
  holidays: Y.Array<HolidayEntry>;
  exceptions: Y.Map<ExceptionEntry>;
}

export interface ScheduleEntry {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
  validFrom: string;
  validUntil: string;
}

export interface HolidayEntry {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isSchoolHoliday: boolean;
}

export interface ExceptionEntry {
  id: string;
  date: string;
  type: 'cancelled' | 'moved' | 'early_pickup' | 'late_drop';
  newStartTime?: string;
  newEndTime?: string;
  notes?: string;
}

const ENTITY_DOC_PREFIX = 'zman-entity-';

export function createEntityDoc(entityId: string): EntityDoc {
  const docName = `${ENTITY_DOC_PREFIX}${entityId}`;
  const { doc } = createYjsProviders(docName);

  const schedule = doc.getMap<ScheduleEntry>('schedule');
  const holidays = doc.getArray<HolidayEntry>('holidays');
  const exceptions = doc.getMap<ExceptionEntry>('exceptions');

  return {
    id: entityId,
    name: '',
    color: '',
    avatar: '',
    createdBy: '',
    schedule,
    holidays,
    exceptions,
  };
}

export function getEntityDoc(entityId: string): EntityDoc | null {
  const docName = `${ENTITY_DOC_PREFIX}${entityId}`;
  const providers = getYjsProviders(docName);
  if (!providers) return null;

  const { doc } = providers;
  const schedule = doc.getMap<ScheduleEntry>('schedule');
  const holidays = doc.getArray<HolidayEntry>('holidays');
  const exceptions = doc.getMap<ExceptionEntry>('exceptions');

  return {
    id: entityId,
    name: '',
    color: '',
    avatar: '',
    createdBy: '',
    schedule,
    holidays,
    exceptions,
  };
}

export function destroyEntityDoc(entityId: string): void {
  const docName = `${ENTITY_DOC_PREFIX}${entityId}`;
  destroyYjsProviders(docName);
}

export function observeEntityDoc(
  entityId: string,
  callback: (doc: EntityDoc) => void
): () => void {
  const docName = `${ENTITY_DOC_PREFIX}${entityId}`;
  const providers = getYjsProviders(docName);
  if (!providers) return () => {};

  const { doc } = providers;
  const schedule = doc.getMap<ScheduleEntry>('schedule');
  const holidays = doc.getArray<HolidayEntry>('holidays');
  const exceptions = doc.getMap<ExceptionEntry>('exceptions');

  const entityDoc: EntityDoc = {
    id: entityId,
    name: '',
    color: '',
    avatar: '',
    createdBy: '',
    schedule,
    holidays,
    exceptions,
  };

  const observer = () => callback(entityDoc);

  schedule.observe(observer);
  holidays.observe(observer);
  exceptions.observe(observer);

  return () => {
    schedule.unobserve(observer);
    holidays.unobserve(observer);
    exceptions.unobserve(observer);
  };
}