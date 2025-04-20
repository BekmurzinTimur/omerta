<script lang="ts">
	import type { ITerritory } from '$lib/models/TerritoryModel';
	import { UnitRank, type IUnit } from '$lib/models/UnitModels';
	import {
		assignUnitToTerritory,
		getAllUnitsMap,
		getLocalPlayer,
		removeUnitFromTerritory,
		startCapturingTerritory
	} from '$lib/services/GameController.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { type DraggableItem, type DropResult } from './DragAndDrop/DragAndDropTypes';
	import DropZone from './DragAndDrop/DropZone.svelte';
	import UnitDrop from './Unit/UnitDrop.svelte';
	import AssignUnit from './Unit/AssignUnit.svelte';

	let { territory }: { territory?: ITerritory } = $props();
	let droppedItemsMap = $state(new SvelteMap<string, DraggableItem>());
	let droppedItem = $derived<DraggableItem | null>(
		droppedItemsMap.get(territory?.id || '') || null
	);
	let droppedUnit = $derived<IUnit | null>(droppedItem?.data);
	let confirmed = $derived(droppedUnit?.id === territory?.managerId);
	let capturerConfirmed = $derived(droppedUnit?.id === territory?.capturingUnitId);
	let player = $derived(getLocalPlayer());

	let managerUnit = $derived(getAllUnitsMap().get(territory?.managerId || ''));
	let capturerUnit = $derived(getAllUnitsMap().get(territory?.capturingUnitId || ''));

	// Handle drop events
	function handleDrop(result: DropResult) {
		if (!territory?.id) return;
		const { item } = result;
		const unitId = (item.data as IUnit).id;
		if (item.data.rank === UnitRank.ASSOCIATE) return;
		droppedItemsMap.set(territory.id, item);
		if (!unitId) return;
		if (territory.managerId === unitId) return console.log('Same unit', item);

		if (territory.ownerId === player?.id) assignUnitToTerritory(unitId, territory.id);
		else startCapturingTerritory(unitId, territory.id);
	}
	function handleRemove(unitId: string) {
		if (!territory?.id) return;
		removeUnitFromTerritory(unitId, territory.id);
		droppedItemsMap.delete(territory.id);
	}
	const handleClear = () => {
		droppedUnit = null;
	};
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
				<span class="text-lg font-bold">Manage</span>
				<AssignUnit
					id="territory{territory.id}"
					onDrop={handleDrop}
					onClear={handleClear}
					accepts={['member']}
					assignedUnit={managerUnit}
					droppedUnit={droppedItem?.data}
					{confirmed}
					onRemove={handleRemove}
				/>
			{:else}
				<span class="text-lg font-bold">Capture</span>
				<div>
					<span>Capture progress: </span>
					<span>{territory.captureProgress}</span>
				</div>
				<AssignUnit
					id="territory{territory.id}"
					onDrop={handleDrop}
					onClear={handleClear}
					accepts={['member']}
					assignedUnit={capturerUnit}
					droppedUnit={droppedItem?.data}
					confirmed={capturerConfirmed}
					disableRemove
				/>
			{/if}
		{:else}
			<h4 class="text-lg">Select a territory</h4>
		{/if}
	</div>
</div>
