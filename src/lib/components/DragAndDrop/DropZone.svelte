<script lang="ts">
	import { getDragContext } from './DragStore.svelte';
	import { setupDropZone } from './dragActions.svelte';
	import type { DragEndCallback } from './DragAndDropTypes';

	let {
		id,
		accepts = [],
		onDrop
	}: { id: string; accepts?: string[]; onDrop?: DragEndCallback } = $props();

	const dragStore = getDragContext();
	let zoneElement: HTMLElement;

	// Register this drop zone and handle drops
	$effect(() => {
		if (!zoneElement) return;

		const dropZone = setupDropZone(zoneElement, id, dragStore, onDrop);

		return () => {
			dropZone.destroy();
		};
	});

	// Reactive states for visual feedback
	const isActive = $derived(dragStore.isDragging);

	const isValidDrop = $derived.by(() => {
		if (!isActive || !dragStore.currentItem) return false;

		// If no specific types are defined, accept all
		if (accepts.length === 0) return true;

		// Check if the dragged item type is in the accepted types
		return accepts.includes(dragStore.currentItem.type);
	});
</script>

<div
	bind:this={zoneElement}
	class="transition-all duration-200 {isValidDrop ? 'bg-blue-50 ring-2 ring-blue-500' : ''}"
	class:min-h-16={isActive}
	class:border-2={isActive}
	class:border-dashed={isActive}
	class:border-gray-300={isActive && !isValidDrop}
>
	<slot />
</div>
