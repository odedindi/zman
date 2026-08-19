'use client';

import { useCallback } from 'react';
import { useEntitiesStore, Entity, ScheduleEntry, HolidayEntry, ExceptionEntry } from '@/store/entities';

export function useEntities() {
  const store = useEntitiesStore();

  const addEntity = useCallback((entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    return store.addEntity(entity);
  }, [store.addEntity]);

  const updateEntity = useCallback((id: string, updates: Partial<Entity>) => {
    store.updateEntity(id, updates);
  }, [store.updateEntity]);

  const deleteEntity = useCallback((id: string) => {
    store.deleteEntity(id);
  }, [store.deleteEntity]);

  const setActiveEntity = useCallback((id: string | null) => {
    store.setActiveEntity(id);
  }, [store.setActiveEntity]);

  const getEntity = useCallback((id: string) => {
    return store.getEntity(id);
  }, [store.getEntity]);

  const getAllEntities = useCallback(() => {
    return store.getAllEntities();
  }, [store.getAllEntities]);

  return {
    entities: store.entities,
    activeEntityId: store.activeEntityId,
    activeEntity: store.activeEntityId ? store.entities[store.activeEntityId] : null,
    allEntities: store.getAllEntities(),
    isLoading: store.isLoading || !store.isHydrated,
    isHydrated: store.isHydrated,
    error: store.error,
    addEntity,
    updateEntity,
    deleteEntity,
    setActiveEntity,
    getEntity,
    getAllEntities,
  };
}

export function useEntitySchedules(entityId: string) {
  const store = useEntitiesStore();

  const schedules = store.schedules[entityId] || [];

  const addSchedule = useCallback((schedule: Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    store.addSchedule(schedule);
  }, [store.addSchedule]);

  const updateSchedule = useCallback((id: string, updates: Partial<ScheduleEntry>) => {
    store.updateSchedule(entityId, id, updates);
  }, [store.updateSchedule]);

  const deleteSchedule = useCallback((id: string) => {
    store.deleteSchedule(entityId, id);
  }, [store.deleteSchedule]);

  return {
    schedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  };
}

export function useEntityHolidays(entityId: string) {
  const store = useEntitiesStore();

  const holidays = store.holidays[entityId] || [];

  const addHoliday = useCallback((holiday: Omit<HolidayEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    store.addHoliday(holiday);
  }, [store.addHoliday]);

  const updateHoliday = useCallback((id: string, updates: Partial<HolidayEntry>) => {
    store.updateHoliday(entityId, id, updates);
  }, [store.updateHoliday]);

  const deleteHoliday = useCallback((id: string) => {
    store.deleteHoliday(entityId, id);
  }, [store.deleteHoliday]);

  return {
    holidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
  };
}

export function useActiveEntity() {
  const store = useEntitiesStore();
  return store.activeEntityId ? store.entities[store.activeEntityId] : null;
}

export function useEntityExceptions(entityId: string) {
  const store = useEntitiesStore();

  const exceptions = store.exceptions[entityId] || [];

  const addException = useCallback((exception: Omit<ExceptionEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    store.addException(exception);
  }, [store.addException]);

  const updateException = useCallback((id: string, updates: Partial<ExceptionEntry>) => {
    store.updateException(entityId, id, updates);
  }, [store.updateException]);

  const deleteException = useCallback((id: string) => {
    store.deleteException(entityId, id);
  }, [store.deleteException]);

  const getException = useCallback((date: string) => {
    return store.getException(entityId, date);
  }, [store.getException]);

  return {
    exceptions,
    addException,
    updateException,
    deleteException,
    getException,
  };
}