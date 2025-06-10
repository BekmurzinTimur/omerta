// src/routes/api/discovery/+server.ts
import type { RequestHandler } from './$types';

// In-memory room storage (use Redis or a database in production)
const rooms = new Map<string, {
  hostId: string;
  createdAt: number;
  players: Set<string>;
}>();

// Clean up old rooms periodically
setInterval(() => {
  const now = Date.now();
  const timeout = 30 * 60 * 1000; // 30 minutes
  
  for (const [roomId, room] of rooms.entries()) {
    if (now - room.createdAt > timeout) {
      rooms.delete(roomId);
    }
  }
}, 60 * 1000); // Check every minute

export const GET: RequestHandler = async ({ url }) => {
  const roomId = url.searchParams.get('roomId');
  
  if (!roomId) {
    return new Response(JSON.stringify({ error: 'Room ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const room = rooms.get(roomId);
  
  if (!room) {
    return new Response(JSON.stringify({ error: 'Room not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({
    roomId,
    hostId: room.hostId,
    playerCount: room.players.size,
    createdAt: room.createdAt
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const { action, roomId, peerId } = body;
  
  if (!action || !roomId || !peerId) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  switch (action) {
    case 'create':
      if (rooms.has(roomId)) {
        console.log('rooms',rooms)
        return new Response(JSON.stringify({ error: 'Room already exists' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      rooms.set(roomId, {
        hostId: peerId,
        createdAt: Date.now(),
        players: new Set([peerId])
      });
      
      return new Response(JSON.stringify({
        success: true,
        roomId,
        hostId: peerId
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    
    case 'join':
      const room = rooms.get(roomId);
      
      if (!room) {
        return new Response(JSON.stringify({ error: 'Room not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      room.players.add(peerId);
      
      return new Response(JSON.stringify({
        success: true,
        roomId,
        hostId: room.hostId
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    
    case 'leave':
      const roomToLeave = rooms.get(roomId);
      
      if (roomToLeave) {
        roomToLeave.players.delete(peerId);
        
        // Delete room if host leaves or no players left
        if (roomToLeave.hostId === peerId || roomToLeave.players.size === 0) {
          rooms.delete(roomId);
        }
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  const roomId = url.searchParams.get('roomId');
  
  if (!roomId) {
    return new Response(JSON.stringify({ error: 'Room ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  rooms.delete(roomId);
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};