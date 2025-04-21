<script lang="ts">
	import MissionCard from './MissionCard.svelte';

	import { DEFAULT_MISSIONS, MissionStatus, type IMissionInfo } from '$lib/models/MissionModels';
	import Sidebar from '../Sidebar.svelte';
	import {
		getActiveMissions,
		getAvailableMissions,
		getFinishedMissions,
		getMyMissions
	} from '$lib/services/GameController.svelte';

	/** For now we expose an empty array – replace with real store later */
	let myMissions = $derived(getMyMissions());
	let activeMissions = $derived(myMissions.filter((m) => m.status === MissionStatus.ACTIVE));
	let finishedMissions = $derived(myMissions.filter((m) => m.status !== MissionStatus.ACTIVE));
	let availableMissions = $derived(getAvailableMissions());

	$effect(() => {
		console.log({ activeMissions, finishedMissions, availableMissions, myMissions });
		console.log(myMissions.filter((m) => m.status === MissionStatus.SUCCEEDED));
	});
</script>

<Sidebar>
	<h2 class="border-b border-gray-800 px-4 py-3 text-lg font-bold">Missions</h2>

	<!-- Active -->
	<div class="flex-1 overflow-y-auto px-4 py-3">
		<h3 class="text-sm font-semibold text-gray-400 uppercase">Active</h3>

		<div class="mt-2 flex flex-col gap-2">
			{#if activeMissions.length === 0}
				<p class="text-xs text-gray-500">No active missions</p>
			{:else}
				{#each activeMissions as activeMission}
					<MissionCard
						mission={activeMission}
						missionInfo={DEFAULT_MISSIONS[activeMission.missionInfoId]}
						eta="unknown"
					/>
				{/each}
			{/if}
		</div>

		<!-- Available -->
		<h3 class="mt-6 text-sm font-semibold text-gray-400 uppercase">Available</h3>

		<div class="mt-2 flex flex-col gap-2">
			{#each availableMissions as missionInfo}
				<MissionCard {missionInfo} eta="unknown" />
			{/each}
		</div>

		<!-- History -->
		<h3 class="mt-6 text-sm font-semibold text-gray-400 uppercase">History of missions</h3>

		<div class="mt-2 flex flex-col gap-2">
			{#each finishedMissions as finishedMission}
				<MissionCard
					mission={finishedMission}
					missionInfo={DEFAULT_MISSIONS[finishedMission.missionInfoId]}
					eta="finished"
				/>
			{/each}
		</div>
	</div>
</Sidebar>
