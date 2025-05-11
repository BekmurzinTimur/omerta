<script lang="ts">
	import { getDragContext } from './DragStore.svelte';
	import { setupDraggable } from './dragActions.svelte';
	import type { DraggableItem } from './DragAndDropTypes';

	let {
		item,
		zoneId,
		disabled = false
	}: { item: DraggableItem; zoneId: string; disabled?: boolean } = $props();

	const dragStore = getDragContext();
	let dragElement: HTMLElement;

	$effect(() => {
		if (!dragElement) return;

		const draggable = setupDraggable(dragElement, item, zoneId, dragStore, disabled);

		return () => {
			draggable.destroy();
		};
	});

	const isDraggingThis = $derived(dragStore.isDragging && dragStore.currentItem?.id === item.id);
</script>

<div
	bind:this={dragElement}
	class="pointer-events-auto cursor-grab select-none active:cursor-grabbing {isDraggingThis
		? 'opacity-50'
		: ''} {disabled ? 'cursor-not-allowed opacity-50' : ''}"
	class:shadow-lg={!disabled}
	class:transition-all={!disabled}
>
	<slot />
</div>
