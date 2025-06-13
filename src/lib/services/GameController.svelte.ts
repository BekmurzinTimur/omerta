//GameController.svelte.ts (Updated with AI helper functions)

import gameState from './GameState.svelte';
import { queueAction } from './ActionManager.svelte';
import playerManager from './PlayerManager.svelte';

import { MissionStatus, type IMission } from '../models/MissionModels';
import { UnitRank } from '$lib/models/UnitModels';
import { getMaxFamilySize } from '$lib/utils/familyUtils';
import { calculateRegionOwnership } from '$lib/utils/regionsUtils';
import {
	createAssignToTerritoryAction,
	createRemoveFromTerritoryAction,
	createStartCaptureAction
} from './Actions/TerritoryActions.svelte';
import {
	createAssignToCrewAction,
	createHireUnitAction,
	createPromoteUnitAction
} from './Actions/UnitActions.svelte';
import { createLaunchMissionAction } from './Actions/MissionActions.svelte';

let state = gameState.state;

// This controller acts as an interface between the UI and the game systems
// All functions now accept playerId to support multiple players

const getTick = () => {
	return gameState.state.tickCount;
};

// Start territory capture
const startCapturingTerritory = (playerId: string, unitId: string, territoryId: string): void => {
	const action = createStartCaptureAction(playerId, unitId, territoryId);
	queueAction(action);
};

// Hire a new unit
const hireUnit = (playerId: string, unitId: string): void => {
	const action = createHireUnitAction(playerId, unitId);
	queueAction(action);
};

const promoteUnit = (playerId: string, unitId: string): void => {
	const action = createPromoteUnitAction(playerId, unitId);
	queueAction(action);
};

const assignUnitToTerritory = (playerId: string, unitId: string, territoryId: string): void => {
	const action = createAssignToTerritoryAction(playerId, unitId, territoryId);
	queueAction(action);
};

const removeUnitFromTerritory = (playerId: string, unitId: string, territoryId: string): void => {
	const action = createRemoveFromTerritoryAction(playerId, unitId, territoryId);
	queueAction(action);
};

const assignToCrew = (playerId: string, unitId: string, captainId: string, index: number): void => {
	const action = createAssignToCrewAction(playerId, unitId, captainId, index);
	queueAction(action);
};

// Get a specific player
const getPlayer = (playerId: string) => {
	return state.players.get(playerId);
};

const getPlayers = () => {
	return state.players;
};

// Get the player color
const getPlayerColor = (playerId: string) => {
	const player = getPlayer(playerId);
	return player ? player.color : '';
};

const getTerritory = (id: string) => {
	return state.territories.get(id);
};

// Get all territories
const getAllTerritories = () => {
	return state.territories;
};

const getRegion = (id: string) => {
	return state.regions.get(id);
};

// Get all regions
const getAllRegions = () => {
	return state.regions;
};

// Get territories owned by a specific player
const getPlayerTerritories = (playerId: string) => {
	const player = getPlayer(playerId);
	return player ? player.territories : [];
};

// Get territories not owned by any player (neutral)
const getNeutralTerritories = () => {
	return Array.from(state.territories.values()).filter((territory) => territory.ownerId === null);
};

// Get territories that can be captured by a specific player
const getCapturableTerritories = (playerId: string) => {
	return Array.from(state.territories.values()).filter(
		(territory) => territory.ownerId !== playerId && !territory.isBeingCaptured
	);
};

const getAvailableMissions = (playerId: string): IMission[] =>
	Array.from(gameState.state.missions.values()).filter(
		(m) => m.playerId === playerId && m.status === MissionStatus.AVAILABLE
	);

const getActiveMissions = (playerId: string): IMission[] =>
	Array.from(gameState.state.missions.values()).filter(
		(m) => m.playerId === playerId && m.status === MissionStatus.ACTIVE
	);

const getFinishedMissions = (playerId: string): IMission[] =>
	Array.from(gameState.state.missions.values()).filter(
		(m) =>
			m.playerId === playerId &&
			m.status !== MissionStatus.ACTIVE &&
			m.status !== MissionStatus.AVAILABLE
	);

const getMissions = (missionsId: string[]): IMission[] => {
	return missionsId.map((id) => gameState.state.missions.get(id)).filter((_) => !!_);
};

// Get all units
const getAllUnits = () => {
	return Array.from(state.units.values());
};

const getAllUnitsMap = () => {
	return state.units;
};

const getUnit = (unitId: string) => {
	return state.units.get(unitId);
};

// Get all units
const getAssociates = () => {
	return Array.from(state.units.values()).filter((unit) => unit.rank === UnitRank.ASSOCIATE);
};

// Get units owned by a specific player
const getPlayerUnits = (playerId: string) => {
	const allUnitsMap = getAllUnitsMap();
	const player = getPlayer(playerId);
	return player ? player.units.map((unitId) => allUnitsMap.get(unitId)!) : [];
};

// Get the current game date as a formatted string
const getCurrentDateFormatted = () => {
	const date = state.currentDate;
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	const hour = date.getHours().toString().padStart(2, '0');

	return `${year}-${month}-${day} ${hour}:00`;
};

const launchMission = (playerId: string, missionId: string, unitIds: string[]) => {
	const action = createLaunchMissionAction(playerId, missionId, unitIds);
	queueAction(action);
};

const getMission = (missionId: string): IMission | undefined => {
	return gameState.state.missions.get(missionId);
};

const isFamilyFull = (playerId: string) => {
	let playerUnits = getPlayerUnits(playerId);
	const maxFamilySize = getMaxFamilySize(playerUnits);
	return playerUnits.length >= maxFamilySize;
};

const getRegionControl = (playerId: string, regionId?: string): number => {
	if (!regionId) return 0;
	const ownership = calculateRegionOwnership(regionId, gameState.state);
	return ownership.get(playerId) || 0;
};

const getHasGameEnded = () => {
	return gameState.state.hasEnded;
};

const getFamilyHeat = (playerId: string) => {
	return getPlayerUnits(playerId).reduce((prev, cur) => {
		return prev + cur.heat;
	}, 0);
};

// ═══════════════════════════════════════════════════════════════════
// AI-RELATED FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

// Check if a player is AI controlled
const isAIPlayer = (playerId: string): boolean => {
	return playerManager.isAIPlayer(playerId);
};

// Get all AI player IDs
const getAIPlayerIds = (): string[] => {
	return playerManager.getAIPlayersId();
};

// Get all AI players
const getAIPlayers = () => {
	return playerManager.getAIPlayers();
};

// Get all human players
const getHumanPlayers = () => {
	return Array.from(state.players.values()).filter((player) => !isAIPlayer(player.id));
};

// Get player type for display
const getPlayerType = (playerId: string): 'Human' | 'AI' | 'Unknown' => {
	const player = getPlayer(playerId);
	if (!player) return 'Unknown';
	return isAIPlayer(playerId) ? 'AI' : 'Human';
};

// ═══════════════════════════════════════════════════════════════════
// UI-SPECIFIC FUNCTIONS
// These functions work with the currently viewing player
// ═══════════════════════════════════════════════════════════════════

const getViewingPlayer = () => {
	console.log('getting viewing player', playerManager);
	return playerManager.getViewingPlayer();
};

const getViewingPlayerId = () => {
	return playerManager.getViewingPlayerId();
};

const setViewingPlayer = (playerId: string) => {
	playerManager.setViewingPlayer(playerId);
};

// Convenience functions for the viewing player
const getViewingPlayerTerritories = () => {
	const playerId = getViewingPlayerId();
	return playerId ? getPlayerTerritories(playerId) : [];
};

const getViewingPlayerUnits = () => {
	const playerId = getViewingPlayerId();
	return playerId ? getPlayerUnits(playerId) : [];
};

const getViewingPlayerColor = () => {
	const playerId = getViewingPlayerId();
	return playerId ? getPlayerColor(playerId) : '';
};

const getViewingPlayerMissions = () => {
	const playerId = getViewingPlayerId();
	return playerId ? getAvailableMissions(playerId) : [];
};

// Export the game controller functions
export {
	getTick,
	getHasGameEnded,
	startCapturingTerritory,
	hireUnit,
	promoteUnit,
	assignUnitToTerritory,
	removeUnitFromTerritory,
	launchMission,
	assignToCrew,
	getPlayer,
	getPlayers,
	getTerritory,
	getAllTerritories,
	getRegion,
	getAllRegions,
	getPlayerTerritories,
	getNeutralTerritories,
	getCapturableTerritories,
	getAllUnits,
	getAllUnitsMap,
	getUnit,
	getAssociates,
	getPlayerUnits,
	getCurrentDateFormatted,
	getPlayerColor,
	getAvailableMissions,
	getActiveMissions,
	getFinishedMissions,
	getMissions,
	getMission,
	isFamilyFull,
	getRegionControl,
	getFamilyHeat,
	// AI-related exports
	isAIPlayer,
	getAIPlayerIds,
	getAIPlayers,
	getHumanPlayers,
	getPlayerType,
	// UI-specific exports
	getViewingPlayer,
	getViewingPlayerId,
	setViewingPlayer,
	getViewingPlayerTerritories,
	getViewingPlayerUnits,
	getViewingPlayerColor,
	getViewingPlayerMissions
};
