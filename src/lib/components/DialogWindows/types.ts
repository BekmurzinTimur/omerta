import type { Component } from 'svelte';

export interface WindowPosition {
	x: number;
	y: number;
}

export interface WindowSize {
	width: number;
	height: number;
}

export interface WindowContentComponent {
	component: Component<any>; // Svelte component type
	props: Record<string, any>;
}

export type WindowContent = string | WindowContentComponent;

export interface WindowConfig {
	id: string;
	title: string;
	content: WindowContent;
	position: WindowPosition;
	size: WindowSize;
	zIndex?: number;
	isActive?: boolean;
}

export interface WindowState {
	windows: WindowConfig[];
	nextZIndex: number;
}

export interface DragPosition {
	x: number;
	y: number;
}

export interface WindowContext {
	readonly windows: WindowConfig[];
	addWindow(windowConfig: WindowConfig): void;
	removeWindow(windowId: string): void;
	focusWindow(windowId: string): void;
	moveWindow(windowId: string, delta: WindowPosition): void;
}
