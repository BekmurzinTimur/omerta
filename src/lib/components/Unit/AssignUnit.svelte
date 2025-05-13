<script lang="ts">
	import type { IUnit } from '$lib/models/UnitModels';
	import { freeUnit, getDropZonesMap, useUnit } from '$lib/services/UiState.svelte';
	import type { DropResult } from '../DragAndDrop/DragAndDropTypes';
	import DropZone from '../DragAndDrop/DropZone.svelte';
	import UnitDrop from './UnitDrop.svelte';

	let {
		id,
		onDrop,
		droppedUnit,
		assignedUnit,
		confirmed,
		onRemove,
		accepts,
		disableRemove,
		disabled,
		label
	}: {
		id: string;
		onDrop: (result: DropResult) => void;
		accepts: string[];
		droppedUnit?: IUnit;
		assignedUnit?: IUnit;
		confirmed: boolean;
		onRemove?: (unitId: string) => void;
		disableRemove?: boolean;
		disabled?: boolean;
		label?: string;
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
	let unit = $derived(droppedUnit || assignedUnit);
</script>

<DropZone {id} onDrop={handleDrop} {accepts} {disabled}>
	<UnitDrop {unit} {confirmed} {onRemove} {disableRemove} {label} />
</DropZone>
