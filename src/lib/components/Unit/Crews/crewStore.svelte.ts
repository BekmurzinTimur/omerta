import type { DraggableItem } from '$lib/components/DragAndDrop/DragAndDropTypes';
import { SvelteMap } from 'svelte/reactivity';

let droppedItemsMap = new SvelteMap<string, DraggableItem>();

export const getCrewDroppedItems = () => {
	return droppedItemsMap;
};
