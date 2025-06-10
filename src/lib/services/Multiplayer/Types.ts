// types.ts
export interface GameMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface PlayerInfo {
  id: string;
  isHost: boolean;
  joinedAt: number;
}

export interface RoomInfo {
  id: string;
  hostId: string;
  players: Map<string, PlayerInfo>;
  createdAt: number;
}

export interface MultiplayerEvents {
  onPeerConnected: (peerId: string) => void;
  onPeerDisconnected: (peerId: string) => void;
  onDataReceived: (peerId: string, message: GameMessage) => void;
  onError: (error: Error) => void;
  onRoomCreated: (roomId: string) => void;
  onRoomJoined: (roomId: string, hostId: string) => void;
}

export interface ConnectionState {
  isConnected: boolean;
  isHost: boolean;
  roomId: string | null;
  myId: string | null;
  connectedPeers: Set<string>;
}

export interface PeerConnectionOptions {
  iceServers?: RTCIceServer[];
  debug?: number;
}