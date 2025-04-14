// Game entity models and interfaces

import type { IUnit } from './UnitModels';

// Player model
export interface Player {
	id: string;
	name: string;
	resources: {
		money: number;
		manpower: number;
	};
	territories: Territory[];
	units: IUnit[];
	color: string;
}

// Territory model
export interface Territory {
	id: string;
	name: string;
	ownerId: string | null;
	position: {
		x: number;
		y: number;
	};
	resources: {
		production: number;
		manpower: number;
	};
	isBeingCaptured: boolean;
	captureProgress: number;
	captureInitiator: string | null;
}

// Overall game state
export interface GameState {
	players: Map<string, Player>;
	territories: Map<string, Territory>;
	units: Map<string, IUnit>;
	availableUnits: Map<string, IUnit>;
	currentDate: Date;
	isRunning: boolean;
	tickCount: number;
}
