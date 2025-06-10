// EnhancedMultiplayerService.ts
import { MultiplayerService } from './MultiplayerService.svelte';
import type { PeerConnectionOptions } from './Types';

export interface DiscoveryOptions extends PeerConnectionOptions {
  discoveryUrl?: string;
}

export class EnhancedMultiplayerService extends MultiplayerService {
  private discoveryUrl: string;

  constructor(options: DiscoveryOptions = {}) {
    super(options);
    this.discoveryUrl = options.discoveryUrl || '/api/discovery';
  }

  // Create room with discovery server registration
  async createRoomWithDiscovery(roomId: string): Promise<void> {
    // First initialize if not already connected
    if (!this.state.myId) {
      await this.initialize();
    }

    // Create room locally
    await this.createRoom(roomId);

    // Register with discovery server
    try {
      const response = await fetch(this.discoveryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          roomId: roomId,
          peerId: this.state.myId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to register room');
      }

      console.log('Room registered with discovery server');
    } catch (error) {
      // Clean up on failure
      this.disconnect();
      throw error;
    }
  }

  // Join room using discovery server
  async joinRoomWithDiscovery(roomId: string): Promise<void> {
    // First initialize if not already connected
    if (!this.state.myId) {
      await this.initialize();
    }

      const response = await fetch(`${this.discoveryUrl}?roomId=${roomId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to find room');
      }

      const roomInfo = await response.json();
      
      // Join the room
      await this.joinRoom(roomId, roomInfo.hostId);

      // Register with discovery server
      await fetch(this.discoveryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          roomId: roomId,
          peerId: this.state.myId
        })
      });

      console.log('Joined room via discovery server');
  }

  // Check if room exists
  async checkRoomExists(roomId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.discoveryUrl}?roomId=${roomId}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Override disconnect to notify discovery server
  disconnect(): void {
    // Notify discovery server if in a room
    if (this.state.roomId && this.state.myId) {
      fetch(this.discoveryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'leave',
          roomId: this.state.roomId,
          peerId: this.state.myId
        })
      }).catch(console.error);
    }

    super.disconnect();
  }

  // Broadcast game state update
  broadcastGameState(state: any): void {
    this.broadcast({
      type: 'game-state',
      data: state,
      timestamp: Date.now()
    });
  }

  // Send player action
  sendPlayerAction(action: string, data: any): void {
    this.broadcast({
      type: 'player-action',
      data: { action, ...data },
      timestamp: Date.now()
    });
  }

  // Request full game state from host (for late joiners)
  requestGameState(): void {
    if (!this.state.isHost && this.hostId) {
      this.sendToPeer(this.hostId, {
        type: 'request-state',
        data: null,
        timestamp: Date.now()
      });
    }
  }
}