<script lang="ts">
	import type { IMission, IMissionInfo } from '$lib/models/MissionModels';
	import { getAllUnitsMap } from '$lib/services/GameController.svelte';
	import { getUnitImage } from '$lib/utils/common';
	import { addWindow } from '../DialogWindows/windowStore.svelte';
	import MissionCardBig from './MissionCardBig.svelte';

	let {
		missionInfo,
		mission,
		progress = 0,
		eta = ''
	}: {
		missionInfo: IMissionInfo;
		mission?: IMission;
		progress?: number;
		eta?: string;
	} = $props();

	let allUnitsMap = $derived(getAllUnitsMap());
	let isActive = $derived(!!mission);
	let unitImages = $derived(
		mission?.unitIds.map((id) => getUnitImage(allUnitsMap.get(id)?.image)) || []
	);

	function handleClick() {
		addWindow({
			id: `window-${Date.now()}`,
			title: `Mission: ${missionInfo.name}`,
			content: { component: MissionCardBig, props: { missionInfo } },
			position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
			size: { width: 600, height: 500 }
		});
	}
</script>

<div
	class="relative cursor-pointer overflow-hidden rounded-lg shadow-md transition hover:shadow-lg"
	onclick={handleClick}
>
	<img
		src={missionInfo.image}
		alt={missionInfo.name}
		class="absolute inset-0 h-full w-full object-cover"
	/>

	<!-- overlay -->
	<div class="relative flex flex-col gap-2 p-3 hover:bg-white/20">
		<h3 class="font-semibold text-white drop-shadow">{missionInfo.name}</h3>

		{#if !isActive}
			<div class="text-sm text-white/80">Reward: ${missionInfo.reward.toLocaleString()}</div>

			<div class="flex flex-wrap gap-2 text-xs text-white/80">
				{#each Object.entries(missionInfo.difficulty) as [key, val]}
					<span>{key}: {val}</span>
				{/each}
			</div>
		{:else}
			<!-- progress bar -->
			<div class="h-2 w-full overflow-hidden rounded-full bg-white/20">
				<div class="h-full bg-green-400 transition-all" style="width: {progress}%" />
			</div>

			<div class="text-xs text-white/90">ETA: {eta}</div>

			<div class="mt-1 flex -space-x-2">
				{#each unitImages as img}
					<img
						src={img}
						alt="unit"
						class="h-6 w-6 rounded-full border-2 border-white object-cover"
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>
