<script lang="ts">
	import { getViewingPlayer } from '$lib/services/GameController.svelte';

	let player = $derived(getViewingPlayer()!);
	let score = $derived(player.resources.lastIncome / (player.resources.heat || 1));

	// Function to determine color class based on score
	function getScoreColorClass(value: number): string {
		if (value >= 10) return 'text-emerald-500';
		if (value >= 5) return 'text-sky-500';
		if (value >= 0) return 'text-amber-500';
		return 'text-rose-500';
	}
</script>

<div class="mx-auto max-w-sm bg-gray-800 p-4 shadow-lg">
	<div class="flex items-center justify-between gap-4">
		<h3 class="text-xl font-medium text-gray-300">Efficiency Score:</h3>
		<div class="flex items-center">
			<div class={`text-2xl font-bold ${getScoreColorClass(score)}`}>
				{score.toFixed(2)}
			</div>
		</div>
	</div>
	<div class="mt-3 h-2 rounded-full bg-gray-700">
		<div
			class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
			style={`width: ${Math.min(Math.max(score * 5, 0), 100)}%`}
		></div>
	</div>
	<div class="mt-2 text-xs text-gray-400">
		Income/Heat Ratio: {player.resources.lastIncome}/{player.resources.heat || 1}
	</div>
</div>
