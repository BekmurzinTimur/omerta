<script lang="ts">
	import { BASE_TIP_LIFESPAN, MissionStatus, type IMission } from '$lib/models/MissionModels';
	import { getAllUnitsMap, getTick } from '$lib/services/GameController.svelte';
	import { getUnitImage } from '$lib/utils/common';
	import { formatUSD } from '$lib/utils/moneyUtils';
	import ProgressBar from '../Common/ProgressBar.svelte';
	import { addWindow } from '../DialogWindows/windowStore.svelte';
	import AttributesList from './AttributesList.svelte';
	import MissionCardBig from './MissionCardBig.svelte';
	import MissionStatusBadge from './MissionStatusBadge.svelte';

	let {
		mission,
		eta = ''
	}: {
		mission: IMission;
		eta?: string;
	} = $props();

	let tick = $derived(getTick());
	let progress = $derived.by<number>(() => {
		if (!mission) return 0;
		if (mission.status === MissionStatus.AVAILABLE) return 0;
		if (mission.status !== MissionStatus.ACTIVE) return 100;
		let length = mission.endTick! - mission.startTick!;
		let tickPassed = tick - mission.startTick!;
		return Math.min(Math.round((tickPassed / length) * 100), 100);
	});
	let allUnitsMap = $derived(getAllUnitsMap());
	let tipTicksLeft = $derived(mission.tipExpires - tick);

	let unitImages = $derived(
		mission?.unitIds.map((id) => getUnitImage(allUnitsMap.get(id)?.image)) || []
	);
	$inspect(mission);
	$inspect(tipTicksLeft);

	function handleClick() {
		addWindow({
			id: `window-${mission.id}`,
			title: `Mission: ${mission.info.name}`,
			content: { component: MissionCardBig, props: { missionId: mission.id } },
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
		src={mission.info.image}
		alt={mission.info.name}
		class="absolute inset-0 h-full w-full object-cover"
	/>

	<!-- overlay -->
	<div class="relative flex flex-col gap-2 p-3 hover:bg-white/20">
		<div class="flex">
			<div
				class="mr-2 flex size-6 justify-center rounded-full bg-green-500"
				class:bg-red-500={tipTicksLeft < 5}
			>
				{tipTicksLeft}
			</div>
			<h3 class="font-semibold text-white drop-shadow">{mission.info.name}</h3>
		</div>

		<div class="text-sm text-white/80">Reward: ${mission.info.reward.toLocaleString()}</div>

		<AttributesList stats={mission.info.difficulty} />

		{#if mission.results?.money}<div class="text-xs text-white/90">
				Results: {formatUSD(mission.results.money)}
			</div>{/if}

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
		<ProgressBar {progress} />
	</div>
</div>
