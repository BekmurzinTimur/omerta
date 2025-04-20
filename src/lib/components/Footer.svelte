<script lang="ts">
	import { UnitStatus } from '$lib/models/UnitModels';
	import {
		getAllUnits,
		getAssociates,
		getLocalPlayer,
		hireUnit
	} from '../services/GameController.svelte';
	import Draggable from './DragAndDrop/Draggable.svelte';
	import UnitCard from './UnitCard.svelte';
	// Get all units in the game
	let units = $derived(getAllUnits());
	let associates = $derived(getAssociates());
	// Hire a new unit
	const onHireUnitClick = (unitId: string) => {
		hireUnit(unitId);
	};
</script>

<footer class="flex gap-4 bg-gray-800 px-4 py-4 text-white">
	<!-- Units list -->
	<div class="units mb-6 w-full flex-grow overflow-x-auto rounded-lg bg-gray-700 p-3">
		<div class="flex gap-2">
			{#if units.length > 0}
				{#each units as unit}
					<Draggable
						disabled={unit.status !== UnitStatus.IDLE}
						item={{
							id: unit.id,
							type: 'member',
							data: unit
						}}
						zoneId="source"
					>
						<UnitCard {unit} />
					</Draggable>
				{/each}
			{:else}
				<p class="text-sm text-gray-400">No units available</p>
			{/if}

			<div class="border border-dashed border-white bg-gray-800 text-white shadow-lg"></div>
			{#if associates.length > 0}
				{#each associates as unit}
					<Draggable
						disabled={unit.status !== UnitStatus.IDLE}
						item={{
							id: unit.id,
							type: 'associate',
							data: unit
						}}
						zoneId="source"
					>
						<UnitCard {unit} />
					</Draggable>
				{/each}
			{:else}
				<p class="text-sm text-gray-400">No associates available</p>
			{/if}
		</div>
	</div>
</footer>
