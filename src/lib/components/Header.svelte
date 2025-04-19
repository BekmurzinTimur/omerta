<script>
	import gameState from '../services/GameState.svelte';
	import gameService from '../services/GameService.svelte';
	import Resources from './Resources.svelte';
	let state = gameState.state;
	// Format the current game date
	let formattedDate = $derived(gameState.formatGameDate(state.currentDate));
</script>

<!-- Header.svelte - Slim header component -->
<div class="game-header flex items-center justify-between bg-gray-800 p-4 text-white">
	<div>
		<Resources />
	</div>
	<div class="flex items-center space-x-4">
		<div class="flex items-center space-x-4">
			<span class="text-green-400">{formattedDate}</span>
		</div>

		<span class="text-sm">Tick: {state.tickCount}</span>
		<button
			class="rounded px-4 py-2 text-sm font-medium {gameService.isRunning
				? 'bg-red-600 hover:bg-red-700'
				: 'bg-green-600 hover:bg-green-700'}"
			onclick={() => gameService.toggleGameLoop()}
		>
			{gameService.isRunning ? 'Pause' : 'Start'}
		</button>
	</div>
</div>
