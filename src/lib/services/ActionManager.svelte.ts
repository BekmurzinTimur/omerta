import { v4 as uuidv4 } from 'uuid';
import {
	type Action,
	ActionStatus,
	ActionType,
	type StartCaptureAction,
	type HireUnitAction
} from '../models/ActionModels';
import { UnitStatus, UnitType } from '../models/GameModels';
import gameState from './GameState.svelte';

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
	const { playerId, unitType, position } = action;
	const player = gameState.state.players.get(playerId);

	if (!player) {
		throw new Error(`Player ${playerId} not found`);
	}

	// Check unit costs
	const unitCosts = {
		[UnitType.INFANTRY]: 100,
		[UnitType.TANK]: 300,
		[UnitType.AIRCRAFT]: 500
	};

	const cost = unitCosts[unitType as UnitType];

	if (player.resources.money < cost) {
		throw new Error(`Player ${playerId} cannot afford unit type ${unitType}`);
	}

	// Deduct resources
	gameState.updatePlayer(playerId, {
		resources: {
			...player.resources,
			money: player.resources.money - cost
		}
	});

	// Create new unit
	const newUnit = {
		id: uuidv4(),
		type: unitType as UnitType,
		ownerId: playerId,
		position,
		status: UnitStatus.IDLE,
		strength: unitType === UnitType.INFANTRY ? 10 : unitType === UnitType.TANK ? 30 : 50,
		maintenanceCost: unitType === UnitType.INFANTRY ? 5 : unitType === UnitType.TANK ? 15 : 25
	};

	// Add unit to state
	gameState.state.units.set(newUnit.id, newUnit);

	// Add unit to player's units
	const updatedUnits = [...player.units, newUnit];
	gameState.updatePlayer(playerId, { units: updatedUnits });

	console.log(`Player ${playerId} hired a new ${unitType} unit`);
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
const createHireUnitAction = (
	playerId: string,
	unitType: UnitType,
	position: { x: number; y: number }
): HireUnitAction => {
	return {
		id: uuidv4(),
		type: ActionType.HIRE_UNIT,
		playerId,
		unitType,
		position,
		timestamp: Date.now(),
		status: ActionStatus.PENDING,
		validate: (gameState) => {
			const player = gameState.players.get(playerId);
			if (!player) return false;

			const unitCosts = {
				[UnitType.INFANTRY]: 100,
				[UnitType.TANK]: 300,
				[UnitType.AIRCRAFT]: 500
			};

			return player.resources.money >= unitCosts[unitType];
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
