<script lang="ts">
	import type { ITerritory } from '$lib/models/TerritoryModel';
	import type { IUnit } from '$lib/models/UnitModels';
	import { getAllUnits } from '$lib/services/GameController.svelte';
	import type { Cell } from '$lib/models/MapTypes';
	import GridCellUnit from './GridCellUnit.svelte';

	let {
		cell,
		selectedCellId,
		cellSize,
		color,
		selectCell,
		territory,
		unit
	}: {
		cell: Cell;
		cellSize: number;
		selectedCellId: number | null;
		color: string;
		selectCell: (cellId: number) => void;
		territory?: ITerritory;
		unit?: IUnit;
	} = $props();

	$effect(() => {
		console.log({ territory, unit });
	});
</script>

<div
	class="absolute cursor-pointer border bg-inherit transition-colors duration-200 select-none"
	class:border-solid={selectedCellId === cell.id}
	class:border-2={selectedCellId === cell.id}
	class:border-blue-500={selectedCellId === cell.id}
	style="
width: {cellSize}px;
height: {cellSize}px;
left: {cell.x * cellSize}px;
top: {cell.y * cellSize}px;
"
>
	<div
		class={`pointer-events-none absolute top-0 left-0 h-full w-full opacity-30`}
		style="
          background-color: {color};
        "
	></div>
	<div
		class={`relative z-10 flex h-full w-full flex-col items-center justify-center`}
		onclick={() => selectCell(cell.id)}
	>
		{#if unit}
			<GridCellUnit {unit} />
		{/if}
	</div>
</div>
