import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { generateUserId } from '@/lib/yjs/awareness';

export interface Entity {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface ScheduleEntry {
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
}

export interface HolidayEntry {
  id: string;
  entityId: string;
  name: string;
  startDate: string;
  endDate: string;
  isSchoolHoliday: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ExceptionEntry {
  id: string;
  entityId: string;
  date: string;
  type: 'cancelled' | 'moved' | 'early_pickup' | 'late_drop';
  newStartTime?: string;
  newEndTime?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

interface EntitiesState {
  entities: Record<string, Entity>;
  schedules: Record<string, ScheduleEntry[]>;
  holidays: Record<string, HolidayEntry[]>;
  exceptions: Record<string, ExceptionEntry[]>;
  activeEntityId: string | null;
  isLoading: boolean;
  error: string | null;

  // Entity actions
  addEntity: (entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => string;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  deleteEntity: (id: string) => void;
  setActiveEntity: (id: string | null) => void;
  getEntity: (id: string) => Entity | undefined;
  getAllEntities: () => Entity[];

  // Schedule actions
  addSchedule: (schedule: Omit<ScheduleEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSchedule: (entityId: string, id: string, updates: Partial<ScheduleEntry>) => void;
  deleteSchedule: (entityId: string, id: string) => void;
  getSchedules: (entityId: string) => ScheduleEntry[];

  // Holiday actions
  addHoliday: (holiday: Omit<HolidayEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHoliday: (entityId: string, id: string, updates: Partial<HolidayEntry>) => void;
  deleteHoliday: (entityId: string, id: string) => void;
  getHolidays: (entityId: string) => HolidayEntry[];

  // Exception actions
  addException: (exception: Omit<ExceptionEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateException: (entityId: string, id: string, updates: Partial<ExceptionEntry>) => void;
  deleteException: (entityId: string, id: string) => void;
  getException: (entityId: string, date: string) => ExceptionEntry | undefined;
  getExceptions: (entityId: string) => ExceptionEntry[];

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const ENTITY_COLORS = [
  '#f59e0b', '#ef4444', '#3b82f6', '#22c55e', '#a855f7',
  '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
];

const ENTITY_AVATARS = [
  '👶', '🧒', '👦', '👧', '🧑',
  '👨', '👩', '👴', '👵', '👨‍🍼',
  '👩‍🍼', '👨‍🏫', '👩‍🏫', '👨‍⚕️', '👩‍⚕️',
];

function getRandomColor(): string {
  return ENTITY_COLORS[Math.floor(Math.random() * ENTITY_COLORS.length)];
}

function getRandomAvatar(): string {
  return ENTITY_AVATARS[Math.floor(Math.random() * ENTITY_AVATARS.length)];
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useEntitiesStore = create<EntitiesState>()(
  persist(
    immer((set, get) => ({
      entities: {},
      schedules: {},
      holidays: {},
      exceptions: {},
      activeEntityId: null,
      isLoading: false,
      error: null,

      // Entity actions
      addEntity: (entity) => {
        const id = generateId();
        const now = Date.now();
        const newEntity: Entity = {
          ...entity,
          id,
          color: entity.color || getRandomColor(),
          avatar: entity.avatar || getRandomAvatar(),
          createdBy: generateUserId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          state.entities[id] = newEntity;
          state.schedules[id] = [];
          state.holidays[id] = [];
          state.exceptions[id] = [];
          if (!state.activeEntityId) {
            state.activeEntityId = id;
          }
        });
        return id;
      },

      updateEntity: (id, updates) => {
        set((state) => {
          if (state.entities[id]) {
            state.entities[id] = { ...state.entities[id], ...updates, updatedAt: Date.now() };
          }
        });
      },

      deleteEntity: (id) => {
        set((state) => {
          delete state.entities[id];
          delete state.schedules[id];
          delete state.holidays[id];
          delete state.exceptions[id];
          if (state.activeEntityId === id) {
            const remainingIds = Object.keys(state.entities);
            state.activeEntityId = remainingIds.length > 0 ? remainingIds[0] : null;
          }
        });
      },

      setActiveEntity: (id) => {
        set((state) => {
          state.activeEntityId = id;
        });
      },

      getEntity: (id) => {
        return get().entities[id];
      },

      getAllEntities: () => {
        return Object.values(get().entities);
      },

      // Schedule actions
      addSchedule: (schedule) => {
        const id = generateId();
        const now = Date.now();
        const newSchedule: ScheduleEntry = {
          ...schedule,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          if (!state.schedules[schedule.entityId]) {
            state.schedules[schedule.entityId] = [];
          }
          state.schedules[schedule.entityId].push(newSchedule);
        });
      },

      updateSchedule: (entityId, id, updates) => {
        set((state) => {
          const schedules = state.schedules[entityId];
          if (schedules) {
            const index = schedules.findIndex((s) => s.id === id);
            if (index !== -1) {
              schedules[index] = { ...schedules[index], ...updates, updatedAt: Date.now() };
            }
          }
        });
      },

      deleteSchedule: (entityId, id) => {
        set((state) => {
          const schedules = state.schedules[entityId];
          if (schedules) {
            state.schedules[entityId] = schedules.filter((s) => s.id !== id);
          }
        });
      },

      getSchedules: (entityId) => {
        return get().schedules[entityId] || [];
      },

      // Holiday actions
      addHoliday: (holiday) => {
        const id = generateId();
        const now = Date.now();
        const newHoliday: HolidayEntry = {
          ...holiday,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          if (!state.holidays[holiday.entityId]) {
            state.holidays[holiday.entityId] = [];
          }
          state.holidays[holiday.entityId].push(newHoliday);
        });
      },

      updateHoliday: (entityId, id, updates) => {
        set((state) => {
          const holidays = state.holidays[entityId];
          if (holidays) {
            const index = holidays.findIndex((h) => h.id === id);
            if (index !== -1) {
              holidays[index] = { ...holidays[index], ...updates, updatedAt: Date.now() };
            }
          }
        });
      },

      deleteHoliday: (entityId, id) => {
        set((state) => {
          const holidays = state.holidays[entityId];
          if (holidays) {
            state.holidays[entityId] = holidays.filter((h) => h.id !== id);
          }
        });
      },

      getHolidays: (entityId) => {
        return get().holidays[entityId] || [];
      },

      // Exception actions
      addException: (exception) => {
        const id = generateId();
        const now = Date.now();
        const newException: ExceptionEntry = {
          ...exception,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          if (!state.exceptions[exception.entityId]) {
            state.exceptions[exception.entityId] = [];
          }
          state.exceptions[exception.entityId].push(newException);
        });
      },

      updateException: (entityId, id, updates) => {
        set((state) => {
          const exceptions = state.exceptions[entityId];
          if (exceptions) {
            const index = exceptions.findIndex((e) => e.id === id);
            if (index !== -1) {
              exceptions[index] = { ...exceptions[index], ...updates, updatedAt: Date.now() };
            }
          }
        });
      },

      deleteException: (entityId, id) => {
        set((state) => {
          const exceptions = state.exceptions[entityId];
          if (exceptions) {
            state.exceptions[entityId] = exceptions.filter((e) => e.id !== id);
          }
        });
      },

      getException: (entityId, date) => {
        const exceptions = get().exceptions[entityId] || [];
        return exceptions.find((e) => e.date === date);
      },

      getExceptions: (entityId) => {
        return get().exceptions[entityId] || [];
      },

      // Utility
      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      setError: (error) => {
        set((state) => {
          state.error = error;
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      reset: () => {
        set((state) => {
          state.entities = {};
          state.schedules = {};
          state.holidays = {};
          state.exceptions = {};
          state.activeEntityId = null;
          state.isLoading = false;
          state.error = null;
        });
      },
    })),
    {
      name: 'zman-entities-store',
      partialize: (state) => ({
        entities: state.entities,
        schedules: state.schedules,
        holidays: state.holidays,
        exceptions: state.exceptions,
        activeEntityId: state.activeEntityId,
      }),
    }
  )
);

export const useActiveEntity = () => useEntitiesStore((state) => 
  state.activeEntityId ? state.entities[state.activeEntityId] : null
);

export const useEntitySchedules = (entityId: string) => 
  useEntitiesStore((state) => state.schedules[entityId] || []);

export const useEntityHolidays = (entityId: string) => 
  useEntitiesStore((state) => state.holidays[entityId] || []);

export const useEntityExceptions = (entityId: string) => 
  useEntitiesStore((state) => state.exceptions[entityId] || []);