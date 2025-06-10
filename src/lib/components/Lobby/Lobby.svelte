<script lang="ts">
	import { MultiplayerService } from '$lib/services/Multiplayer/MultiplayerService.svelte';
  import type { GameMessage } from '../../services/Multiplayer/Types';

  interface Props {
    onMessage?: (peerId: string, message: GameMessage) => void;
  }

  let { onMessage }: Props = $props();

  let service = new MultiplayerService({
    debug: 2 // Enable debug logging
  });

  let roomIdInput = $state('');
  let hostIdInput = $state('');
  let messageInput = $state('');
  let messages = $state<Array<{from: string, message: GameMessage}>>([]);
  let error = $state<string | null>(null);
  let isInitializing = $state(false);

  // Setup event handlers
  service.on('onPeerConnected', (peerId) => {
    addMessage('system', {
      type: 'system',
      data: `Peer ${peerId} connected`,
      timestamp: Date.now()
    });
  });

  service.on('onPeerDisconnected', (peerId) => {
    addMessage('system', {
      type: 'system',
      data: `Peer ${peerId} disconnected`,
      timestamp: Date.now()
    });
  });

  service.on('onDataReceived', (peerId, message) => {
    console.log('onDataReceived', peerId, message)
    addMessage(peerId, message);
    onMessage?.(peerId, message);
  });

  service.on('onError', (err) => {
    error = err.message;
    console.error('Multiplayer error:', err);
  });

  service.on('onRoomCreated', (roomId) => {
    addMessage('system', {
      type: 'system',
      data: `Room "${roomId}" created. Share your Peer ID: ${service.state.myId}`,
      timestamp: Date.now()
    });
  });

  service.on('onRoomJoined', (roomId, hostId) => {
    addMessage('system', {
      type: 'system',
      data: `Joined room "${roomId}" hosted by ${hostId}`,
      timestamp: Date.now()
    });
  });

  function addMessage(from: string, message: GameMessage) {
    messages = [...messages, { from, message }];
    // Keep only last 50 messages
    if (messages.length > 50) {
      messages = messages.slice(-50);
    }
  }

  async function initialize() {
    try {
      isInitializing = true;
      error = null;
      await service.initialize();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to initialize';
    } finally {
      isInitializing = false;
    }
  }

  async function createRoom() {
    if (!roomIdInput.trim()) {
      error = 'Please enter a room ID';
      return;
    }

    try {
      error = null;
      await service.createRoom(roomIdInput.trim());
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to create room';
    }
  }

  async function joinRoom() {
    if (!roomIdInput.trim() || !hostIdInput.trim()) {
      error = 'Please enter both room ID and host peer ID';
      return;
    }

    try {
      error = null;
      await service.joinRoom(roomIdInput.trim(), hostIdInput.trim());
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to join room';
    }
  }

  function sendMessage() {
    if (!messageInput.trim()) return;

    const gameMessage: GameMessage = {
      type: 'chat',
      data: messageInput.trim(),
      timestamp: Date.now()
    };

    service.broadcast(gameMessage);
    addMessage('me', gameMessage);
    messageInput = '';
  }

  function disconnect() {
    service.disconnect();
    messages = [];
    error = null;
  }

  function copyPeerId() {
    if (service.state.myId) {
      navigator.clipboard.writeText(service.state.myId);
    }
  }

  // Computed properties using $derived
  let connectionStatus = $derived(
    service.state.isConnected 
      ? `Connected as ${service.state.myId}` 
      : 'Disconnected'
  );

  let roomStatus = $derived(
    service.state.roomId 
      ? `In room: ${service.state.roomId} (${service.state.isHost ? 'Host' : 'Client'})` 
      : 'Not in a room'
  );

  // Cleanup on unmount
  $effect(() => {
    return () => {
      service.disconnect();
    };
  });
</script>

<div class="multiplayer-container">
  <div class="status-panel">
    <h2>Multiplayer Status</h2>
    <p class="status">Connection: {connectionStatus}</p>
    <p class="status">Room: {roomStatus}</p>
    
    {#if service.state.isConnected && service.state.myId}
      <div class="peer-id">
        <span>Your Peer ID: {service.state.myId}</span>
        <button onclick={copyPeerId}>Copy</button>
      </div>
    {/if}

    {#if service.state.connectedPeers.size > 0}
      <div class="peers">
        <h3>Connected Peers ({service.state.connectedPeers.size})</h3>
        <ul>
          {#each Array.from(service.state.connectedPeers) as peerId}
            <li>{peerId}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>

  <div class="control-panel">
    {#if !service.state.isConnected}
      <button 
        onclick={initialize} 
        disabled={isInitializing}
      >
        {isInitializing ? 'Initializing...' : 'Connect to PeerJS'}
      </button>
    {:else if !service.state.roomId}
      <div class="room-controls">
        <input 
          type="text" 
          placeholder="Room ID" 
          bind:value={roomIdInput}
          disabled={!service.state.isConnected}
        />
        
        <div class="button-group">
          <button 
            onclick={createRoom}
            disabled={!service.state.isConnected || !roomIdInput.trim()}
          >
            Create Room (Host)
          </button>
          
          <div class="join-controls">
            <input 
              type="text" 
              placeholder="Host Peer ID" 
              bind:value={hostIdInput}
              disabled={!service.state.isConnected}
            />
            <button 
              onclick={joinRoom}
              disabled={!service.state.isConnected || !roomIdInput.trim() || !hostIdInput.trim()}
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    {:else}
      <button onclick={disconnect} class="disconnect">
        Leave Room
      </button>
    {/if}

    {#if error}
      <div class="error">{error}</div>
    {/if}
  </div>

  {#if service.state.roomId}
    <div class="chat-panel">
      <h3>Messages</h3>
      <div class="messages">
        {#each messages as { from, message }}
          <div class="message {from === 'system' ? 'system' : from === 'me' ? 'me' : 'peer'}">
            <span class="from">{from}:</span>
            <span class="content">
              {#if message.type === 'chat'}
                {message.data}
              {:else if message.type === 'system'}
                <em>{message.data}</em>
              {:else}
                [{message.type}] {JSON.stringify(message.data)}
              {/if}
            </span>
            <span class="time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        {/each}
      </div>
      
      <div class="message-input">
        <input 
          type="text" 
          placeholder="Type a message..." 
          bind:value={messageInput}
          onkeydown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onclick={sendMessage}>Send</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .multiplayer-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .status-panel {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .status-panel h2 {
    margin-top: 0;
    color: #333;
  }

  .status {
    margin: 10px 0;
    font-size: 14px;
    color: #666;
  }

  .peer-id {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 15px 0;
    padding: 10px;
    background-color: #e8e8e8;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }

  .peer-id span {
    flex: 1;
    word-break: break-all;
  }

  .peers {
    margin-top: 20px;
  }

  .peers h3 {
    margin-bottom: 10px;
    color: #555;
    font-size: 16px;
  }

  .peers ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .peers li {
    padding: 5px 10px;
    background-color: #e8e8e8;
    margin-bottom: 5px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }

  .control-panel {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .room-controls {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .join-controls {
    display: flex;
    gap: 10px;
  }

  .join-controls input {
    flex: 1;
  }

  input[type="text"] {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover:not(:disabled) {
    background-color: #0056b3;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  button.disconnect {
    background-color: #dc3545;
  }

  button.disconnect:hover {
    background-color: #c82333;
  }

  .error {
    margin-top: 10px;
    padding: 10px;
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    font-size: 14px;
  }

  .chat-panel {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    height: 400px;
    display: flex;
    flex-direction: column;
  }

  .chat-panel h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #333;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 15px;
  }

  .message {
    margin-bottom: 10px;
    padding: 8px;
    border-radius: 4px;
    font-size: 14px;
  }

  .message.system {
    background-color: #f0f0f0;
    color: #666;
  }

  .message.me {
    background-color: #e3f2fd;
  }

  .message.peer {
    background-color: #f5f5f5;
  }

  .message .from {
    font-weight: bold;
    margin-right: 8px;
  }

  .message .time {
    float: right;
    font-size: 12px;
    color: #999;
  }

  .message-input {
    display: flex;
    gap: 10px;
  }

  .message-input input {
    flex: 1;
  }
</style>