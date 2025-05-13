import {
	ActionStatus,
	ActionType,
	type AssignToCrewAction,
	type HireUnitAction,
	type PromoteUnitAction
} from '$lib/models/ActionModels';
import type { GameState } from '$lib/models/GameModels';
import { v4 as uuidv4 } from 'uuid';
import gameState from '../GameState.svelte';
import { UnitRank } from '$lib/models/UnitModels';
import { isFamilyFull } from '../GameController.svelte';
import { _promoteUnit } from '$lib/utils/unitUtils';

export const validateAssignToCrew = (
	state: GameState,
	playerId: string,
	unitId: string,
	captainId: string
): { valid: boolean; reason?: string } => {
	const captain = state.units.get(captainId);
	const player = state.players.get(playerId);
	const unit = state.units.get(unitId);

	if (!player) return { valid: false, reason: `Player ${playerId} not found` };

	if (!captain) return { valid: false, reason: `Captain ${captainId} not found` };

	if (!unit) return { valid: false, reason: `Unit ${unitId} not found` };

	if (unit.ownerId !== playerId)
		return { valid: false, reason: `Unit ${unitId} does not belong to player ${playerId}` };

	if (captain.ownerId !== playerId)
		return { valid: false, reason: `Captain ${captainId} does not belong to player ${playerId}` };

	if (unit.rank !== UnitRank.SOLDIER)
		return { valid: false, reason: 'Crew can have only soldiers' };

	if (captain.rank !== UnitRank.CAPO) return { valid: false, reason: 'Captain can be only capo' };

	if (captain.crew?.includes(unitId))
		return { valid: false, reason: 'Unit already assigned to this captain' };

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
	if (isFamilyFull()) {
		return { valid: false, reason: `Family is full` };
	}

	return { valid: true };
};

// Validation for HireUnitAction
const validatePromoteUnit = (
	state: GameState,
	playerId: string,
	unitId: string
): { valid: boolean; reason?: string } => {
	const player = state.players.get(playerId);
	if (!player) return { valid: false, reason: `Player ${playerId} not found` };

	const unit = state.units.get(unitId);
	if (!unit) return { valid: false, reason: `Unit ${unitId} not found` };
	if (unit.ownerId !== playerId)
		return { valid: false, reason: `Unit ${unitId} is not owned by player ${playerId}` };
	if (unit.rank === UnitRank.UNDERBOSS || unit.rank === UnitRank.CONSIGLIERE)
		return { valid: false, reason: `Unit ${unitId} cannot be promoted further` };

	return { valid: true };
};

export const processAssignToCrew = (action: AssignToCrewAction): void => {
	const { captainId, playerId, unitId, index } = action;

	// Validate again with current state
	const validationResult = validateAssignToCrew(gameState.state, playerId, unitId, captainId);
	if (!validationResult.valid) {
		throw new Error(validationResult.reason || 'Validation failed');
	}

	const captain = gameState.state.units.get(captainId)!;
	const crew = captain.crew!;
	const unit = gameState.state.units.get(unitId)!;

	const previousCaptainId = unit.captainId;
	const previousUnitId = crew[index];
	if (previousCaptainId) {
		const previousCaptain = gameState.state.units.get(previousCaptainId)!;
		const prevCaptainCrew = previousCaptain.crew!.map((_unitId) =>
			_unitId === unitId ? previousUnitId : _unitId
		);
		gameState.updateUnit(previousCaptainId, { crew: prevCaptainCrew });
	}

	if (previousUnitId) {
		if (previousCaptainId) {
			gameState.updateUnit(previousUnitId, { captainId: previousCaptainId });
		} else {
			gameState.updateUnit(previousUnitId, { captainId: undefined });
		}
	}

	crew[index] = unitId;
	gameState.updateUnit(unitId, { captainId });
	gameState.updateUnit(captainId, { crew });

	console.log(`Player ${playerId} assigned ${unitId} to ${captainId}`);
};

// Process a HireUnitAction
export const processHireUnitAction = (action: HireUnitAction): void => {
	const { playerId, unitId } = action;

	// Validate again with current state
	const validationResult = validateHireUnit(gameState.state, playerId, unitId);
	if (!validationResult.valid) {
		throw new Error(validationResult.reason || 'Validation failed');
	}

	const player = gameState.state.players.get(playerId)!;
	const unit = gameState.state.units.get(unitId)!;

	// unit.rank = UnitRank.SOLDIER;
	gameState.updateUnit(unitId, { rank: UnitRank.SOLDIER, ownerId: playerId });

	// Add unit to player's units
	const updatedUnits = [...player.units, unit.id];
	gameState.updatePlayer(playerId, { units: updatedUnits });

	console.log(`Player ${playerId} hired ${unit.name} unit`);
};

export const processPromoteUnitAction = (action: PromoteUnitAction): void => {
	const { playerId, unitId } = action;

	// Validate again with current state
	const validationResult = validatePromoteUnit(gameState.state, playerId, unitId);
	if (!validationResult.valid) {
		throw new Error(validationResult.reason || 'Validation failed');
	}

	const unit = gameState.state.units.get(unitId)!;

	_promoteUnit(unit);
	// unit.rank = UnitRank.SOLDIER;
	gameState.updateUnit(unitId, unit);

	console.log(`Player ${playerId} promoted unit ${unit.name} to rank ${unit.rank}`);
};

export const createAssignToCrewAction = (
	playerId: string,
	unitId: string,
	captainId: string,
	index: number
): AssignToCrewAction => {
	return {
		id: uuidv4(),
		type: ActionType.ASSIGN_TO_CREW,
		playerId,
		captainId,
		unitId,
		index,
		timestamp: Date.now(),
		status: ActionStatus.PENDING,
		validate: (state: GameState) => validateAssignToCrew(state, playerId, unitId, captainId)
	};
};

// Create a hire unit action
export const createHireUnitAction = (playerId: string, unitId: string): HireUnitAction => {
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

export const createPromoteUnitAction = (playerId: string, unitId: string): PromoteUnitAction => {
	return {
		id: uuidv4(),
		type: ActionType.PROMOTE_UNIT,
		playerId,
		unitId,
		timestamp: Date.now(),
		status: ActionStatus.PENDING,
		validate: (state: GameState) => validatePromoteUnit(state, playerId, unitId)
	};
};
