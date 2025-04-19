<script lang="ts">
	import type { IUnit } from '$lib/models/UnitModels';
	import type { DropResult } from '../DragAndDrop/DragAndDropTypes';
	import DropZone from '../DragAndDrop/DropZone.svelte';
	import UnitDrop from './UnitDrop.svelte';

	let {
		id,
		onDrop,
		assignedUnit,
		confirmed,
		onRemove,
		accepts,
		disableRemove
	}: {
		id: string;
		onDrop: (result: DropResult) => void;
		accepts: string[];
		assignedUnit?: IUnit;
		confirmed: boolean;
		onRemove?: (unitId: string) => void;
		disableRemove?: boolean;
	} = $props();
</script>

<DropZone {id} {onDrop} {accepts}>
	<UnitDrop unit={assignedUnit} {confirmed} {onRemove} {disableRemove} />
</DropZone>
