// Action models and interfaces

// Base action interface
export interface Action {
	id: string;
	type: ActionType;
	playerId: string;
	timestamp: number;
	status: ActionStatus;
	validate: (state: any) => boolean; // Will be used to check if action is valid
}

// Action types
export enum ActionType {
	// Territory actions
	START_CAPTURE = 'START_CAPTURE',
	CANCEL_CAPTURE = 'CANCEL_CAPTURE',

	// Unit actions
	HIRE_UNIT = 'HIRE_UNIT',
	MOVE_UNIT = 'MOVE_UNIT',
	ATTACK = 'ATTACK',

	// Economy actions
	COLLECT_RESOURCES = 'COLLECT_RESOURCES',
	INVEST_IN_TERRITORY = 'INVEST_IN_TERRITORY'
}

// Action status
export enum ActionStatus {
	PENDING = 'PENDING',
	PROCESSING = 'PROCESSING',
	COMPLETED = 'COMPLETED',
	FAILED = 'FAILED'
}

// Scheduled action interface
export interface ScheduledAction {
	id: string;
	type: ScheduledActionType;
	interval: number; // How many ticks between executions
	nextExecutionTick: number;
	execute: (state: any) => void;
	isRecurring: boolean;
}

// Scheduled action types
export enum ScheduledActionType {
	GENERATE_INCOME = 'GENERATE_INCOME',
	INCREASE_CAPTURE_PROGRESS = 'INCREASE_CAPTURE_PROGRESS',
	MAINTENANCE_COST = 'MAINTENANCE_COST',
	AI_DECISION = 'AI_DECISION'
}

// Specific action implementation examples

// Territory capture action
export interface StartCaptureAction extends Action {
	type: ActionType.START_CAPTURE;
	territoryId: string;
}

// Hire unit action
export interface HireUnitAction extends Action {
	type: ActionType.HIRE_UNIT;
	unitType: string;
	position: {
		x: number;
		y: number;
	};
}
