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
import { UnitRank } from '$lib/models/UnitModels';

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
	const { territoryId, playerId } = action;
	const territory = gameState.state.territories.get(territoryId);

	if (!territory) {
		throw new Error(`Territory ${territoryId} not found`);
	}

	if (territory.ownerId === playerId) {
		throw new Error(`Player ${playerId} already owns territory ${territoryId}`);
	}

	if (territory.isBeingCaptured) {
		throw new Error(`Territory ${territoryId} is already being captured`);
	}

	// Start capture process
	gameState.updateTerritory(territoryId, {
		isBeingCaptured: true,
		captureProgress: 0,
		captureInitiator: playerId
	});

	console.log(`Player ${playerId} started capturing territory ${territoryId}`);
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

// Create action creators (factory functions)

// Create a start capture action
const createStartCaptureAction = (playerId: string, territoryId: string): StartCaptureAction => {
	return {
		id: uuidv4(),
		type: ActionType.START_CAPTURE,
		playerId,
		territoryId,
		timestamp: Date.now(),
		status: ActionStatus.PENDING,
		validate: (gameState) => {
			const territory = gameState.territories.get(territoryId);
			const player = gameState.players.get(playerId);

			return !!(
				territory &&
				player &&
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

// Export the action manager functions
export {
	queueAction,
	processActions,
	getPendingActions,
	getPlayerActionHistory,
	createStartCaptureAction,
	createHireUnitAction
};
