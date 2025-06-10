// MultiplayerService.ts
import Peer, { type DataConnection } from 'peerjs';
import type { 
  GameMessage, 
  MultiplayerEvents, 
  ConnectionState,
  PeerConnectionOptions 
} from './Types';

export class MultiplayerService {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private roomId: string | null = null;
    hostId: string | null = null;
  private isHost: boolean = false;
  private events: Partial<MultiplayerEvents> = {};
  
  public state: ConnectionState = $state({
    isConnected: false,
    isHost: false,
    roomId: null,
    myId: null,
    connectedPeers: new Set()
  });

  constructor(private options: PeerConnectionOptions = {}) {
    // Default ICE servers if none provided
    if (!this.options.iceServers) {
      this.options.iceServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ];
    }
  }

  // Initialize PeerJS connection
  async initialize(peerId?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(peerId!, {
          debug: this.options.debug || 0,
          config: {
            iceServers: this.options.iceServers
          }
        });

        this.peer.on('open', (id) => {
          console.log('PeerJS connection opened with ID:', id);
          this.state.myId = id;
          this.state.isConnected = true;
          resolve(id);
        });

        this.peer.on('connection', (conn) => {
          this.handleIncomingConnection(conn);
        });

        this.peer.on('error', (error) => {
          console.error('PeerJS error:', error);
          this.events.onError?.(error);
          reject(error);
        });

        this.peer.on('disconnected', () => {
          console.log('Disconnected from PeerJS server');
          this.state.isConnected = false;
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Create a room as host
  async createRoom(roomId: string): Promise<void> {
    if (!this.peer || !this.state.myId) {
      throw new Error('Not connected to PeerJS');
    }

    this.isHost = true;
    this.state.isHost = true;
    this.roomId = roomId;
    this.state.roomId = roomId;
    this.hostId = this.state.myId;

    // For a real implementation, you'd register this room with a discovery service
    // For now, clients need to know the host's peer ID
    console.log(`Room created: ${roomId}, Host ID: ${this.state.myId}`);
    this.events.onRoomCreated?.(roomId);
  }

  // Join a room as client
  async joinRoom(roomId: string, hostPeerId: string): Promise<void> {
    if (!this.peer) {
      throw new Error('Not connected to PeerJS');
    }

    this.isHost = false;
    this.state.isHost = false;
    this.roomId = roomId;
    this.state.roomId = roomId;
    this.hostId = hostPeerId;

    // Connect to host
    const conn = this.peer.connect(hostPeerId, {
      reliable: true,
      metadata: {
        roomId: roomId,
        type: 'game-connection'
      }
    });

    this.setupConnection(conn);
    
    return new Promise((resolve, reject) => {
      conn.on('open', () => {
        console.log(`Connected to host: ${hostPeerId}`);
        this.events.onRoomJoined?.(roomId, hostPeerId);
        resolve();
      });

      conn.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Handle incoming connections (for host)
  private handleIncomingConnection(conn: DataConnection): void {
    if (!this.isHost) {
      console.log('Rejecting connection - not a host');
      conn.close();
      return;
    }

    // Verify the connection is for our room
    const metadata = conn.metadata as any;
    if (metadata?.roomId !== this.roomId || metadata?.type !== 'game-connection') {
      console.log('Rejecting connection - wrong room or type');
      conn.close();
      return;
    }

    console.log(`Accepting connection from: ${conn.peer}`);
    this.setupConnection(conn);
  }

  // Setup connection event handlers
  private setupConnection(conn: DataConnection): void {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      this.state.connectedPeers.add(conn.peer);
      this.state.connectedPeers = new Set(this.state.connectedPeers); // Trigger reactivity
      this.events.onPeerConnected?.(conn.peer);

      // Send initial handshake
      this.sendToPeer(conn.peer, {
        type: 'handshake',
        data: {
          isHost: this.isHost,
          roomId: this.roomId
        },
        timestamp: Date.now()
      });
    });

    conn.on('data', (data) => {
      try {
        const message = data as GameMessage;
        this.events.onDataReceived?.(conn.peer, message);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    conn.on('close', () => {
      this.removeConnection(conn.peer);
    });

    conn.on('error', (error) => {
      console.error(`Connection error with ${conn.peer}:`, error);
      this.removeConnection(conn.peer);
    });
  }

  // Remove connection
  private removeConnection(peerId: string): void {
    this.connections.delete(peerId);
    this.state.connectedPeers.delete(peerId);
    this.state.connectedPeers = new Set(this.state.connectedPeers); // Trigger reactivity
    this.events.onPeerDisconnected?.(peerId);
  }

  // Send message to specific peer
  sendToPeer(peerId: string, message: GameMessage): void {
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      conn.send(message);
    }
  }

  // Broadcast message to all connected peers
  broadcast(message: GameMessage): void {
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }

  // Send message to all peers except one
  broadcastExcept(excludePeerId: string, message: GameMessage): void {
    this.connections.forEach((conn, peerId) => {
      if (conn.open && peerId !== excludePeerId) {
        conn.send(message);
      }
    });
  }

  // Set event handlers
  on<K extends keyof MultiplayerEvents>(
    event: K, 
    handler: MultiplayerEvents[K]
  ): void {
    this.events[event] = handler;
  }

  // Get list of connected peer IDs
  getConnectedPeers(): string[] {
    return Array.from(this.state.connectedPeers);
  }

  // Disconnect and cleanup
  disconnect(): void {
    // Close all connections
    this.connections.forEach(conn => conn.close());
    this.connections.clear();
    this.state.connectedPeers.clear();

    // Destroy peer connection
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    // Reset state
    this.state.isConnected = false;
    this.state.isHost = false;
    this.state.roomId = null;
    this.state.myId = null;
    this.roomId = null;
    this.hostId = null;
    this.isHost = false;
  }
}