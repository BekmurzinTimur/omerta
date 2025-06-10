<script lang="ts">
  import MultiplayerComponent from '$lib/components/Lobby/Lobby.svelte';
  import type { GameMessage } from '$lib/services/Multiplayer/Types.ts';

  // Example game state
  let players = $state<Map<string, { x: number; y: number; color: string }>>(new Map());
  let myPosition = $state({ x: 50, y: 50 });
  let myColor = $state(`#${Math.floor(Math.random()*16777215).toString(16)}`);

  function handleMessage(peerId: string, message: GameMessage) {
    switch (message.type) {
      case 'player-move':
        const { x, y, color } = message.data;
        players.set(peerId, { x, y, color });
        players = new Map(players); // Trigger reactivity
        break;
      
      case 'player-leave':
        players.delete(peerId);
        players = new Map(players); // Trigger reactivity
        break;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    const speed = 5;
    let moved = false;

    switch (e.key) {
      case 'ArrowUp':
        myPosition.y = Math.max(0, myPosition.y - speed);
        moved = true;
        break;
      case 'ArrowDown':
        myPosition.y = Math.min(100, myPosition.y + speed);
        moved = true;
        break;
      case 'ArrowLeft':
        myPosition.x = Math.max(0, myPosition.x - speed);
        moved = true;
        break;
      case 'ArrowRight':
        myPosition.x = Math.min(100, myPosition.x + speed);
        moved = true;
        break;
    }

    if (moved) {
      // This would be handled by the multiplayer component
      // Broadcasting is done through the service
    }
  }
</script>

<svelte:head>
  <title>WebRTC Multiplayer Demo</title>
  <meta name="description" content="P2P multiplayer game using PeerJS and Svelte 5" />
</svelte:head>

<main>
  <h1>WebRTC Multiplayer Demo</h1>
  
  <div class="container">
    <div class="game-section">
      <h2>Game Area</h2>
      <div class="game-info">
        <p>Use arrow keys to move your player</p>
        <p>Your color: <span class="color-box" style="background-color: {myColor}"></span></p>
      </div>
      
      <div class="game-canvas" on:keydown={handleKeyDown} tabindex="0">
        <!-- My player -->
        <div 
          class="player me" 
          style="left: {myPosition.x}%; top: {myPosition.y}%; background-color: {myColor}"
        >
          ME
        </div>
        
        <!-- Other players -->
        {#each players as [peerId, player]}
          <div 
            class="player" 
            style="left: {player.x}%; top: {player.y}%; background-color: {player.color}"
          >
            {peerId.slice(0, 6)}
          </div>
        {/each}
      </div>
    </div>
    
    <div class="multiplayer-section">
      <MultiplayerComponent onMessage={handleMessage} />
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, sans-serif;
    background-color: #f9f9f9;
  }

  main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
  }

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 30px;
  }

  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    align-items: start;
  }

  @media (max-width: 1024px) {
    .container {
      grid-template-columns: 1fr;
    }
  }

  .game-section {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .game-section h2 {
    margin-top: 0;
    color: #333;
  }

  .game-info {
    margin-bottom: 20px;
    font-size: 14px;
    color: #666;
  }

  .game-info p {
    margin: 5px 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .color-box {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .game-canvas {
    position: relative;
    width: 100%;
    height: 400px;
    background-color: #f5f5f5;
    border: 2px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    cursor: crosshair;
  }

  .game-canvas:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }

  .player {
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
    transform: translate(-50%, -50%);
    transition: left 0.1s, top 0.1s;
  }

  .player.me {
    border: 3px solid white;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }

  .multiplayer-section {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>