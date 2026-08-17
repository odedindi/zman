import { WebSocket } from 'ws';

export class RoomManager {
  private rooms: Map<string, Set<WebSocket>> = new Map();

  join(roomId: string, ws: WebSocket): void {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)!.add(ws);
  }

  leave(roomId: string, ws: WebSocket): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.delete(ws);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  broadcast(roomId: string, sender: WebSocket, message: Buffer): void {
    const room = this.rooms.get(roomId);
    if (room) {
      for (const client of room) {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      }
    }
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  getClientCount(): number {
    let count = 0;
    for (const room of this.rooms.values()) {
      count += room.size;
    }
    return count;
  }
}

export const roomManager = new RoomManager();