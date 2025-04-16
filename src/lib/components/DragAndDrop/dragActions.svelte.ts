import type { DraggableItem, DropResult } from './DragAndDropTypes';
import type { DragStore } from './DragStore.svelte';

// Custom event name
export const DROP_EVENT_NAME = 'dragdrop:dropped';

// Create and dispatch a drop event
export function dispatchDropEvent(detail: DropResult) {
	const event = new CustomEvent(DROP_EVENT_NAME, {
		bubbles: true,
		detail
	});
	document.dispatchEvent(event);
}

// Setup draggable behavior on an element
export function setupDraggable(
	element: HTMLElement,
	item: DraggableItem,
	zoneId: string,
	dragStore: DragStore,
	disabled = false
) {
	if (!element) return { destroy: () => {} };

	// Create style for disabling selection during drag
	const noSelectStyle = document.createElement('style');
	noSelectStyle.textContent = `
    body.dragging * {
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      cursor: grabbing !important;
    }
  `;

	const onPointerDown = (e: PointerEvent) => {
		if (disabled) return;

		// Prevent text selection during drag
		e.preventDefault();
		e.stopPropagation();

		// Add the no-select style to the document head
		document.head.appendChild(noSelectStyle);
		document.body.classList.add('dragging');

		const rect = element.getBoundingClientRect();
		const offsetX = e.clientX - rect.left;
		const offsetY = e.clientY - rect.top;

		// Create a drag overlay element with more prominence
		const overlay = document.createElement('div');
		overlay.className = 'fixed top-0 left-0 pointer-events-none z-50 shadow-lg rounded ';
		overlay.innerHTML = element.innerHTML;
		overlay.style.width = `${rect.width}px`;
		overlay.style.height = `${rect.height}px`;

		// Position the overlay at the cursor immediately
		overlay.style.transform = `translate(${e.clientX - offsetX}px, ${e.clientY - offsetY}px)`;
		// overlay.style.background = 'white';
		overlay.style.border = '1px solid #3b82f6';

		// Add visual indication this is being dragged
		overlay.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.3)';
		document.body.appendChild(overlay);

		// Start the drag operation
		dragStore.startDrag(item, zoneId);

		const onPointerMove = (e: PointerEvent) => {
			console.log('pointer move', overlay);
			// Prevent any text selection that might occur during drag
			e.preventDefault();
			e.stopPropagation();

			// Move the overlay to follow the cursor
			overlay.style.transform = `translate(${e.clientX - offsetX}px, ${e.clientY - offsetY}px)`;
		};

		const onPointerUp = (e: PointerEvent) => {
			// Clean up
			document.body.removeChild(overlay);
			document.head.removeChild(noSelectStyle);
			document.body.classList.remove('dragging');
			document.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('pointerup', onPointerUp);

			// Find the drop zone under the pointer
			const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
			let dropZoneId = null;

			// Check if we're over a valid drop zone
			for (const [id, element] of dragStore.getDropZones()) {
				if (element.contains(dropTarget)) {
					dropZoneId = id;
					break;
				}
			}

			if (dropZoneId) {
				// Dispatch the drop event
				dispatchDropEvent({
					item: item,
					sourceZoneId: zoneId,
					targetZoneId: dropZoneId,
					position: { x: e.clientX, y: e.clientY }
				});
			}

			dragStore.endDrag();
		};

		document.addEventListener('pointermove', onPointerMove, { passive: false });
		document.addEventListener('pointerup', onPointerUp);
	};

	element.addEventListener('pointerdown', onPointerDown);

	return {
		destroy: () => {
			element.removeEventListener('pointerdown', onPointerDown);
		}
	};
}

// Setup drop zone behavior
export function setupDropZone(
	element: HTMLElement,
	id: string,
	dragStore: DragStore,
	onDrop?: (result: DropResult) => void
) {
	if (!element) return { destroy: () => {} };

	const registration = dragStore.registerDropZone(id, element);

	// Handle the drop event
	const handleDropEvent = (e: CustomEvent<DropResult>) => {
		if (e.detail.targetZoneId === id && onDrop) {
			onDrop(e.detail);
		}
	};

	document.addEventListener(DROP_EVENT_NAME, handleDropEvent as EventListener);

	return {
		destroy: () => {
			registration.unregister();
			document.removeEventListener(DROP_EVENT_NAME, handleDropEvent as EventListener);
		}
	};
}
