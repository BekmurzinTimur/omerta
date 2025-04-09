<script lang="ts">
	import { onMount } from 'svelte';
	import io from 'socket.io-client';

	let gameState: any = null;
	let socket: ReturnType<typeof io> | null = null;

	// Hard-code or dynamically determine the player's ID for demonstration.
	const playerId = 'p1'; // e.g. could come from a store or user login

	// Attempt to establish the socket connection
	function connectSocket() {
		socket = io('http://localhost:3000', {
			query: { playerId }
			// If needed, add transports or other Socket.io client options
			// transports: ['websocket'],
		});

		// On successful connection
		socket.on('connect', () => {
			console.log('Socket connected:', (socket as ReturnType<typeof io>).id);
		});

		// On disconnect, attempt reconnect
		socket.on('disconnect', () => {
			console.warn('Socket disconnected. Reconnecting...');
			setTimeout(() => {
				connectSocket();
			}, 2000); // delay before trying again
		});

		// Listen for the "gameState" event from the server
		socket.on('gameState', (state) => {
			console.log('Received game state:', state);
			gameState = state;
		});
	}

	onMount(() => {
		connectSocket();

		// Cleanup if needed
		return () => {
			if (socket) {
				socket.disconnect();
			}
		};
	});
</script>

<h1>My Grand Strategy Game</h1>
<p>
	This page connects to the NestJS Socket.io server and displays game state updates in real-time.
</p>

{#if gameState}
	<pre>{JSON.stringify(gameState, null, 2)}</pre>
{:else}
	<p>No game state received yet.</p>
{/if}
