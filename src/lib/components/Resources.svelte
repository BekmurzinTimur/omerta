<script lang="ts">
	import { getLocalPlayer } from '$lib/services/GameController.svelte';
	import { formatUSD } from '$lib/utils/moneyUtils';

	// Get the local player
	let player = $derived(getLocalPlayer());

	// Helper function to format income with sign
	const formatIncome = (income: number): string => {
		return income >= 0 ? `+ ${formatUSD(income)}` : formatUSD(income);
	};
</script>

<!-- Player resources -->
<div class="resources rounded-lg bg-gray-700">
	{#if player}
		<div class="flex">
			<div class="resource rounded bg-gray-800 p-2">
				<span class="text-sm text-yellow-400">Money</span>
				<span class="font-semibold text-white"
					>{formatUSD(player.resources.money)} {formatIncome(player.resources.lastIncome)}</span
				>
			</div>
			<div class="resource rounded bg-gray-800 p-2">
				<span class="text-sm text-red-400">Heat</span>
				<span class="font-semibold text-white">{player.resources.heat || 0}</span>
			</div>
		</div>
	{/if}
</div>
