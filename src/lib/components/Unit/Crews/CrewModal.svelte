<script lang="ts">
	import Draggable from '$lib/components/DragAndDrop/Draggable.svelte';
	import { UnitRank } from '$lib/models/UnitModels';
	import { getPlayerUnits } from '$lib/services/GameController.svelte';
	import AssignUnit from '../AssignUnit.svelte';
	import UnitCard from '../UnitCard.svelte';
	import { getCrewDroppedItems } from './crewStore.svelte';

	let { capoId, crewIndex }: { capoId: string; crewIndex: number } = $props();
	let droppedItemsMap = $derived(getCrewDroppedItems());

	let units = $derived(getPlayerUnits());
	let unassignedSoldiers = $derived(
		units.filter((unit) => !unit.captainId && unit.rank === UnitRank.SOLDIER)
	);
	let capos = $derived(getPlayerUnits().filter((unit) => unit.rank === UnitRank.CAPO));
	let crew;
</script>

<div class="bg-gray-400 p-8">
	{#each capos as capo}
		<div class="flex flex-col gap-2">
			<h4 class="mb-2 rounded-lg bg-gray-700 px-2 py-1 text-white">
				{capo.name} crew <span>{capo.crew?.length || 0} / 6</span>
			</h4>
			<div class="flex gap-2">
				<UnitCard unit={capo}></UnitCard>
				<div class="flex gap-2">
					{#each Array.from(Array(6)) as _, index}
						<!-- <AssignUnit
							id="crew-{capo.id}-{index}"
							onDrop={handleDrop}
							onClear={handleClear}
							accepts={['member']}
							assignedUnit={units.get()}
							droppedUnit={droppedItemsMap.get(`crew-${capo.id}-${index}`)?.data}
							onRemove={handleRemove}
						/> -->
					{/each}
				</div>
			</div>
			<div class="border"></div>
		</div>
	{/each}

	<div class="units w-full flex-grow overflow-x-auto rounded-lg py-2">
		<h4>UNASSIGNED SOLDIERS:</h4>
		<div class="flex gap-2">
			{#if unassignedSoldiers.length > 0}
				{#each unassignedSoldiers as unit}
					<Draggable
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
			{/if}
		</div>
	</div>
</div>
