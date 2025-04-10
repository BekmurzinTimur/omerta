// Game entity models and interfaces

// Player model
export interface Player {
	id: string;
	name: string;
	resources: {
		money: number;
		manpower: number;
	};
	territories: Territory[];
	units: Unit[];
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

// Unit model
export interface Unit {
	id: string;
	type: UnitType;
	ownerId: string;
	position: {
		x: number;
		y: number;
	};
	status: UnitStatus;
	strength: number;
	maintenanceCost: number;
}

export enum UnitType {
	INFANTRY = 'INFANTRY',
	TANK = 'TANK',
	AIRCRAFT = 'AIRCRAFT'
}

export enum UnitStatus {
	IDLE = 'IDLE',
	MOVING = 'MOVING',
	ATTACKING = 'ATTACKING',
	DEFENDING = 'DEFENDING'
}

// Overall game state
export interface GameState {
	players: Map<string, Player>;
	territories: Map<string, Territory>;
	units: Map<string, Unit>;
	currentDate: Date;
	isRunning: boolean;
	tickCount: number;
}
