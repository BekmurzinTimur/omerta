<script lang="ts">
	import type { ITerritory } from '$lib/models/TerritoryModel';
	import type { IUnit } from '$lib/models/UnitModels';
	import { getAllUnits } from '$lib/services/GameController.svelte';
	import type { Cell } from '$lib/models/MapTypes';

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
	class={`absolute cursor-pointer border border-gray-300 transition-colors duration-200 select-none`}
	class:outline-solid={selectedCellId === cell.id}
	class:outline-2={selectedCellId === cell.id}
	class:outline-blue-500={selectedCellId === cell.id}
	style="
          width: {cellSize}px;
          height: {cellSize}px;
          left: {cell.x * cellSize}px;
          top: {cell.y * cellSize}px;
          opacity: 0.7;
          background-color: {color};
        "
	onclick={() => selectCell(cell.id)}
>
	{#if territory}
		{territory.id}
	{/if}
	{#if unit}
		{unit.name}
	{/if}
</div>
