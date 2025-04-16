export interface DraggableItem {
	id: string;
	type: string;
	data: any;
}

export interface DropResult {
	item: DraggableItem;
	sourceZoneId: string;
	targetZoneId: string;
	position?: { x: number; y: number };
}

export type DragEndCallback = (result: DropResult) => void;
