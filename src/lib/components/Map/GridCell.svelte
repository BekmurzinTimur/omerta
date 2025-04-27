<script lang="ts">
	import type { ITerritory } from '$lib/models/TerritoryModel';
	import type { IUnit } from '$lib/models/UnitModels';
	import type { Cell } from '$lib/models/MapTypes';
	import GridCellUnit from './GridCellUnit.svelte';
	import { getRegion, getTerritory } from '$lib/services/GameController.svelte';

	let {
		cell,
		selectedCellId,
		cellSize,
		color,
		selectCell,
		unit,
		isBeingCaptured,
		territoryId
	}: {
		cell: Cell;
		cellSize: number;
		selectedCellId: string | null;
		color: string;
		selectCell: (cellId: string) => void;
		unit?: IUnit;
		isBeingCaptured: boolean;
		territoryId: string;
	} = $props();

	let territory = $derived(getTerritory(territoryId));
	let region = $derived(getRegion(territory!.regionId));
	// Direct reactive property check instead of derived
	let isSelected = $derived(selectedCellId === cell.id);
</script>

<div
	class="absolute cursor-pointer border bg-inherit transition-colors duration-200 select-none"
	class:border-solid={isSelected}
	class:border-2={isSelected}
	class:border-blue-500={isSelected}
	style="
width: {cellSize}px;
height: {cellSize}px;
left: {cell.x * cellSize}px;
top: {cell.y * cellSize}px;
"
>
	<div
		class="pointer-events-none absolute top-0 left-0 h-full w-full"
		class:animate-fade-in-out={isBeingCaptured}
		class:opacity-30={!isBeingCaptured}
		style="background-color: {color};"
	></div>
	<div
		class="pointer-events-none absolute top-0 left-0 h-full w-full"
		class:border-t-2={territory?.borders.top}
		class:border-r-2={territory?.borders.right}
		class:border-b-2={territory?.borders.bottom}
		class:border-l-2={territory?.borders.left}
		style="border-color: {region!.color};"
	></div>
	<div
		class="relative z-10 flex h-full w-full flex-col items-center justify-center"
		onclick={() => selectCell(cell.id)}
	>
		{#if unit}
			<GridCellUnit {unit} />
		{/if}
	</div>
</div>

<style>
	@keyframes fadeInOut {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 0.3;
		}
		100% {
			opacity: 0;
		}
	}

	.animate-fade-in-out {
		animation: fadeInOut 2s ease-in-out infinite;
	}
</style>
