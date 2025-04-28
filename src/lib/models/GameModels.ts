// Game entity models and interfaces

import type { IMission } from './MissionModels';
import type { IRegion, ITerritory } from './TerritoryModel';
import type { IUnit } from './UnitModels';

// Player model
export interface Player {
	id: string;
	name: string;
	resources: {
		money: number;
		heat: number;
		lastIncome: number;
	};
	territories: ITerritory[];
	units: string[];
	color: string;
}

// Overall game state
export interface GameState {
	players: Map<string, Player>;
	territories: Map<string, ITerritory>;
	units: Map<string, IUnit>;
	missions: Map<string, IMission>;
	regions: Map<string, IRegion>;
	currentDate: Date;
	isRunning: boolean;
	tickCount: number;
	hasEnded: boolean;
}
