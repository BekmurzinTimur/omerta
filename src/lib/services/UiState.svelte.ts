import type { DraggableItem } from '$lib/components/DragAndDrop/DragAndDropTypes';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
let dropZones = new SvelteMap<string, DraggableItem>();
let usedUnitsId = new SvelteSet<string>();

export const getUsedUnits = () => {
	return usedUnitsId;
};

export const getDropZonesMap = () => {
	return dropZones;
};

export const useUnit = (unitId: string) => {
	usedUnitsId.add(unitId);
};

export const freeUnit = (unitId: string) => {
	usedUnitsId.delete(unitId);
};
