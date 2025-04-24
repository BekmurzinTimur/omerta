<script lang="ts">
	import type { IUnit } from '$lib/models/UnitModels';
	import { freeUnit, getDropZonesMap, useUnit } from '$lib/services/UiState.svelte';
	import type { DropResult } from '../DragAndDrop/DragAndDropTypes';
	import DropZone from '../DragAndDrop/DropZone.svelte';
	import UnitDrop from './UnitDrop.svelte';

	let {
		id,
		onDrop,
		onClear,
		droppedUnit,
		assignedUnit,
		confirmed,
		onRemove,
		accepts,
		disableRemove,
		disabled
	}: {
		id: string;
		onDrop: (result: DropResult) => void;
		onClear: () => void;
		accepts: string[];
		droppedUnit?: IUnit;
		assignedUnit?: IUnit;
		confirmed: boolean;
		onRemove?: (unitId: string) => void;
		disableRemove?: boolean;
		disabled?: boolean;
	} = $props();

	let dropZonesMap = $derived(getDropZonesMap());
	let lastUsedUnit = $state<string>('');

	const handleDrop = (result: DropResult) => {
		onDrop(result);
		const unitId = (result.item.data as IUnit).id;
		useUnit(unitId, id);
		if (unitId !== lastUsedUnit) console.log('freeing unit', lastUsedUnit);
		freeUnit(lastUsedUnit);
		lastUsedUnit = unitId;
	};
	// $effect(() => {
	// 	let droppedUnit = usedUnitsMap.get(id);
	// 	console.log(usedUnitsMap);
	// 	if (typeof droppedUnit === 'undefined') {
	// 		console.log('clearing', id);
	// 		onClear();
	// 	}
	// });
	let unit = $derived(droppedUnit || assignedUnit);
</script>

<DropZone {id} onDrop={handleDrop} {accepts} {disabled}>
	<UnitDrop {unit} {confirmed} {onRemove} {disableRemove} />
</DropZone>
