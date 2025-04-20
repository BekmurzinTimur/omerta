//ActionManager.svelte.ts
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
import { UnitStatus, UnitRank, CoreAttribute } from '$lib/models/UnitModels';
import { DEFAULT_MISSIONS, MissionStatus, type IMission } from '$lib/models/MissionModels';
import { addScheduledAction } from './ScheduledActionManager.svelte';
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
const processLaunchMissionAction = (action: LaunchMissionAction): void => {
	const { playerId, missionInfoId, unitIds } = action;
	const mission = DEFAULT_MISSIONS[missionInfoId];
	let player = gameState.state.players.get(playerId);
	if (!player) throw new Error(`Player ${playerId} not found`);
	if (!mission) throw new Error(`Mission info ${missionInfoId} not found`);

	// Mark units as on‑mission
	unitIds.forEach((uid) => {
		const unit = gameState.state.units.get(uid);
		if (!unit) throw new Error(`Unit ${uid} missing`);
		gameState.state.units.set(uid, { ...unit, status: UnitStatus.MISSION });
	});

	const endTick = gameState.state.tickCount + mission.durationTicks;

	const activeMission: IMission = {
		id: uuidv4(),
		missionInfoId,
		playerId,
		unitIds,
		startTick: gameState.state.tickCount,
		endTick,
		status: MissionStatus.ACTIVE
	};

	player.unlockedMissionIds = player.unlockedMissionIds.filter(
		(playerMissionId) => playerMissionId !== missionInfoId
	);

	gameState.state.missions.set(activeMission.id, activeMission);

	// Schedule mission resolution
	addScheduledAction({
		id: `mission-${action.id}`,
		type: ScheduledActionType.MISSION_COMPLETE,
		interval: mission.durationTicks,
		nextExecutionTick: endTick,
		isRecurring: false,
		execute: (state) => resolveMission(state, playerId, activeMission)
	});

	console.log(`Player ${playerId} launched mission ${mission.name} with ${unitIds.length} unit(s)`);
};
const resolveMission = (state: GameState, playerId: string, activeMission: IMission) => {
	const { missionInfoId, unitIds } = activeMission;
	const missionInfo = DEFAULT_MISSIONS[missionInfoId];
	const player = state.players.get(playerId);
	if (!missionInfo || !player) return;

	// 1. calculate combined relevant stats
	let total = 0;
	Object.entries(missionInfo.difficulty).forEach(([attrStr]) => {
		const attr = attrStr as CoreAttribute;
		const sum = unitIds.reduce((acc, uid) => acc + (state.units.get(uid)?.skills[attr] ?? 0), 0);
		total += sum;
	});

	const required = Object.values(missionInfo.difficulty).reduce((a, b) => a + b, 0);
	const success = total >= required;

	// 2. Apply money to player
	if (success) {
		// calculate total cut %
		const totalCutPct =
			unitIds.reduce((acc, uid) => acc + (state.units.get(uid)?.cut ?? 0), 0) / 100;
		const netReward = Math.round(missionInfo.reward * (1 - totalCutPct));
		console.log({ totalCutPct, netReward });

		gameState.updatePlayer(playerId, {
			resources: {
				...player.resources,
				money: player.resources.money + netReward
			}
		});
	}

	if (missionInfo.repeatable) {
		player.unlockedMissionIds.push(missionInfoId);
	}

	// 3. Update each unit
	unitIds.forEach((uid) => {
		const unit = state.units.get(uid);
		if (!unit) return;

		const loyaltyDelta = success ? +1 : -1;
		const updated = {
			...unit,
			status: UnitStatus.IDLE,
			loyalty: unit.loyalty + loyaltyDelta,
			heat: unit.heat + 1
		};
		state.units.set(uid, updated);
	});

	const status = success ? MissionStatus.SUCCEEDED : MissionStatus.FAILED;
	gameState.updateMission(activeMission.id, { status });

	console.log(
		`Mission ${missionInfo.name} ${success ? 'succeeded' : 'failed'} ` + `for player ${playerId}`
	);
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

const createLaunchMissionAction = (
	playerId: string,
	missionInfoId: string,
	unitIds: string[]
): LaunchMissionAction => {
	return {
		id: uuidv4(),
		type: ActionType.LAUNCH_MISSION,
		playerId,
		missionInfoId,
		unitIds,
		timestamp: Date.now(),
		status: ActionStatus.PENDING,
		validate: (state: GameState) => {
			if (unitIds.length === 0 || unitIds.length > 4) {
				console.error('Unit count wrong', unitIds.length);
				return false;
			}

			const mission = DEFAULT_MISSIONS[missionInfoId];
			if (!mission) {
				console.error('No mission info found', missionInfoId, DEFAULT_MISSIONS);
				return false;
			}

			const player = state.players.get(playerId);
			if (!player) {
				console.error('No player found', player, state.players);
				return false;
			}

			const isAllUnitsCorrect = unitIds.every((uid) => {
				const u = state.units.get(uid);
				return (
					u &&
					(u.ownerId === playerId || u.rank === UnitRank.ASSOCIATE) &&
					u.status === UnitStatus.IDLE
				);
			});
			if (!isAllUnitsCorrect) {
				console.error('Not all units are correct', unitIds, state.units);
				return false;
			}
			return true;
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
	createRemoveFromTerritoryAction,
	createLaunchMissionAction
};
