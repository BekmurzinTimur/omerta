import { v4 as uuidv4 } from 'uuid';

import {
	ActionStatus,
	ActionType,
	type AssignToTerritory,
	type RemoveFromTerritoryAction,
	type StartCaptureAction
} from '$lib/models/ActionModels';
import type { GameState } from '$lib/models/GameModels';
import { UnitRank, UnitStatus } from '$lib/models/UnitModels';
import { isNeighboringPlayerTerritory } from '$lib/utils/mapUtils';
import gameState from '../GameState.svelte';

export const validateStartCapture = (
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
	if (!isNeighboringPlayerTerritory(territory, gameState.state.territories, player.id))
		return { valid: false, reason: 'Territory is not neighbouring any players territory' };

	return { valid: true };
};

// Validation for AssignToTerritoryAction
export const validateAssignToTerritory = (
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
export const validateRemoveFromTerritory = (
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

// Process a StartCaptureAction
export const processStartCaptureAction = (action: StartCaptureAction): void => {
	const { territoryId, playerId, unitId } = action;

	// Validate again with current state
	const validationResult = validateStartCapture(gameState.state, playerId, unitId, territoryId);
	if (!validationResult.valid) {
		throw new Error(validationResult.reason || 'Validation failed');
	}

	const territory = gameState.state.territories.get(territoryId)!;

	// Free previous capturer
	const previousCapturer = gameState.state.units.get(territory.capturingUnitId || '');
	if (previousCapturer) {
		gameState.updateUnit(previousCapturer.id, { status: UnitStatus.IDLE });
	}

	const unit = gameState.state.units.get(unitId)!;
	// Mark territory and unit
	gameState.updateTerritory(territoryId, {
		isBeingCaptured: true,
		captureInitiator: playerId,
		capturingUnitId: unitId
	});

	gameState.updateUnit(unitId, { status: UnitStatus.EXPAND });

	console.log(
		`Player ${playerId} started capturing territory ${territoryId} with unit ${unit.name}`
	);
};

export const processAssignToTerritoryAction = (action: AssignToTerritory): void => {
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

export const processRemoveFromTerritoryAction = (action: RemoveFromTerritoryAction): void => {
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

// Create a start capture action
export const createStartCaptureAction = (
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

export const createAssignToTerritoryAction = (
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

export const createRemoveFromTerritoryAction = (
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
