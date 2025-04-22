<script lang="ts">
	import MissionCard from './MissionCard.svelte';

	import Sidebar from '../Sidebar.svelte';
	import {
		getActiveMissions,
		getAvailableMissions,
		getFinishedMissions
	} from '$lib/services/GameController.svelte';

	/** For now we expose an empty array – replace with real store later */
	let activeMissions = $derived(getActiveMissions());
	let finishedMissions = $derived(getFinishedMissions());
	let availableMissions = $derived(getAvailableMissions());
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
				{#each activeMissions as mission}
					<MissionCard {mission} eta="unknown" />
				{/each}
			{/if}
		</div>

		<!-- Available -->
		<h3 class="mt-6 text-sm font-semibold text-gray-400 uppercase">Available</h3>

		<div class="mt-2 flex flex-col gap-2">
			{#each availableMissions as mission}
				<MissionCard {mission} eta="unknown" />
			{/each}
		</div>

		<!-- History -->
		<h3 class="mt-6 text-sm font-semibold text-gray-400 uppercase">History</h3>

		<div class="mt-2 flex flex-col gap-2">
			{#each finishedMissions as mission}
				<MissionCard {mission} eta="finished" />
			{/each}
		</div>
	</div>
</Sidebar>
