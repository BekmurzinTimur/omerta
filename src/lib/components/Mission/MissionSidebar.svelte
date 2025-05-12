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
	<!-- Active -->
	<div class="flex-1 overflow-y-auto">
		<div class="flex flex-col gap-2">
			{#if activeMissions.length === 0}
				<p class="text-white-500 text-right text-xs">No active missions</p>
			{:else}
				{#each activeMissions as mission}
					<MissionCard {mission} eta="unknown" />
				{/each}
			{/if}
		</div>

		<div class="mt-2 flex flex-col gap-2">
			{#each availableMissions as mission}
				<MissionCard {mission} eta="unknown" />
			{/each}
		</div>

		<!-- <div class="mt-2 flex flex-col gap-2">
			{#each finishedMissions as mission}
				<MissionCard {mission} eta="finished" />
			{/each}
		</div> -->
	</div>
</Sidebar>
