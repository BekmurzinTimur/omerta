<!-- GridMap.svelte - Interactive grid map component with TypeScript -->
<script lang="ts">
	import {
		getAllTerritories,
		getAllUnitsMap,
		getPlayerColor,
		getPlayerTerritories
	} from '$lib/services/GameController.svelte';
	import type { Cell, GridSize, Position } from '$lib/models/MapTypes';
	import { convertCellIdToTerritory, convertTerritoryToCellId } from '$lib/utils/mapUtils';
	import { onMount } from 'svelte';
	import GridCell from './GridCell.svelte';

	// Define props for background image
	const backgroundImageUrl = '/map_background.png';

	// Define grid dimensions
	let gridSize: GridSize = $state({ width: 20, height: 20 });
	let {
		selectedCellId,
		onSelect
	}: { selectedCellId: number | null; onSelect: (cellid: number | null) => void } = $props();
	// Grid position and zoom state
	let position: Position = $state({ x: 0, y: 0 });
	let zoom: number = $state(1);
	let isDragging: boolean = $state(false);
	let dragStart: Position = $state({ x: 0, y: 0 });
	let territories = $derived(getAllTerritories());
	let units = $derived(getAllUnitsMap());

	let playerTerritories = $derived(getPlayerTerritories());
	let playerCells = $derived(
		playerTerritories.map((territory) => convertTerritoryToCellId(territory.id))
	);
	let playerColor = $derived(getPlayerColor());

	// Create a grid of cells (without selected property)
	// let cells: Cell[] = $state(
	// 	Array.from({ length: gridSize.width * gridSize.height }, (_, i) => ({
	// 		id: i,
	// 		x: i % gridSize.width,
	// 		y: Math.floor(i / gridSize.width)
	// 	}))
	// );

	let cells: Cell[] = $derived(
		Array.from(territories, ([id, territory], i) => ({
			id: i,
			x: i % gridSize.width,
			y: Math.floor(i / gridSize.width),
			territory,
			unit: units.get(territory.managerId || '')
		}))
	);

	$effect(() => {
		console.log(units, units.get('unit2'));
	});
	// Calculate cell size based on zoom level
	let cellSize: number = $derived(100 * zoom);

	let containerRef: HTMLDivElement;

	// Handle mouse down to start dragging
	function handleMouseDown(event: MouseEvent): void {
		isDragging = true;
		dragStart = {
			x: event.clientX - position.x,
			y: event.clientY - position.y
		};
	}

	// Handle mouse move to pan the grid
	function handleMouseMove(event: MouseEvent): void {
		if (isDragging) {
			position = {
				x: event.clientX - dragStart.x,
				y: event.clientY - dragStart.y
			};
		}
	}

	// Handle mouse up to stop dragging
	function handleMouseUp(): void {
		isDragging = false;
	}

	// Handle zoom with mouse wheel
	function handleWheel(event: WheelEvent): void {
		event.preventDefault();

		// Calculate zoom factor
		const zoomFactor: number = event.deltaY > 0 ? 0.9 : 1.1;

		// Get mouse position relative to container
		const rect = containerRef.getBoundingClientRect();
		const mouseX: number = event.clientX - rect.left;
		const mouseY: number = event.clientY - rect.top;

		// Calculate offset from mouse position to center
		const offsetX: number = mouseX - position.x;
		const offsetY: number = mouseY - position.y;

		// Apply zoom (with limits)
		const newZoom: number = Math.max(0.5, Math.min(3, zoom * zoomFactor));

		// Adjust position to zoom toward mouse position
		position = {
			x: mouseX - offsetX * (newZoom / zoom),
			y: mouseY - offsetY * (newZoom / zoom)
		};

		zoom = newZoom;
	}

	// Toggle cell selection
	function selectCell(cellId: number): void {
		// If the cell is already selected, deselect it
		if (selectedCellId === cellId) {
			onSelect(null);
		} else {
			onSelect(cellId);
		}
	}

	onMount(() => {
		// Ensure the grid is initially centered when component mounts
		if (containerRef) {
			const rect = containerRef.getBoundingClientRect();
			const totalGridWidth = gridSize.width * cellSize;
			const totalGridHeight = gridSize.height * cellSize;

			// Position the grid so its center aligns with the container's center
			position = {
				x: rect.width / 2 - totalGridWidth / 2,
				y: rect.height / 2 - totalGridHeight / 2
			};
		}
	});
	$effect(() => {
		console.log(playerCells.includes(210), playerColor, playerCells);
	});
</script>

<div
	class="relative h-full w-full overflow-hidden bg-gray-800"
	bind:this={containerRef}
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseUp}
	onwheel={handleWheel}
>
	<div class="absolute" style="transform: translate({position.x}px, {position.y}px);">
		<!-- Background image that covers the entire grid area -->
		<div
			class="pointer-events-none absolute bg-cover bg-center"
			style="
        width: {gridSize.width * cellSize}px;
        height: {gridSize.height * cellSize}px;
        background-image: url('{backgroundImageUrl}');
        background-size: cover;
		
      "
		></div>

		{#each cells as cell (cell.id)}
			<GridCell
				{cell}
				{selectCell}
				{cellSize}
				{selectedCellId}
				territory={cell.territory}
				unit={cell.unit}
				color={playerCells.includes(cell.id) ? `${playerColor};` : 'inherit;'}
			/>
		{/each}
	</div>

	<div class="absolute right-4 bottom-4 flex space-x-2">
		<button
			class="rounded-full bg-white p-2 shadow hover:bg-gray-100 focus:outline-none"
			onclick={() => {
				zoom = Math.min(3, zoom * 1.2);
			}}
			aria-label="Zoom in"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 6v6m0 0v6m0-6h6m-6 0H6"
				/>
			</svg>
		</button>
		<button
			class="rounded-full bg-white p-2 shadow hover:bg-gray-100 focus:outline-none"
			onclick={() => {
				zoom = Math.max(0.5, zoom * 0.8);
			}}
			aria-label="Zoom out"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
			</svg>
		</button>
	</div>
</div>
