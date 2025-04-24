import { SvelteMap, SvelteSet } from 'svelte/reactivity';
let dropZones = new SvelteMap<string, string>();
let usedUnitsId = new SvelteSet<string>();

export const getUsedUnits = () => {
	return usedUnitsId;
};

export const getDropZonesMap = () => {
	return dropZones;
};

export const useUnit = (unitId: string, zoneId: string) => {
	usedUnitsId.add(unitId);
	dropZones.set(unitId, zoneId);
};

export const freeUnit = (unitId: string) => {
	usedUnitsId.delete(unitId);
};
