<script lang="ts">
	import type { DraggableItem } from '$lib/components/DragAndDrop/DragAndDropTypes';
	import Draggable from '$lib/components/DragAndDrop/Draggable.svelte';
	import { type IUnit, UnitRank } from '$lib/models/UnitModels';
	import {
		assignToCrew,
		getAllUnits,
		getAllUnitsMap,
		getPlayerUnits,
		getViewingPlayer,
		getViewingPlayerId
	} from '$lib/services/GameController.svelte';
	import AssignUnit from '../AssignUnit.svelte';
	import UnitCard from '../UnitCard.svelte';
	import UnitCardSmall from '../UnitCardSmall.svelte';
	import { getCrewDroppedItems } from './crewStore.svelte';

	let { capoId }: { capoId: string; crewIndex: number } = $props();

	let playerId = $derived(getViewingPlayerId());
	let units = $derived(getPlayerUnits(playerId || ''));
	let allUnitsMap = $derived(getAllUnitsMap());
	let unassignedSoldiers = $derived(
		units.filter((unit) => !unit.captainId && unit.rank === UnitRank.SOLDIER)
	);
	let capo = $derived(allUnitsMap.get(capoId)!);
	let crew = $state<IUnit[]>([]);

	function handleDrop(slotIndex: number, captainId: string) {
		return (result: { item: DraggableItem }) => {
			if (!playerId) return;
			const unit = result.item.data as IUnit;
			crew[slotIndex] = unit;
			assignToCrew(playerId, unit.id, captainId, slotIndex);
		};
	}
</script>

<div class="bg-gray-400 p-4">
	<div class="flex flex-col gap-2">
		<div class="flex gap-2">
			<UnitCard unit={capo}></UnitCard>
			<div class="grid grid-cols-3 grid-rows-2 gap-2">
				{#each Array.from(Array(6)) as _, index}
					{@const assignedUnit = allUnitsMap.get(capo.crew?.[index] || '')}
					{@const droppedUnit = crew[index]}
					{@const confirmed = !!assignedUnit && assignedUnit.id === droppedUnit?.id}
					<AssignUnit
						id="crew-{capo.id}-{index}"
						onDrop={handleDrop(index, capo.id)}
						accepts={['member-crew']}
						{assignedUnit}
						{droppedUnit}
						{confirmed}
					/>
				{/each}
			</div>
		</div>
		<div class="border"></div>
	</div>

	<div class="units w-full flex-grow overflow-x-auto rounded-lg">
		<h4>UNASSIGNED SOLDIERS:</h4>
		<div class="flex gap-2">
			{#if unassignedSoldiers.length > 0}
				{#each unassignedSoldiers as unit}
					<Draggable
						item={{
							id: unit.id,
							type: 'member-crew',
							data: unit
						}}
						zoneId="source"
					>
						<UnitCardSmall {unit} />
					</Draggable>
				{/each}
			{:else}
				None
			{/if}
		</div>
	</div>
</div>
