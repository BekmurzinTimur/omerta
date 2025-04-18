<script lang="ts">
	import type { ITerritory } from '$lib/models/TerritoryModel';
	import type { IUnit } from '$lib/models/UnitModels';
	import {
		assignUnitToTerritory,
		getLocalPlayer,
		getPlayerTerritories,
		removeUnitFromTerritory
	} from '$lib/services/GameController.svelte';
	import { type DraggableItem, type DropResult } from './DragAndDrop/DragAndDropTypes';
	import DropZone from './DragAndDrop/DropZone.svelte';
	import UnitDrop from './Unit/UnitDrop.svelte';

	let { territory }: { territory?: ITerritory } = $props();
	let droppedItem = $state<DraggableItem | null>(null);
	let droppedUnit = $derived<IUnit | null>(droppedItem?.data);
	let confirmed = $derived(droppedUnit?.id === territory?.managerId);
	let player = $derived(getLocalPlayer());

	// Handle drop events
	function handleDrop(result: DropResult) {
		const { item } = result;
		droppedItem = item;
		const unitId = (item.data as IUnit).id;
		if (!unitId) return;
		if (!territory?.id) return;
		if (territory.managerId === unitId) return console.log('Same unit', item);
		assignUnitToTerritory(unitId, territory.id);
	}
	function handleRemove(unitId: string) {
		if (!territory?.id) return;
		removeUnitFromTerritory(unitId, territory.id);
		droppedItem = null;
	}
</script>

<!-- Actions -->
<div class="actions mb-6 rounded-lg bg-gray-700 p-3 text-gray-300">
	<!-- Territory capture section -->
	<div class="action-group mb-4">
		{#if territory}
			<h4 class="text-lg">{territory.name}</h4>
			<div>Owner: {territory.ownerId ? territory.ownerId : 'no one'}</div>
			<div>Income: ${territory.resources.income}</div>
			{#if territory.ownerId === player?.id}
				<DropZone id="target" onDrop={handleDrop} accepts={['unit']}>
					<UnitDrop unit={droppedItem?.data} {confirmed} onRemove={handleRemove} />
				</DropZone>
			{/if}
		{:else}
			<h4 class="text-lg">Select a territory</h4>
		{/if}
	</div>
</div>
