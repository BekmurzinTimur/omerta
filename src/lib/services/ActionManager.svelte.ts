// ActionManager.svelte.ts
import { v4 as uuidv4 } from 'uuid';
import {
	type Action,
	ActionStatus,
	ActionType,
	type StartCaptureAction,
	type HireUnitAction
} from '../models/ActionModels';
import gameState from './GameState.svelte';
import type {
	AssignToCrewAction,
	AssignToTerritory,
	LaunchMissionAction,
	PromoteUnitAction,
	RemoveFromTerritoryAction
} from '../models/ActionModels';
import {
	processAssignToCrew,
	processHireUnitAction,
	processPromoteUnitAction
} from './Actions/UnitActions.svelte';
import {
	processAssignToTerritoryAction,
	processRemoveFromTerritoryAction,
	processStartCaptureAction
} from './Actions/TerritoryActions.svelte';
import { processLaunchMissionAction } from './Actions/MissionActions.svelte';

// Queue of actions waiting to be processed
let actionQueue = $state<Action[]>([]);

// History of processed actions
let actionHistory = $state<Action[]>([]);

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
				case ActionType.PROMOTE_UNIT:
					processPromoteUnitAction(action as PromoteUnitAction);
					break;
				case ActionType.ASSIGN_TO_CREW:
					processAssignToCrew(action as AssignToCrewAction);
					break;
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

// Export the action manager functions
export { queueAction, processActions, getPendingActions, getPlayerActionHistory };
