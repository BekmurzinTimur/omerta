// ActionModels.ts

// Base action interface
export interface Action {
	id: string;
	type: ActionType;
	playerId: string;
	timestamp: number;
	status: ActionStatus;
	validate: (state: any) => { valid: boolean; reason?: string }; // Will be used to check if action is valid
}

// Action types
export enum ActionType {
	// Territory actions
	START_CAPTURE = 'START_CAPTURE',
	CANCEL_CAPTURE = 'CANCEL_CAPTURE',

	// Territories
	ASSIGN_TO_TERRITORY = 'ASSIGN_TO_TERRITORY',
	REMOVE_FROM_TERRITORY = 'REMOVE_FROM_TERRITORY',

	// Unit actions
	HIRE_UNIT = 'HIRE_UNIT',
	PROMOTE_UNIT = 'PROMOTE_UNIT',
	LAUNCH_MISSION = 'LAUNCH_MISSION',
	ASSIGN_TO_CREW = 'ASSIGN_TO_CREW',

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
	GENERATE_MISSIONS = 'GENERATE_MISSIONS',
	INCREASE_CAPTURE_PROGRESS = 'INCREASE_CAPTURE_PROGRESS',
	MAINTENANCE_COST = 'MAINTENANCE_COST',
	AI_DECISION = 'AI_DECISION',
	MISSION_COMPLETE = 'MISSION_COMPLETE',
	TIP_EXPIRED = 'TIP_EXPIRED',
	CALC_HEAT = 'CALC_HEAT',
	CALC_LOYALITY = 'CALC_LOYALITY'
}

// Specific action implementation examples

// Territory capture action
export interface StartCaptureAction extends Action {
	type: ActionType.START_CAPTURE;
	territoryId: string;
	unitId: string;
}

// Hire unit action
export interface HireUnitAction extends Action {
	type: ActionType.HIRE_UNIT;
	unitId: string;
}

// Promote unit action
export interface PromoteUnitAction extends Action {
	type: ActionType.PROMOTE_UNIT;
	unitId: string;
}

// Assign to territory unit action
export interface AssignToTerritory extends Action {
	type: ActionType.ASSIGN_TO_TERRITORY;
	unitId: string;
	territoryId: string;
}

// Remove‑from‑territory unit action
export interface RemoveFromTerritoryAction extends Action {
	type: ActionType.REMOVE_FROM_TERRITORY;
	unitId: string;
	territoryId: string;
}

export interface LaunchMissionAction extends Action {
	type: ActionType.LAUNCH_MISSION;
	missionId: string;
	unitIds: string[]; // 1–4 units
}

export interface AssignToCrewAction extends Action {
	type: ActionType.ASSIGN_TO_CREW;
	captainId: string;
	unitId: string;
	index: number;
}
