'use client';

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Awareness } from 'y-protocols/awareness';

export interface YjsProviders {
  doc: Y.Doc;
  websocketProvider: WebsocketProvider | null;
  indexeddbProvider: IndexeddbPersistence | null;
  awareness: Awareness;
}

const providerCache = new Map<string, YjsProviders>();

export function createYjsProviders(
  docName: string,
  wsUrl: string = process.env.NEXT_PUBLIC_WS_URL || 'wss://zman-relay.fly.dev'
): YjsProviders {
  if (providerCache.has(docName)) {
    return providerCache.get(docName)!;
  }

  const doc = new Y.Doc();
  const awareness = new Awareness(doc);

  const indexeddbProvider = new IndexeddbPersistence(docName, doc);
  
  const websocketProvider = typeof window !== 'undefined' 
    ? new WebsocketProvider(wsUrl, docName, doc, {
        connect: true,
        maxBackoffTime: 30000,
        awareness,
      })
    : null;

  const providers: YjsProviders = {
    doc,
    websocketProvider,
    indexeddbProvider,
    awareness,
  };

  providerCache.set(docName, providers);
  return providers;
}

export function getYjsProviders(docName: string): YjsProviders | undefined {
  return providerCache.get(docName);
}

export function destroyYjsProviders(docName: string): void {
  const providers = providerCache.get(docName);
  if (providers) {
    providers.websocketProvider?.destroy();
    providers.indexeddbProvider?.destroy();
    providers.doc.destroy();
    providerCache.delete(docName);
  }
}

export function getAllProviders(): YjsProviders[] {
  return Array.from(providerCache.values());
}