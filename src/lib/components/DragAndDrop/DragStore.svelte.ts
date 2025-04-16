import { getContext, setContext } from 'svelte';
import type { DraggableItem } from './DragAndDropTypes';

export const DRAG_CONTEXT_KEY = 'drag-drop-context';

export function createDragStore() {
	// Private internal state
	const state = $state({
		isDragging: false,
		currentItem: null as DraggableItem | null,
		sourceZoneId: ''
	});

	// Map of registered drop zones
	const dropZones = $state(new Map<string, HTMLElement>());
	let dropZonesEntries = $derived([...dropZones.entries()]);
	// Register a new drop zone
	function registerDropZone(id: string, element: HTMLElement) {
		dropZones.set(id, element);
		return {
			unregister: () => {
				dropZones.delete(id);
			}
		};
	}

	// Start a drag operation
	function startDrag(item: DraggableItem, sourceId: string) {
		state.isDragging = true;
		state.currentItem = item;
		state.sourceZoneId = sourceId;
	}

	// End a drag operation
	function endDrag() {
		state.isDragging = false;
		state.currentItem = null;
		state.sourceZoneId = '';
	}

	// Public API
	return {
		get isDragging() {
			return state.isDragging;
		},
		get currentItem() {
			return state.currentItem;
		},
		get sourceZoneId() {
			return state.sourceZoneId;
		},
		registerDropZone,
		startDrag,
		endDrag,
		getDropZones: () => dropZonesEntries
	};
}

export type DragStore = ReturnType<typeof createDragStore>;

export function setDragContext() {
	const store = createDragStore();
	return setContext(DRAG_CONTEXT_KEY, store);
}

export function getDragContext() {
	return getContext<DragStore>(DRAG_CONTEXT_KEY);
}
