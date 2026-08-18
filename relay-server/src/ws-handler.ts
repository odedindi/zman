import { WebSocket, RawData } from 'ws';
import { IncomingMessage } from 'http';
import { roomManager } from './room-manager.js';

interface ParsedUrl {
  docName: string;
}

function parseDocName(url: string): string | null {
  try {
    const parsed = new URL(url, 'http://localhost');
    return parsed.searchParams.get('doc');
  } catch {
    return null;
  }
}

function logConnection(event: string, docName: string, clientCount: number): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${event} | doc: ${docName} | clients: ${clientCount}`);
}

export function handleConnection(ws: WebSocket, req: IncomingMessage): void {
  const docName = parseDocName(req.url || '');

  if (!docName) {
    console.error('[WS] Connection rejected: missing doc query parameter');
    ws.close(4000, 'Missing doc parameter');
    return;
  }

  roomManager.join(docName, ws);
  logConnection('JOIN', docName, roomManager.getClientCount());

  ws.on('message', (data: RawData, isBinary: boolean) => {
    if (isBinary) {
      const message = Buffer.from(data as Buffer);
      roomManager.broadcast(docName, ws, message);
    }
  });

  ws.on('close', () => {
    roomManager.leave(docName, ws);
    logConnection('LEAVE', docName, roomManager.getClientCount());
  });

  ws.on('error', (error) => {
    console.error(`[WS] Error for doc ${docName}:`, error);
    roomManager.leave(docName, ws);
  });
}