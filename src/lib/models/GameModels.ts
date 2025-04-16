// Game entity models and interfaces

import type { ITerritory } from './TerritoryModel';
import type { IUnit } from './UnitModels';

// Player model
export interface Player {
	id: string;
	name: string;
	resources: {
		money: number;
		manpower: number;
	};
	territories: ITerritory[];
	units: IUnit[];
	color: string;
}

// Overall game state
export interface GameState {
	players: Map<string, Player>;
	territories: Map<string, ITerritory>;
	units: Map<string, IUnit>;
	availableUnits: Map<string, IUnit>;
	currentDate: Date;
	isRunning: boolean;
	tickCount: number;
}
