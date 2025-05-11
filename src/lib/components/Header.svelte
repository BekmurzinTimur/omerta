<script>
	import gameState from '../services/GameState.svelte';
	import gameService from '../services/GameService.svelte';
	import Resources from './Resources.svelte';
	let state = gameState.state;
	// Format the current game date
	let formattedDate = $derived(gameState.formatGameDate(state.currentDate));
</script>

<!-- Header.svelte - Slim header component -->
<div
	class="game-header pointer-events-none fixed top-0 right-0 left-0 z-10 flex items-start justify-between text-white"
>
	<div>
		<Resources />
	</div>
	<div class="pointer-events-auto flex items-center gap-4 rounded-bl-xl bg-gray-700 px-4 py-2">
		<div class="flex items-center space-x-4">
			<span class="text-green-400">{formattedDate}</span>
		</div>

		<span class="text-sm">Tick: {state.tickCount}</span>
		<button
			class="rounded px-4 py-2 text-sm font-medium {gameService.isRunning
				? 'bg-red-600 hover:bg-red-700'
				: 'bg-green-600 hover:bg-green-700'}"
			onclick={() => gameService.toggleGameLoop()}
			disabled={state.hasEnded}
		>
			{gameService.isRunning ? 'Pause' : 'Start'}
		</button>
	</div>
</div>
