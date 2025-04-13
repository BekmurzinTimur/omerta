import type { WindowConfig, WindowPosition } from './types';

// Define state with runes
let windows: WindowConfig[] = $state([]);
let nextZIndex = $state(100);

const addWindow = (windowConfig: WindowConfig) => {
	const isActive = windows.length === 0;
	const newWindow = {
		...windowConfig,
		zIndex: isActive ? nextZIndex : nextZIndex - 10,
		isActive
	};

	// Mark other windows as inactive if this one is active
	const updatedWindows = windows.map((w) => ({
		...w,
		isActive: false
	}));

	windows = [...updatedWindows, newWindow];
	if (isActive) {
		nextZIndex = nextZIndex + 10;
	}
};

const removeWindow = (windowId: string) => {
	const windowToRemove = windows.find((w) => w.id === windowId);
	const filteredWindows = windows.filter((w) => w.id !== windowId);

	// If we removed the active window, make the top window active
	if (windowToRemove?.isActive && filteredWindows.length > 0) {
		// Find the window with the highest z-index
		const highestZWindow = filteredWindows.reduce((prev, current) => {
			if (prev.zIndex === undefined) return current;
			if (current.zIndex === undefined) return prev;
			return prev.zIndex > current.zIndex ? prev : current;
		});

		// Make it active
		const updatedWindows = filteredWindows.map((w) => ({
			...w,
			isActive: w.id === highestZWindow.id
		}));

		windows = updatedWindows;
	} else {
		windows = filteredWindows;
	}
};

const focusWindow = (windowId: string) => {
	// Find the window
	const windowIndex = windows.findIndex((w) => w.id === windowId);
	if (windowIndex === -1) return;

	// Already the active window with highest z-index
	if (windows[windowIndex].isActive) return;

	// Mark all windows as inactive
	const updatedWindows = windows.map((w) => ({
		...w,
		isActive: false
	}));

	// Update the target window
	updatedWindows[windowIndex] = {
		...updatedWindows[windowIndex],
		isActive: true,
		zIndex: nextZIndex
	};

	windows = updatedWindows;
	nextZIndex = nextZIndex + 10;
};

const moveWindow = (windowId: string, delta: WindowPosition) => {
	const windowIndex = windows.findIndex((w) => w.id === windowId);
	if (windowIndex === -1) return;

	const updatedWindows = [...windows];
	const window = updatedWindows[windowIndex];

	updatedWindows[windowIndex] = {
		...window,
		position: {
			x: window.position.x + delta.x,
			y: window.position.y + delta.y
		}
	};

	windows = updatedWindows;
};

const getWindows = () => {
	return windows;
};

export { getWindows, moveWindow, focusWindow, removeWindow, addWindow };
