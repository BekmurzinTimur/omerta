import type { ITerritory } from './TerritoryModel';
import type { IUnit } from './UnitModels';

// Define types for our data structures
export interface Position {
	x: number;
	y: number;
}

export interface GridSize {
	width: number;
	height: number;
}

export interface Cell {
	id: string;
	x: number;
	y: number;
	territory: ITerritory;
	unit?: IUnit;
}
