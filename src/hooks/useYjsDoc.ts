'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import { createYjsProviders, getYjsProviders, YjsProviders } from '@/lib/yjs/providers';
import { EntityDoc, observeEntityDoc, destroyEntityDoc } from '@/lib/yjs/docs';

export function useYjsDoc(entityId: string): {
  doc: EntityDoc | null;
  providers: YjsProviders | null;
  isReady: boolean;
  error: Error | null;
} {
  const [doc, setDoc] = useState<EntityDoc | null>(null);
  const [providers, setProviders] = useState<YjsProviders | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!entityId) return;

    try {
      const yjsProviders = createYjsProviders(`zman-entity-${entityId}`);
      setProviders(yjsProviders);

      const entityDoc = observeEntityDoc(entityId, (updatedDoc) => {
        setDoc(updatedDoc);
      });
      unsubscribeRef.current = entityDoc;

      setIsReady(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize Yjs doc'));
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [entityId]);

  return { doc, providers, isReady, error };
}

export function useYjsAwareness(entityId: string) {
  const { providers } = useYjsDoc(entityId);
  const [awareness, setAwareness] = useState<any>(null);

  useEffect(() => {
    if (!providers) return;

    const { awareness: aw } = providers;
    setAwareness(aw);

    return () => {
      // Cleanup if needed
    };
  }, [providers]);

  return awareness;
}

export function useYjsDocState<T>(entityId: string, collection: 'schedule' | 'holidays' | 'exceptions') {
  const { doc } = useYjsDoc(entityId);
  const [state, setState] = useState<T[]>([]);

  useEffect(() => {
    if (!doc) return;

    const collectionDoc = doc[collection];
    if (!collectionDoc) return;

    const updateState = () => {
      let values: unknown[] = [];
      const doc = collectionDoc as any;
      if (doc instanceof Map || doc instanceof Y.Map) {
        values = Array.from(doc.values());
      } else if (doc instanceof Y.Array) {
        values = doc.toArray();
      } else if (Array.isArray(doc)) {
        values = doc;
      } else if (typeof doc.toArray === 'function') {
        values = doc.toArray();
      } else {
        values = Array.from(doc);
      }
      setState(values as T[]);
    };

    updateState();

    const observer = () => updateState();
    collectionDoc.observe(observer);

    return () => {
      collectionDoc.unobserve(observer);
    };
  }, [doc, collection]);

  return state;
}