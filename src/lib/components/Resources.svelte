<script lang="ts">
	import { ICON_LABELS } from '$lib/const/icons';
	import { getViewingPlayer } from '$lib/services/GameController.svelte';
	import { getAwarenessLevel, getHeatLevel } from '$lib/utils/familyUtils';
	import { formatUSD } from '$lib/utils/moneyUtils';
	import IconTile from './Common/Icons/IconTile.svelte';
	import { onMount } from 'svelte';
	// Get the local player
	let player = $derived(getViewingPlayer());
	let heatLevel = $derived(player ? getHeatLevel(player.resources.heat) : 0);
	let awarenessLevel = $derived(player ? getAwarenessLevel(player.resources.awareness) : 0);

	// Helper function to format income with sign
	const formatIncome = (income: number): string => {
		return income >= 0 ? `+ ${formatUSD(income)}` : formatUSD(income);
	};

	let clickSound = $state<HTMLAudioElement | null>(null);
	onMount(() => {
		clickSound = new Audio('/audio/kashing');
		clickSound.muted = true;
	});
	$effect(() => {
		player?.resources.lastIncome;
		clickSound?.play();
	});
</script>

<!-- Player resources -->
<div class="resources pointer-events-auto rounded-br-xl bg-gray-700 px-2">
	{#if player}
		<div class="flex items-center gap-8">
			<div class="roundedp-2">
				<span class="mr-2 ml-2 text-sm text-yellow-400">
					<IconTile label={'MONEY'} />
				</span>
				<span class="font-semibold text-white"
					>{formatUSD(player.resources.money)}
					<span
						class:text-green-500={player.resources.lastIncome >= 0}
						class:text-red-400={player.resources.lastIncome < 0}
						>{formatIncome(player.resources.lastIncome)}</span
					></span
				>
			</div>
			<div class="resource flex items-center gap-2 rounded p-2">
				<span class="text-sm text-red-400">
					<img src="/icons/police.png" class="size-10" />
				</span>
				<span class="font-semibold text-white"
					><span
						class="inline-flex size-5 items-center justify-center rounded-full"
						class:bg-gray-500={heatLevel === 0}
						class:bg-yellow-400={heatLevel === 1}
						class:bg-amber-500={heatLevel === 2}
						class:bg-red-500={heatLevel === 3}
						>{heatLevel}
					</span>
					- {player.resources.heat || 0}</span
				>
			</div>
			<div class="resource flex items-center gap-2 rounded p-2">
				<span class="text-sm text-red-400">
					<IconTile label={'FILES'} />
				</span>
				<span class="font-semibold text-white"
					><span
						class="inline-flex size-5 items-center justify-center rounded-full"
						class:bg-gray-500={heatLevel === 0}
						class:bg-yellow-400={heatLevel === 1}
						class:bg-amber-500={heatLevel === 2}
						class:bg-red-500={heatLevel === 3}
						>{awarenessLevel}
					</span>
					- {player.resources.awareness || 0}</span
				>
			</div>
		</div>
	{/if}
</div>
