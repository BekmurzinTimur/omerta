<script lang="ts">
	import { UnitStatus } from '$lib/models/UnitModels';
	import { getUsedUnits } from '$lib/services/UiState.svelte';
	import { getMaxFamilySize } from '$lib/utils/familyUtils';
	import { getAssociates, getPlayerUnits, getTick } from '../../services/GameController.svelte';
	import Draggable from '../DragAndDrop/Draggable.svelte';
	import UnitCard from './UnitCard.svelte';

	let tick: number = $derived(getTick());

	// Get all units in the game
	let usedUnits = $derived(getUsedUnits());
	let units = $derived(getPlayerUnits());
	let associates = $derived(getAssociates());
	let maxFamilySize = $derived(getMaxFamilySize(units));

	$effect(() => {
		tick;
		usedUnits.clear();
	});
</script>

<footer class="bg-gray-800 px-4 py-4 text-white">
	<div>
		Family members: {units.length} / {maxFamilySize}
	</div>
	<!-- Units list -->
	<div class="units mb-6 w-full flex-grow overflow-x-auto rounded-lg bg-gray-700 p-3">
		<div class="flex gap-2">
			{#if units.length > 0}
				{#each units as unit}
					<Draggable
						disabled={unit.status !== UnitStatus.IDLE || usedUnits.has(unit.id)}
						item={{
							id: unit.id,
							type: 'member',
							data: unit
						}}
						zoneId="source"
					>
						<UnitCard {unit} assigned={usedUnits.has(unit.id)} />
					</Draggable>
				{/each}
			{:else}
				<p class="text-sm text-gray-400">No units available</p>
			{/if}

			<div class="border border-dashed border-white bg-gray-800 text-white shadow-lg"></div>
			{#if associates.length > 0}
				{#each associates as unit}
					<Draggable
						disabled={unit.status !== UnitStatus.IDLE || usedUnits.has(unit.id)}
						item={{
							id: unit.id,
							type: 'associate',
							data: unit
						}}
						zoneId="source"
					>
						<UnitCard {unit} assigned={usedUnits.has(unit.id)} />
					</Draggable>
				{/each}
			{:else}
				<p class="text-sm text-gray-400">No associates available</p>
			{/if}
		</div>
	</div>
</footer>
