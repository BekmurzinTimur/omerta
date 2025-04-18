<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { WindowPosition, WindowSize } from './types';

	let {
		id,
		title = 'Window',
		position = { x: 0, y: 0 },
		size = { width: 400, height: 300 },
		zIndex = 0,
		isActive = false,
		isDraggable = true,
		onClose,
		onFocus,
		onDragStart,
		onDragMove
	}: {
		id: string;
		title: string;
		position: WindowPosition;
		size: WindowSize;
		zIndex: number;
		isActive: boolean;
		isDraggable?: boolean;
		onClose?: () => void;
		onFocus?: () => void;
		onDragStart?: () => void;
		onDragMove?: (delta: WindowPosition) => void;
	} = $props();

	interface DragState {
		isDragging: boolean;
		startX: number;
		startY: number;
		startWindowX: number;
		startWindowY: number;
	}

	let dragState: DragState = {
		isDragging: false,
		startX: 0,
		startY: 0,
		startWindowX: 0,
		startWindowY: 0
	};

	let windowElement: HTMLDivElement;
	let headerElement: HTMLDivElement;

	// Handle window dragging
	function handleMouseDown(event: MouseEvent): void {
		if (!isDraggable) return;

		if (!headerElement?.contains(event.target as Node)) return;

		// Don't drag when clicking buttons
		if ((event.target as HTMLElement).tagName === 'BUTTON') return;

		dragState.isDragging = true;
		dragState.startX = event.clientX;
		dragState.startY = event.clientY;
		dragState.startWindowX = position.x;
		dragState.startWindowY = position.y;

		// Add a class to the body to disable pointer events during drag
		document.body.style.userSelect = 'none';
		document.body.style.pointerEvents = 'none';

		// Make sure our window still receives events
		windowElement.style.pointerEvents = 'auto';

		onDragStart?.();

		// Prevent text selection during drag
		event.preventDefault();
	}

	function handleMouseMove(event: MouseEvent): void {
		if (!dragState.isDragging) return;

		// Use requestAnimationFrame for smoother updates
		requestAnimationFrame(() => {
			const deltaX = event.clientX - dragState.startX;
			const deltaY = event.clientY - dragState.startY;

			const newX = dragState.startWindowX + deltaX;
			const newY = dragState.startWindowY + deltaY;

			// Calculate new position with boundary constraints
			const screenWidth = window.innerWidth;
			const screenHeight = window.innerHeight;

			// Ensure window stays within viewport bounds (header must remain visible)
			const headerHeight = 40;
			const windowWidth = size.width;

			// Constrain x position (keep at least 100px of window width visible)
			const constrainedX = Math.min(Math.max(newX, -windowWidth + 100), screenWidth - 100);

			// Constrain y position (keep header always visible)
			const constrainedY = Math.min(Math.max(newY, 0), screenHeight - headerHeight);

			onDragMove?.({
				x: constrainedX - position.x,
				y: constrainedY - position.y
			});
		});
	}

	function handleMouseUp(): void {
		if (dragState.isDragging) {
			dragState.isDragging = false;

			// Restore pointer events when drag ends
			document.body.style.userSelect = '';
			document.body.style.pointerEvents = '';
			windowElement.style.pointerEvents = '';
		}
	}

	// Focus window on click
	function handleWindowClick(event: MouseEvent): void {
		if (!isActive) {
			onFocus?.();
		}
	}

	onMount(() => {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	});

	onDestroy(() => {
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	});
</script>

<div
	bind:this={windowElement}
	class="pointer-events-auto absolute flex flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg min-w-[{size.width}px] h-[{size.height}px] z-[{zIndex}] will-change-transform"
	style="transform: translate3d({position.x}px, {position.y}px, 0);"
	onmousedown={handleWindowClick}
>
	<div
		bind:this={headerElement}
		class="flex cursor-move items-center justify-between p-2 text-white select-none"
		class:bg-blue-600={isActive}
		class:bg-gray-500={!isActive}
		onmousedown={handleMouseDown}
		style="touch-action: none;"
	>
		<h3 class="flex-grow truncate font-semibold">{title}</h3>
		<button
			class="ml-2 rounded px-2 transition-colors hover:bg-red-700"
			onclick={onClose}
			type="button"
		>
			×
		</button>
	</div>

	<div class="flex-grow overflow-auto">
		<slot name="content"></slot>
	</div>
</div>
