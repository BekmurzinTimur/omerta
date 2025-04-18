<script lang="ts">
	import type { Cell } from '$lib/types/MapTypes';

	let {
		cell,
		selectedCellId,
		cellSize,
		color,
		selectCell
	}: {
		cell: Cell;
		cellSize: number;
		selectedCellId: number | null;
		color: string;
		selectCell: (cellId: number) => void;
	} = $props();
</script>

<div
	class={`absolute cursor-pointer border border-gray-300 transition-colors duration-200 `}
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
></div>
