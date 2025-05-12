<script lang="ts">
	import { MissionStatus, type IMission } from '$lib/models/MissionModels';
	import { getAllUnitsMap, getTick } from '$lib/services/GameController.svelte';
	import { getUnitImage } from '$lib/utils/common';
	import { formatUSD } from '$lib/utils/moneyUtils';
	import ProgressBar from '../Common/ProgressBar.svelte';
	import { addToast } from '../Common/Toaster/Toaster.svelte';
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
	let tipTicksLeft = $derived(
		mission.status === MissionStatus.AVAILABLE ? mission.tipExpires - tick : null
	);
	let hasNotified = $state(false);

	let unitImages = $derived(
		mission?.unitIds.map((id) => getUnitImage(allUnitsMap.get(id)?.image)) || []
	);
	$effect(() => {
		if (hasNotified) return;
		if (mission.status === MissionStatus.FAILED || mission.status === MissionStatus.SUCCEEDED) {
			console.log(mission, hasNotified);
			hasNotified = true;
			addToast({
				data: {
					title: mission.status,
					description: `Mission ${mission.info.name} has ${mission.status}`
				}
			});
		}
	});

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
			{#if tipTicksLeft !== null}
				<div
					class="mr-2 flex size-6 min-w-6 justify-center rounded-full bg-green-500"
					class:bg-red-500={tipTicksLeft < 5}
				>
					{tipTicksLeft}
				</div>
			{/if}
			<h3
				class="overflow-hidden text-sm font-semibold text-ellipsis whitespace-nowrap text-white drop-shadow"
			>
				{mission.info.name}
			</h3>
		</div>

		<div class="text-sm text-white/80">Reward: ${mission.info.reward.toLocaleString()}</div>

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
			{#if mission?.status !== MissionStatus.AVAILABLE}
				<MissionStatusBadge status={mission?.status} />
			{/if}
		</div>

		<!-- progress bar -->
		<ProgressBar {progress} />
	</div>
</div>
