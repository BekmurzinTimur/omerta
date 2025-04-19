//ActionManager.svelte.ts
import { v4 as uuidv4 } from 'uuid';
import {
	type Action,
	ActionStatus,
	ActionType,
	type StartCaptureAction,
	type HireUnitAction
} from '../models/ActionModels';
import { type GameState } from '../models/GameModels';
import gameState from './GameState.svelte';
import type { AssignToTerritory, RemoveFromTerritoryAction } from '../models/ActionModels';
import { UnitStatus, UnitRank } from '$lib/models/UnitModels';
// Queue of actions waiting to be processed
let actionQueue = $state<Action[]>([]);

// History of processed actions
let actionHistory = $state<Action[]>([]);

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
	// Validate action before adding to queue
	if (action.validate(gameState.state)) {
		actionQueue.push({
			...action,
			id: action.id || uuidv4(),
			timestamp: action.timestamp || Date.now(),
			status: ActionStatus.PENDING
		});
		console.log(`Action queued: ${action.type} by player ${action.playerId}`);
	} else {
		console.log(`Action validation failed: ${action.type} by player ${action.playerId}`);
		// Add to history as failed
		actionHistory.push({
			...action,
			id: action.id || uuidv4(),
			timestamp: action.timestamp || Date.now(),
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

// Process a StartCaptureAction
const processStartCaptureAction = (action: StartCaptureAction): void => {
	const { territoryId, playerId, unitId } = action;

	const territory = gameState.state.territories.get(territoryId);
	const unit = gameState.state.units.get(unitId);

	if (!territory) throw new Error(`Territory ${territoryId} not found`);
	if (!unit) throw new Error(`Unit ${unitId} not found`);
	if (unit.ownerId !== playerId)
		throw new Error(`Unit ${unitId} does not belong to player ${playerId}`);
	if (unit.rank === UnitRank.ASSOCIATE) throw new Error('Associates cannot capture territories');
	if (territory.ownerId === playerId) throw new Error('You already own this territory');
	if (territory.isBeingCaptured) throw new Error('Territory is already under siege');

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
	const player = gameState.state.players.get(playerId);
	const unit = gameState.state.availableUnits.get(unitId);

	if (!player) {
		throw new Error(`Player ${playerId} not found`);
	}

	if (!unit) {
		throw new Error(`Unit ${unitId} not found`);
	}
	unit.rank = UnitRank.SOLDIER;
	// Add unit to state
	gameState.state.units.set(unit.id, unit);

	// Remove unit from the pull of associates
	gameState.state.availableUnits.delete(unit.id);

	// Add unit to player's units
	const updatedUnits = [...player.units, unit];
	gameState.updatePlayer(playerId, { units: updatedUnits });

	console.log(`Player ${playerId} hired ${unit.name} unit`);
};
const processAssignToTerritoryAction = (action: AssignToTerritory): void => {
	const { playerId, unitId, territoryId } = action;

	const player = gameState.state.players.get(playerId);
	if (!player) throw new Error(`Player ${playerId} not found`);

	const unit = gameState.state.units.get(unitId);
	if (!unit) throw new Error(`Unit ${unitId} not found`);
	if (unit.ownerId !== playerId)
		throw new Error(`Unit ${unitId} does not belong to player ${playerId}`);

	if (unit.rank === UnitRank.ASSOCIATE)
		throw new Error(`Unit ${unitId} is only an Associate and cannot be assigned`);

	const territory = gameState.state.territories.get(territoryId);
	if (!territory) throw new Error(`Territory ${territoryId} not found`);
	if (territory.ownerId !== playerId)
		throw new Error(`Territory ${territoryId} is not owned by player ${playerId}`);

	// ── Apply state changes ────────────────────────────────────
	const updatedUnit = { ...unit, status: UnitStatus.TERRITORY };
	gameState.state.units.set(unitId, updatedUnit);

	gameState.updateTerritory(territoryId, { managerId: unitId });

	console.log(`Player ${playerId} assigned ${unit.name} to oversee territory ${territory.name}`);
};

const processRemoveFromTerritoryAction = (action: RemoveFromTerritoryAction): void => {
	const { playerId, unitId, territoryId } = action;

	const player = gameState.state.players.get(playerId);
	if (!player) throw new Error(`Player ${playerId} not found`);

	const unit = gameState.state.units.get(unitId);
	if (!unit) throw new Error(`Unit ${unitId} not found`);
	if (unit.ownerId !== playerId)
		throw new Error(`Unit ${unitId} does not belong to player ${playerId}`);

	const territory = gameState.state.territories.get(territoryId);
	if (!territory) throw new Error(`Territory ${territoryId} not found`);
	if (territory.ownerId !== playerId)
		throw new Error(`Territory ${territoryId} is not owned by player ${playerId}`);

	if (territory.managerId !== unitId)
		throw new Error(`Unit ${unitId} is not managing territory ${territoryId}`);

	// ── Apply state changes ────────────────────────────────────
	const updatedUnit = { ...unit, status: UnitStatus.IDLE };
	gameState.state.units.set(unitId, updatedUnit);

	gameState.updateTerritory(territoryId, { managerId: null });

	console.log(`Player ${playerId} removed ${unit.name} from territory ${territory.name}`);
};

// Create action creators (factory functions)

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
		validate: (state: GameState) => {
			const territory = state.territories.get(territoryId);
			const player = state.players.get(playerId);
			const unit = state.units.get(unitId);
			console.log({ territory, player, unit, territoryId, unitId, state });
			return !!(
				territory &&
				player &&
				unit &&
				unit.ownerId === playerId &&
				unit.rank !== UnitRank.ASSOCIATE &&
				territory.ownerId !== playerId &&
				!territory.isBeingCaptured
			);
		}
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
		validate: (gameState: GameState) => {
			const player = gameState.players.get(playerId);
			if (!player) return false;

			const unit = gameState.availableUnits.get(unitId);
			return unit?.ownerId === undefined;
		}
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
		validate: (state: GameState) => {
			const player = state.players.get(playerId);
			if (!player) return false;

			const unit = state.units.get(unitId);
			const territory = state.territories.get(territoryId);
			console.log({ unit, territory });

			return (
				unit !== undefined &&
				territory !== undefined &&
				unit.ownerId === playerId &&
				territory.ownerId === playerId &&
				unit.rank !== UnitRank.ASSOCIATE &&
				unit.id !== territory.managerId
			);
		}
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
		validate: (state: GameState) => {
			const player = state.players.get(playerId);
			if (!player) return false;

			const unit = state.units.get(unitId);
			const territory = state.territories.get(territoryId);

			return (
				unit !== undefined &&
				territory !== undefined &&
				unit.ownerId === playerId &&
				territory.ownerId === playerId &&
				territory.managerId === unitId
			);
		}
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
	createRemoveFromTerritoryAction
};
