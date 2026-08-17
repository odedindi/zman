import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useEntitiesStore, Entity, ScheduleEntry, HolidayEntry, ExceptionEntry } from '@/store/entities';

describe('Entity Store', () => {
  let nowCounter = 1000;
  
  beforeEach(() => {
    nowCounter = 1000;
    vi.spyOn(Date, 'now').mockImplementation(() => nowCounter++);
    useEntitiesStore.getState().reset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Entity CRUD', () => {
    it('should add an entity with generated id, color, avatar, and timestamps', () => {
      const { addEntity } = useEntitiesStore.getState();
      const id = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      const state = useEntitiesStore.getState();
      expect(state.entities[id]).toBeDefined();
      expect(state.entities[id].name).toBe('Test School');
      expect(state.entities[id].color).toBe('#3b82f6');
      expect(state.entities[id].avatar).toBe('🏫');
      expect(state.entities[id].id).toBe(id);
      expect(state.entities[id].createdAt).toBeGreaterThan(0);
      expect(state.entities[id].updatedAt).toBeGreaterThan(0);
      expect(state.entities[id].createdBy).toBeDefined();
    });

    it('should generate random color and avatar when not provided', () => {
      const { addEntity } = useEntitiesStore.getState();
      const id = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      const state = useEntitiesStore.getState();
      expect(state.entities[id].color).toBeDefined();
      expect(state.entities[id].avatar).toBeDefined();
    });

    it('should update an entity', () => {
      const { addEntity, updateEntity } = useEntitiesStore.getState();
      const id = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      // Small delay to ensure updatedAt is different
      vi.useFakeTimers();
      vi.advanceTimersByTime(10);
      
      updateEntity(id, { name: 'Updated School', color: '#ef4444' });
      
      const state = useEntitiesStore.getState();
      expect(state.entities[id].name).toBe('Updated School');
      expect(state.entities[id].color).toBe('#ef4444');
      expect(state.entities[id].avatar).toBe('🏫');
      expect(state.entities[id].updatedAt).toBeGreaterThan(state.entities[id].createdAt);
      
      vi.useRealTimers();
    });

    it('should delete an entity', () => {
      const { addEntity, deleteEntity } = useEntitiesStore.getState();
      const id = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      deleteEntity(id);
      
      const state = useEntitiesStore.getState();
      expect(state.entities[id]).toBeUndefined();
    });

    it('should delete associated schedules when entity is deleted', () => {
      const { addEntity, addSchedule, deleteEntity, getSchedules } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addSchedule({
        entityId,
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '14:00',
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
      });
      
      expect(getSchedules(entityId).length).toBe(1);
      
      deleteEntity(entityId);
      
      const state = useEntitiesStore.getState();
      expect(state.schedules[entityId]).toBeUndefined();
    });

    it('should delete associated holidays when entity is deleted', () => {
      const { addEntity, addHoliday, deleteEntity, getHolidays } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addHoliday({
        entityId,
        name: 'Summer Break',
        startDate: '2024-07-01',
        endDate: '2024-08-31',
        isSchoolHoliday: true,
      });
      
      expect(getHolidays(entityId).length).toBe(1);
      
      deleteEntity(entityId);
      
      const state = useEntitiesStore.getState();
      expect(state.holidays[entityId]).toBeUndefined();
    });

    it('should delete associated exceptions when entity is deleted', () => {
      const { addEntity, addException, deleteEntity, getExceptions } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addException({
        entityId,
        date: '2024-05-15',
        type: 'cancelled',
      });
      
      expect(getExceptions(entityId).length).toBe(1);
      
      deleteEntity(entityId);
      
      const state = useEntitiesStore.getState();
      expect(state.exceptions[entityId]).toBeUndefined();
    });

    it('should set active entity to first remaining entity when active entity is deleted', () => {
      const { addEntity, deleteEntity, setActiveEntity } = useEntitiesStore.getState();
      const id1 = addEntity({ name: 'School 1', color: '#3b82f6', avatar: '🏫' });
      const id2 = addEntity({ name: 'School 2', color: '#ef4444', avatar: '🏠' });
      
      setActiveEntity(id1);
      expect(useEntitiesStore.getState().activeEntityId).toBe(id1);
      
      deleteEntity(id1);
      
      expect(useEntitiesStore.getState().activeEntityId).toBe(id2);
    });

    it('should set active entity to null when last entity is deleted', () => {
      const { addEntity, deleteEntity, setActiveEntity } = useEntitiesStore.getState();
      const id = addEntity({ name: 'School 1', color: '#3b82f6', avatar: '🏫' });
      
      setActiveEntity(id);
      deleteEntity(id);
      
      expect(useEntitiesStore.getState().activeEntityId).toBeNull();
    });

    it('should get entity by id', () => {
      const { addEntity, getEntity } = useEntitiesStore.getState();
      const id = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      const entity = getEntity(id);
      
      expect(entity).toBeDefined();
      expect(entity?.name).toBe('Test School');
    });

    it('should return undefined for non-existent entity', () => {
      const { getEntity } = useEntitiesStore.getState();
      
      const entity = getEntity('non-existent');
      
      expect(entity).toBeUndefined();
    });

    it('should get all entities', () => {
      const { addEntity, getAllEntities } = useEntitiesStore.getState();
      addEntity({ name: 'School 1', color: '#3b82f6', avatar: '🏫' });
      addEntity({ name: 'School 2', color: '#ef4444', avatar: '🏠' });
      
      const entities = getAllEntities();
      
      expect(entities.length).toBe(2);
      expect(entities.map(e => e.name)).toContain('School 1');
      expect(entities.map(e => e.name)).toContain('School 2');
    });
  });

  describe('Active Entity', () => {
    it('should set active entity', () => {
      const { addEntity, setActiveEntity } = useEntitiesStore.getState();
      const id = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      setActiveEntity(id);
      
      expect(useEntitiesStore.getState().activeEntityId).toBe(id);
    });

    it('should set active entity to null', () => {
      const { addEntity, setActiveEntity } = useEntitiesStore.getState();
      const id = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      setActiveEntity(id);
      setActiveEntity(null);
      
      expect(useEntitiesStore.getState().activeEntityId).toBeNull();
    });

    it('should auto-set first entity as active when none is active', () => {
      const { addEntity } = useEntitiesStore.getState();
      const id = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      expect(useEntitiesStore.getState().activeEntityId).toBe(id);
    });
  });

  describe('Schedule CRUD', () => {
    it('should add a schedule', () => {
      const { addEntity, addSchedule, getSchedules } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addSchedule({
        entityId,
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '14:00',
        location: 'Room 101',
        notes: 'Math class',
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
      });
      
      const schedules = getSchedules(entityId);
      expect(schedules.length).toBe(1);
      expect(schedules[0].entityId).toBe(entityId);
      expect(schedules[0].dayOfWeek).toBe(1);
      expect(schedules[0].startTime).toBe('08:00');
      expect(schedules[0].endTime).toBe('14:00');
      expect(schedules[0].location).toBe('Room 101');
      expect(schedules[0].notes).toBe('Math class');
      expect(schedules[0].id).toBeDefined();
      expect(schedules[0].createdAt).toBeGreaterThan(0);
    });

    it('should update a schedule', () => {
      const { addEntity, addSchedule, updateSchedule, getSchedules } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addSchedule({
        entityId,
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '14:00',
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
      });
      
      const scheduleId = getSchedules(entityId)[0].id;
      updateSchedule(entityId, scheduleId, { startTime: '09:00', endTime: '15:00' });
      
      const updated = getSchedules(entityId)[0];
      expect(updated.startTime).toBe('09:00');
      expect(updated.endTime).toBe('15:00');
      expect(updated.updatedAt).toBeGreaterThan(updated.createdAt);
    });

    it('should delete a schedule', () => {
      const { addEntity, addSchedule, deleteSchedule, getSchedules } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addSchedule({
        entityId,
        dayOfWeek: 1,
        startTime: '08:00',
        endTime: '14:00',
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
      });
      
      const scheduleId = getSchedules(entityId)[0].id;
      deleteSchedule(entityId, scheduleId);
      
      expect(getSchedules(entityId).length).toBe(0);
    });

    it('should return empty array for entity with no schedules', () => {
      const { addEntity, getSchedules } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      expect(getSchedules(entityId)).toEqual([]);
    });

    it('should return empty array for non-existent entity', () => {
      const { getSchedules } = useEntitiesStore.getState();
      
      expect(getSchedules('non-existent')).toEqual([]);
    });
  });

  describe('Holiday CRUD', () => {
    it('should add a holiday', () => {
      const { addEntity, addHoliday, getHolidays } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addHoliday({
        entityId,
        name: 'Summer Break',
        startDate: '2024-07-01',
        endDate: '2024-08-31',
        isSchoolHoliday: true,
      });
      
      const holidays = getHolidays(entityId);
      expect(holidays.length).toBe(1);
      expect(holidays[0].entityId).toBe(entityId);
      expect(holidays[0].name).toBe('Summer Break');
      expect(holidays[0].startDate).toBe('2024-07-01');
      expect(holidays[0].endDate).toBe('2024-08-31');
      expect(holidays[0].isSchoolHoliday).toBe(true);
      expect(holidays[0].id).toBeDefined();
    });

    it('should update a holiday', () => {
      const { addEntity, addHoliday, updateHoliday, getHolidays } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addHoliday({
        entityId,
        name: 'Summer Break',
        startDate: '2024-07-01',
        endDate: '2024-08-31',
        isSchoolHoliday: true,
      });
      
      const holidayId = getHolidays(entityId)[0].id;
      updateHoliday(entityId, holidayId, { name: 'Winter Break', isSchoolHoliday: false });
      
      const updated = getHolidays(entityId)[0];
      expect(updated.name).toBe('Winter Break');
      expect(updated.isSchoolHoliday).toBe(false);
    });

    it('should delete a holiday', () => {
      const { addEntity, addHoliday, deleteHoliday, getHolidays } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addHoliday({
        entityId,
        name: 'Summer Break',
        startDate: '2024-07-01',
        endDate: '2024-08-31',
        isSchoolHoliday: true,
      });
      
      const holidayId = getHolidays(entityId)[0].id;
      deleteHoliday(entityId, holidayId);
      
      expect(getHolidays(entityId).length).toBe(0);
    });

    it('should return empty array for entity with no holidays', () => {
      const { addEntity, getHolidays } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      expect(getHolidays(entityId)).toEqual([]);
    });
  });

  describe('Exception CRUD', () => {
    it('should add an exception', () => {
      const { addEntity, addException, getExceptions } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addException({
        entityId,
        date: '2024-05-15',
        type: 'cancelled',
        notes: 'Teacher sick',
      });
      
      const exceptions = getExceptions(entityId);
      expect(exceptions.length).toBe(1);
      expect(exceptions[0].entityId).toBe(entityId);
      expect(exceptions[0].date).toBe('2024-05-15');
      expect(exceptions[0].type).toBe('cancelled');
      expect(exceptions[0].notes).toBe('Teacher sick');
      expect(exceptions[0].id).toBeDefined();
    });

    it('should add a moved exception with new times', () => {
      const { addEntity, addException, getExceptions } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addException({
        entityId,
        date: '2024-05-15',
        type: 'moved',
        newStartTime: '10:00',
        newEndTime: '16:00',
      });
      
      const exceptions = getExceptions(entityId);
      expect(exceptions[0].type).toBe('moved');
      expect(exceptions[0].newStartTime).toBe('10:00');
      expect(exceptions[0].newEndTime).toBe('16:00');
    });

    it('should update an exception', () => {
      const { addEntity, addException, updateException, getExceptions } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addException({
        entityId,
        date: '2024-05-15',
        type: 'cancelled',
      });
      
      const exceptionId = getExceptions(entityId)[0].id;
      updateException(entityId, exceptionId, { type: 'moved', newStartTime: '10:00', newEndTime: '16:00' });
      
      const updated = getExceptions(entityId)[0];
      expect(updated.type).toBe('moved');
      expect(updated.newStartTime).toBe('10:00');
    });

    it('should delete an exception', () => {
      const { addEntity, addException, deleteException, getExceptions } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addException({
        entityId,
        date: '2024-05-15',
        type: 'cancelled',
      });
      
      const exceptionId = getExceptions(entityId)[0].id;
      deleteException(entityId, exceptionId);
      
      expect(getExceptions(entityId).length).toBe(0);
    });

    it('should get exception by date', () => {
      const { addEntity, addException, getException } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addException({
        entityId,
        date: '2024-05-15',
        type: 'cancelled',
      });
      
      const exception = getException(entityId, '2024-05-15');
      expect(exception).toBeDefined();
      expect(exception?.date).toBe('2024-05-15');
      expect(exception?.type).toBe('cancelled');
    });

    it('should return undefined for non-existent date', () => {
      const { addEntity, getException } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      const exception = getException(entityId, '2024-05-15');
      expect(exception).toBeUndefined();
    });

    it('should return empty array for entity with no exceptions', () => {
      const { addEntity, getExceptions } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      expect(getExceptions(entityId)).toEqual([]);
    });
  });

  describe('Utility', () => {
    it('should set loading state', () => {
      const { setLoading } = useEntitiesStore.getState();
      
      setLoading(true);
      expect(useEntitiesStore.getState().isLoading).toBe(true);
      
      setLoading(false);
      expect(useEntitiesStore.getState().isLoading).toBe(false);
    });

    it('should set and clear error', () => {
      const { setError, clearError } = useEntitiesStore.getState();
      
      setError('Something went wrong');
      expect(useEntitiesStore.getState().error).toBe('Something went wrong');
      
      clearError();
      expect(useEntitiesStore.getState().error).toBeNull();
    });

    it('should reset store to initial state', () => {
      const { addEntity, addSchedule, addHoliday, addException, setActiveEntity, setError, setLoading, reset } = useEntitiesStore.getState();
      const entityId = addEntity({ name: 'Test School', color: '#3b82f6', avatar: '🏫' });
      
      addSchedule({ entityId, dayOfWeek: 1, startTime: '08:00', endTime: '14:00', validFrom: '2024-01-01', validUntil: '2024-12-31' });
      addHoliday({ entityId, name: 'Break', startDate: '2024-07-01', endDate: '2024-08-31', isSchoolHoliday: true });
      addException({ entityId, date: '2024-05-15', type: 'cancelled' });
      setActiveEntity(entityId);
      setError('Error');
      setLoading(true);
      
      reset();
      
      const state = useEntitiesStore.getState();
      expect(state.entities).toEqual({});
      expect(state.schedules).toEqual({});
      expect(state.holidays).toEqual({});
      expect(state.exceptions).toEqual({});
      expect(state.activeEntityId).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});