<script lang="ts">
	import type { ITerritory } from '$lib/models/TerritoryModel';
	import { type DraggableItem, type DropResult } from './DragAndDrop/DragAndDropTypes';
	import DropZone from './DragAndDrop/DropZone.svelte';

	let { territory }: { territory?: ITerritory } = $props();

	const droppedItems = $state<DraggableItem[]>([]);

	// Handle drop events
	function handleDrop(result: DropResult) {
		const { item } = result;
		droppedItems.push(item);
		console.log('DROPPED', item);
	}
</script>

<!-- Actions -->
<div class="actions mb-6 rounded-lg bg-gray-700 p-3 text-gray-300">
	<!-- Territory capture section -->
	<div class="action-group mb-4">
		{#if territory}
			<h4 class="text-lg">{territory.name}</h4>
			<div>Owner: {territory.ownerId ? territory.ownerId : 'noone'}</div>
			<div>Income: ${territory.resources.income}</div>
			<DropZone id="target" onDrop={handleDrop} accepts={['unit']}>
				{#if droppedItems.length === 0}
					<p>Drop items here</p>
				{:else}
					<div class="grid grid-cols-3 gap-2">
						{#each droppedItems as item}
							<div class="rounded p-4 bg-{item.data.color}-400">
								{item.id}
							</div>
						{/each}
					</div>
				{/if}
			</DropZone>
		{:else}
			<h4 class="text-lg">Select a territory</h4>
		{/if}
	</div>
</div>
