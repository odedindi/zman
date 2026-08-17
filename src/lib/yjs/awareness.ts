'use client';

import { Awareness } from 'y-protocols/awareness';
import { getYjsProviders } from './providers';

export interface UserPresence {
  userId: string;
  userName: string;
  color: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  lastActive: number;
}

export function setupAwareness(docName: string): Awareness | null {
  const providers = getYjsProviders(docName);
  if (!providers) return null;

  const { awareness } = providers;

  awareness.setLocalStateField('user', {
    userId: generateUserId(),
    userName: getUserName(),
    color: generateUserColor(),
    lastActive: Date.now(),
  });

  return awareness;
}

export function observeAwareness(
  awareness: Awareness,
  callback: (states: Map<number, UserPresence>) => void
): () => void {
  const observer = () => {
    const states = new Map<number, UserPresence>();
    awareness.getStates().forEach((state: any, clientId: number) => {
      if (state.user) {
        states.set(clientId, state.user as UserPresence);
      }
    });
    callback(states);
  };

  awareness.on('change', observer);
  return () => awareness.off('change', observer);
}

export function updatePresence(
  awareness: Awareness,
  updates: Partial<UserPresence>
): void {
  const currentState = awareness.getLocalState();
  if (!currentState) return;
  
  awareness.setLocalStateField('user', {
    ...currentState.user,
    ...updates,
    lastActive: Date.now(),
  });
}

export function generateUserId(): string {
  if (typeof window !== 'undefined') {
    let userId = localStorage.getItem('zman-user-id');
    if (!userId) {
      userId = `user-${crypto.randomUUID()}`;
      localStorage.setItem('zman-user-id', userId);
    }
    return userId;
  }
  return `user-${crypto.randomUUID()}`;
}

export function getUserName(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('zman-user-name') || 'Anonymous';
  }
  return 'Anonymous';
}

export function setUserName(name: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('zman-user-name', name);
  }
}

export function generateUserColor(): string {
  const colors = [
    '#f59e0b', '#ef4444', '#3b82f6', '#22c55e', '#a855f7',
    '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}