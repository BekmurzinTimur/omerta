<script lang="ts">
	//DropZone.svelte
	import { getDragContext } from './DragStore.svelte';
	import { setupDropZone } from './dragActions.svelte';
	import type { DragEndCallback } from './DragAndDropTypes';

	let {
		id,
		accepts = [],
		onDrop,
		disabled
	}: { id: string; accepts?: string[]; onDrop?: DragEndCallback; disabled?: boolean } = $props();

	const dragStore = getDragContext();
	let zoneElement: HTMLElement;

	// Register this drop zone and handle drops
	$effect(() => {
		if (disabled) return;
		const dropZone = setupDropZone(zoneElement, id, dragStore, onDrop);

		return () => {
			dropZone.destroy();
		};
	});

	// Reactive states for visual feedback
	const isActive = $derived(dragStore.isDragging && !disabled);

	const isValidDrop = $derived.by(() => {
		if (disabled) return;
		if (!isActive || !dragStore.currentItem) return false;

		// If no specific types are defined, accept all
		if (accepts.length === 0) return true;

		console.log('check for valid drop', accepts, dragStore.currentItem);
		// Check if the dragged item type is in the accepted types
		return accepts.includes(dragStore.currentItem.type);
	});
</script>

<div
	bind:this={zoneElement}
	class="drop-zone w-fit rounded-lg border-2 p-1 transition-all duration-200 {isValidDrop
		? 'bg-blue-50 '
		: ''}"
	class:border-dashed={isActive}
	class:border-gray-300={isActive && !isValidDrop}
>
	<slot />
</div>
