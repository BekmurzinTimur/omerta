<script lang="ts">
	import { ICON_LABELS } from '$lib/const/icons';
	import { getLocalPlayer } from '$lib/services/GameController.svelte';
	import { formatUSD } from '$lib/utils/moneyUtils';
	import IconTile from './Common/Icons/IconTile.svelte';

	// Get the local player
	let player = $derived(getLocalPlayer());

	// Helper function to format income with sign
	const formatIncome = (income: number): string => {
		return income >= 0 ? `+ ${formatUSD(income)}` : formatUSD(income);
	};
</script>

<!-- Player resources -->
<div class="resources rounded-br-xl bg-gray-700 px-2">
	{#if player}
		<div class="flex items-center gap-8">
			<div class="roundedp-2">
				<span class="mr-2 ml-2 text-sm text-yellow-400">
					<IconTile label={'MONEY'} />
				</span>
				<span class="font-semibold text-white"
					>{formatUSD(player.resources.money)} {formatIncome(player.resources.lastIncome)}</span
				>
			</div>
			<div class="resource flex items-center gap-2 rounded p-2">
				<span class="text-sm text-red-400">
					<img src="/icons/police.png" class="size-10" />
				</span>
				<span class="font-semibold text-white">{player.resources.heat || 0}</span>
			</div>
		</div>
	{/if}
</div>
