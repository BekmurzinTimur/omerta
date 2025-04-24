// ActionManager.svelte.ts
import { v4 as uuidv4 } from 'uuid';
import {
	type Action,
	ActionStatus,
	ActionType,
	type StartCaptureAction,
	type HireUnitAction,
	ScheduledActionType
} from '../models/ActionModels';
import { type GameState } from '../models/GameModels';
import gameState from './GameState.svelte';
import type {
	AssignToTerritory,
	LaunchMissionAction,
	RemoveFromTerritoryAction
} from '../models/ActionModels';
import { UnitStatus, UnitRank } from '$lib/models/UnitModels';
import { MissionStatus, type IMission } from '$lib/models/MissionModels';
import { addScheduledAction } from './ScheduledActionManager.svelte';
import { checkMissionSuccess, getTeamStats } from '$lib/utils/common';
import { getAllUnitsMap } from './GameController.svelte';
import { isNeighboringPlayerTerritory } from '$lib/utils/mapUtils';

// Queue of actions waiting to be processed
let actionQueue = $state<Action[]>([]);

// History of processed actions
let actionHistory = $state<Action[]>([]);

// ═══════════════════════════════════════════════════════════════════
// VALIDATION UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

// Validation for StartCaptureAction
const validateStartCapture = (
	state: GameState,
	playerId: string,
	unitId: string,
	territoryId: string
): { valid: boolean; reason?: string } => {
	const territory = state.territories.get(territoryId);
	const player = state.players.get(playerId);
	const unit = state.units.get(unitId);

	if (!territory) return { valid: false, reason: `Territory ${territoryId} not found` };
	if (!player) return { valid: false, reason: `Player ${playerId} not found` };
	if (!unit) return { valid: false, reason: `Unit ${unitId} not found` };
	if (unit.ownerId !== playerId)
		return { valid: false, reason: `Unit ${unitId} does not belong to player ${playerId}` };
	if (unit.rank === UnitRank.ASSOCIATE)
		return { valid: false, reason: 'Associates cannot capture territories' };
	if (territory.ownerId === playerId)
		return { valid: false, reason: 'You already own this territory' };
	if (territory.isBeingCaptured)
		return { valid: false, reason: 'Territory is already under siege' };
	if (!isNeighboringPlayerTerritory(territory, gameState.state.territories, player.id))
		return { valid: false, reason: 'Territory is not neighbouring any players territory' };

	return { valid: true };
};

// Validation for HireUnitAction
const validateHireUnit = (
	state: GameState,
	playerId: string,
	unitId: string
): { valid: boolean; reason?: string } => {
	const player = state.players.get(playerId);
	if (!player) return { valid: false, reason: `Player ${playerId} not found` };

	const unit = state.units.get(unitId);
	if (!unit) return { valid: false, reason: `Unit ${unitId} not found` };
	if (unit.ownerId !== undefined)
		return { valid: false, reason: `Unit ${unitId} is already owned` };
	if (unit.rank !== UnitRank.ASSOCIATE)
		return { valid: false, reason: `Unit ${unitId} is not Associate` };

	return { valid: true };
};

// Validation for AssignToTerritoryAction
const validateAssignToTerritory = (
	state: GameState,
	playerId: string,
	unitId: string,
	territoryId: string
): { valid: boolean; reason?: string } => {
	const player = state.players.get(playerId);
	if (!player) return { valid: false, reason: `Player ${playerId} not found` };

	const unit = state.units.get(unitId);
	if (!unit) return { valid: false, reason: `Unit ${unitId} not found` };
	if (unit.ownerId !== playerId)
		return { valid: false, reason: `Unit ${unitId} does not belong to player ${playerId}` };
	if (unit.rank === UnitRank.ASSOCIATE)
		return { valid: false, reason: `Unit ${unitId} is only an Associate and cannot be assigned` };

	const territory = state.territories.get(territoryId);
	if (!territory) return { valid: false, reason: `Territory ${territoryId} not found` };
	if (territory.ownerId !== playerId)
		return { valid: false, reason: `Territory ${territoryId} is not owned by player ${playerId}` };
	if (unit.id === territory.managerId)
		return { valid: false, reason: `Unit already manages this territory` };

	return { valid: true };
};

// Validation for RemoveFromTerritoryAction
const validateRemoveFromTerritory = (
	state: GameState,
	playerId: string,
	unitId: string,
	territoryId: string
): { valid: boolean; reason?: string } => {
	const player = state.players.get(playerId);
	if (!player) return { valid: false, reason: `Player ${playerId} not found` };

	const unit = state.units.get(unitId);
	if (!unit) return { valid: false, reason: `Unit ${unitId} not found` };
	if (unit.ownerId !== playerId)
		return { valid: false, reason: `Unit ${unitId} does not belong to player ${playerId}` };

	const territory = state.territories.get(territoryId);
	if (!territory) return { valid: false, reason: `Territory ${territoryId} not found` };
	if (territory.ownerId !== playerId)
		return { valid: false, reason: `Territory ${territoryId} is not owned by player ${playerId}` };
	if (territory.managerId !== unitId)
		return { valid: false, reason: `Unit ${unitId} is not managing territory ${territoryId}` };

	return { valid: true };
};

// Validation for LaunchMissionAction
const validateLaunchMission = (
	state: GameState,
	playerId: string,
	missionId: string,
	unitIds: string[]
): { valid: boolean; reason?: string } => {
	const mission = state.missions.get(missionId);

	if (!mission) return { valid: false, reason: 'Mission not found' };
	if (mission.playerId !== playerId) return { valid: false, reason: 'Not your mission' };
	if (mission.status !== MissionStatus.AVAILABLE)
		return { valid: false, reason: 'Mission already taken' };
	const player = state.players.get(playerId);
	if (!player) {
		return { valid: false, reason: `Player ${playerId} not found` };
	}
	if (unitIds.length === 0 || unitIds.length > 4) {
		return { valid: false, reason: `Mission requires between 1-4 units, got ${unitIds.length}` };
	}

	for (const uid of unitIds) {
		const unit = state.units.get(uid);
		if (!unit) {
			return { valid: false, reason: `Unit ${uid} not found` };
		}
		if (unit.ownerId !== playerId && unit.rank !== UnitRank.ASSOCIATE) {
			return { valid: false, reason: `Unit ${uid} does not belong to player ${playerId}` };
		}
		if (unit.status !== UnitStatus.IDLE) {
			return { valid: false, reason: `Unit ${uid} is not idle (status: ${unit.status})` };
		}
	}

	return { valid: true };
};

// ═══════════════════════════════════════════════════════════════════
// QUEUE MANAGEMENT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

// Get all pending actions
const getPendingActions = (): Action[] => {
	return actionQueue.filter((action) => action.status === ActionStatus.PENDING);
};

// Get action history for a specific player
const getPlayerActionHistory = (playerId: string): Action[] => {
	return actionHistory.filter((action) => action.playerId === playerId);
};

// Add an action to the queue
const queueAction = (action: Action): void => {
	// Apply default properties
	const enrichedAction = {
		...action,
		id: action.id || uuidv4(),
		timestamp: action.timestamp || Date.now(),
		status: ActionStatus.PENDING
	};

	const validation = action.validate(gameState.state);
	// Validate action before adding to queue
	if (validation.valid) {
		actionQueue.push(enrichedAction);
		console.log(`Action queued: ${action.type} by player ${action.playerId}`);
	} else {
		console.log(`Action validation failed: ${action.type} by player ${action.playerId}`);
		console.log(validation.reason);
		// Add to history as failed
		actionHistory.push({
			...enrichedAction,
			status: ActionStatus.FAILED
		});
	}
};

// Process all pending actions
const processActions = (): void => {
	const pendingActions = getPendingActions();

	console.log(`Processing ${pendingActions.length} pending actions`);

	// Mark actions as processing
	pendingActions.forEach((action) => {
		action.status = ActionStatus.PROCESSING;
	});

	// Process each action by type
	pendingActions.forEach((action) => {
		try {
			switch (action.type) {
				case ActionType.START_CAPTURE:
					processStartCaptureAction(action as StartCaptureAction);
					break;
				case ActionType.HIRE_UNIT:
					processHireUnitAction(action as HireUnitAction);
					break;
				case ActionType.ASSIGN_TO_TERRITORY:
					processAssignToTerritoryAction(action as AssignToTerritory);
					break;
				case ActionType.REMOVE_FROM_TERRITORY:
					processRemoveFromTerritoryAction(action as RemoveFromTerritoryAction);
					break;
				case ActionType.LAUNCH_MISSION:
					processLaunchMissionAction(action as LaunchMissionAction);
					break;
				// Add more cases as needed
				default:
					console.warn(`Unknown action type: ${action.type}`);
					action.status = ActionStatus.FAILED;
					break;
			}
		} catch (error) {
			console.error(`Error processing action ${action.id}:`, error);
			action.status = ActionStatus.FAILED;
		}
	});

	// Move processed actions to history and remove from queue
	pendingActions.forEach((action) => {
		if (action.status === ActionStatus.PROCESSING) {
			action.status = ActionStatus.COMPLETED;
		}

		actionHistory.push(action);
		actionQueue = actionQueue.filter((a) => a.id !== action.id);
	});
};

// ═══════════════════════════════════════════════════════════════════
// ACTION PROCESSING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

// Process a StartCaptureAction
const processStartCaptureAction = (action: StartCaptureAction): void => {
	const { territoryId, playerId, unitId } = action;

	// Validate again with current state
	const validationResult = validateStartCapture(gameState.state, playerId, unitId, territoryId);
	if (!validationResult.valid) {
		throw new Error(validationResult.reason || 'Validation failed');
	}

	const unit = gameState.state.units.get(unitId)!;

	// Mark territory and unit
	gameState.updateTerritory(territoryId, {
		isBeingCaptured: true,
		captureProgress: 0,
		captureInitiator: playerId,
		capturingUnitId: unitId
	});

	gameState.state.units.set(unitId, { ...unit, status: UnitStatus.EXPAND });

	console.log(
		`Player ${playerId} started capturing territory ${territoryId} with unit ${unit.name}`
	);
};

// Process a HireUnitAction
const processHireUnitAction = (action: HireUnitAction): void => {
	const { playerId, unitId } = action;

	// Validate again with current state
	const validationResult = validateHireUnit(gameState.state, playerId, unitId);
	if (!validationResult.valid) {
		throw new Error(validationResult.reason || 'Validation failed');
	}

	const player = gameState.state.players.get(playerId)!;
	const unit = gameState.state.units.get(unitId)!;

	// unit.rank = UnitRank.SOLDIER;
	gameState.updateUnit(unitId, { rank: UnitRank.SOLDIER });

	// Add unit to player's units
	const updatedUnits = [...player.units, unit.id];
	gameState.updatePlayer(playerId, { units: updatedUnits });

	console.log(`Player ${playerId} hired ${unit.name} unit`);
};

const processAssignToTerritoryAction = (action: AssignToTerritory): void => {
	const { playerId, unitId, territoryId } = action;

	// Validate again with current state
	const validationResult = validateAssignToTerritory(
		gameState.state,
		playerId,
		unitId,
		territoryId
	);
	if (!validationResult.valid) {
		throw new Error(validationResult.reason || 'Validation failed');
	}

	const territory = gameState.state.territories.get(territoryId)!;
	const unit = gameState.state.units.get(unitId)!;
	const previousManager = gameState.state.units.get(territory.managerId || '');

	// ── Apply state changes ────────────────────────────────────
	const updatedUnit = { ...unit, status: UnitStatus.TERRITORY };
	gameState.state.units.set(unitId, updatedUnit);
	if (previousManager) {
		gameState.updateUnit(previousManager.id, { status: UnitStatus.IDLE });
	}

	gameState.updateTerritory(territoryId, { managerId: unitId });

	console.log(`Player ${playerId} assigned ${unit.name} to oversee territory ${territory.name}`);
};

const processRemoveFromTerritoryAction = (action: RemoveFromTerritoryAction): void => {
	const { playerId, unitId, territoryId } = action;

	// Validate again with current state
	const validationResult = validateRemoveFromTerritory(
		gameState.state,
		playerId,
		unitId,
		territoryId
	);
	if (!validationResult.valid) {
		throw new Error(validationResult.reason || 'Validation failed');
	}

	const territory = gameState.state.territories.get(territoryId)!;
	const unit = gameState.state.units.get(unitId)!;

	// ── Apply state changes ────────────────────────────────────
	const updatedUnit = { ...unit, status: UnitStatus.IDLE };
	gameState.state.units.set(unitId, updatedUnit);

	gameState.updateTerritory(territoryId, { managerId: null });

	console.log(`Player ${playerId} removed ${unit.name} from territory ${territory.name}`);
};

const processLaunchMissionAction = (action: LaunchMissionAction): void => {
	const { playerId, missionId, unitIds } = action;

	const validationResult = validateLaunchMission(gameState.state, playerId, missionId, unitIds);
	if (!validationResult.valid) {
		throw new Error(validationResult.reason || 'Validation failed');
	}

	const mission = gameState.state.missions.get(missionId)!;

	// Mark units as on‑mission
	unitIds.forEach((uid) => {
		const unit = gameState.state.units.get(uid)!;
		gameState.state.units.set(uid, { ...unit, status: UnitStatus.MISSION });
	});

	const endTick = gameState.state.tickCount + mission.info.durationTicks;

	gameState.updateMission(missionId, {
		unitIds,
		startTick: gameState.state.tickCount,
		endTick: endTick,
		status: MissionStatus.ACTIVE
	});

	// Schedule mission resolution
	addScheduledAction({
		id: `mission-${mission.id}`,
		type: ScheduledActionType.MISSION_COMPLETE,
		interval: mission.info.durationTicks,
		nextExecutionTick: endTick,
		isRecurring: false,
		execute: (state) => resolveMission(state, playerId, mission)
	});

	console.log(
		`Player ${playerId} launched mission ${mission.info.name} with ${unitIds.length} unit(s)`
	);
};

const resolveMission = (state: GameState, playerId: string, activeMission: IMission) => {
	const { info, unitIds } = activeMission;
	const player = state.players.get(playerId);
	if (!info || !player) return;
	const allUnits = getAllUnitsMap();

	const units = unitIds.map((unitId) => allUnits.get(unitId));
	const teamStats = getTeamStats(units);
	const success = checkMissionSuccess(info.difficulty, teamStats);

	// 2. Apply money to player
	if (success) {
		// calculate total cut %
		const totalCutPct =
			unitIds.reduce((acc, uid) => acc + (state.units.get(uid)?.cut ?? 0), 0) / 100;
		const netReward = Math.round(info.reward * (1 - totalCutPct));
		console.log({ totalCutPct, netReward });

		gameState.updatePlayer(playerId, {
			resources: {
				...player.resources,
				money: player.resources.money + netReward
			}
		});
	}

	// 3. Update each unit
	unitIds.forEach((uid) => {
		const unit = state.units.get(uid);
		if (!unit) return;

		const loyaltyDelta = success ? +1 : -1;
		gameState.updateUnit(unit.id, {
			status: UnitStatus.IDLE,
			loyalty: unit.loyalty + loyaltyDelta,
			heat: unit.heat + 1
		});
	});

	const status = success ? MissionStatus.SUCCEEDED : MissionStatus.FAILED;
	gameState.updateMission(activeMission.id, { status });

	console.log(
		`Mission ${info.name} ${success ? 'succeeded' : 'failed'} ` + `for player ${playerId}`
	);
};

// ═══════════════════════════════════════════════════════════════════
// ACTION CREATOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

// Create a start capture action
const createStartCaptureAction = (
	playerId: string,
	unitId: string,
	territoryId: string
): StartCaptureAction => {
	return {
		id: uuidv4(),
		type: ActionType.START_CAPTURE,
		playerId,
		territoryId,
		unitId,
		timestamp: Date.now(),
		status: ActionStatus.PENDING,
		validate: (state: GameState) => validateStartCapture(state, playerId, unitId, territoryId)
	};
};

// Create a hire unit action
const createHireUnitAction = (playerId: string, unitId: string): HireUnitAction => {
	return {
		id: uuidv4(),
		type: ActionType.HIRE_UNIT,
		playerId,
		unitId,
		timestamp: Date.now(),
		status: ActionStatus.PENDING,
		validate: (state: GameState) => validateHireUnit(state, playerId, unitId)
	};
};

const createAssignToTerritoryAction = (
	playerId: string,
	unitId: string,
	territoryId: string
): AssignToTerritory => {
	return {
		id: uuidv4(),
		type: ActionType.ASSIGN_TO_TERRITORY,
		playerId,
		unitId,
		territoryId,
		timestamp: Date.now(),
		status: ActionStatus.PENDING,
		validate: (state: GameState) => validateAssignToTerritory(state, playerId, unitId, territoryId)
	};
};

const createRemoveFromTerritoryAction = (
	playerId: string,
	unitId: string,
	territoryId: string
): RemoveFromTerritoryAction => {
	return {
		id: uuidv4(),
		type: ActionType.REMOVE_FROM_TERRITORY,
		playerId,
		unitId,
		territoryId,
		timestamp: Date.now(),
		status: ActionStatus.PENDING,
		validate: (state: GameState) =>
			validateRemoveFromTerritory(state, playerId, unitId, territoryId)
	};
};

const createLaunchMissionAction = (
	playerId: string,
	missionId: string,
	unitIds: string[]
): LaunchMissionAction => {
	return {
		id: uuidv4(),
		type: ActionType.LAUNCH_MISSION,
		playerId,
		missionId,
		unitIds,
		timestamp: Date.now(),
		status: ActionStatus.PENDING,
		validate: (state: GameState) => validateLaunchMission(state, playerId, missionId, unitIds)
	};
};

// Export the action manager functions
export {
	queueAction,
	processActions,
	getPendingActions,
	getPlayerActionHistory,
	createStartCaptureAction,
	createHireUnitAction,
	createAssignToTerritoryAction,
	createRemoveFromTerritoryAction,
	createLaunchMissionAction
};
