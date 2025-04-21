<script lang="ts">
	import { MissionStatus, type IMission, type IMissionInfo } from '$lib/models/MissionModels';
	import { getAllUnitsMap, getTick } from '$lib/services/GameController.svelte';
	import { getUnitImage } from '$lib/utils/common';
	import { addWindow } from '../DialogWindows/windowStore.svelte';
	import AttributesList from './AttributesList.svelte';
	import MissionCardBig from './MissionCardBig.svelte';
	import MissionStatusBadge from './MissionStatusBadge.svelte';

	let {
		missionInfo,
		mission,
		eta = ''
	}: {
		missionInfo: IMissionInfo;
		mission?: IMission;
		eta?: string;
	} = $props();

	let tick = $derived(getTick());
	let progress = $derived.by<number>(() => {
		if (!mission) return 0;
		if (mission.status !== MissionStatus.ACTIVE) return 100;
		let length = mission.endTick - mission.startTick;
		let tickPassed = tick - mission.startTick;
		return Math.min(Math.round((tickPassed / length) * 100), 100);
	});
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

			<AttributesList stats={missionInfo.difficulty} />
		{:else}
			<div class="text-xs text-white/90">ETA: {eta}</div>

			<div class="flex justify-between">
				<div class="mt-1 flex -space-x-2">
					{#each unitImages as img}
						<img
							src={img}
							alt="unit"
							class="h-6 w-6 rounded-full border-2 border-white object-cover"
						/>
					{/each}
				</div>
				<MissionStatusBadge status={mission?.status} />
			</div>

			<!-- progress bar -->
			<div class="h-2 w-full overflow-hidden rounded-full bg-white/20">
				<div class="h-full bg-white transition-all" style="width: {progress}%" />
			</div>
		{/if}
	</div>
</div>
