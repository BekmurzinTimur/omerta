//GameController.svelte.ts

import gameState from './GameState.svelte';
import {
	queueAction,
	createStartCaptureAction,
	createHireUnitAction,
	createAssignToTerritoryAction,
	createRemoveFromTerritoryAction,
	createLaunchMissionAction
} from './ActionManager.svelte';

import {
	DEFAULT_MISSIONS,
	MissionStatus,
	type IMission,
	type IMissionInfo
} from '../models/MissionModels';
import { UnitRank } from '$lib/models/UnitModels';

let state = gameState.state;
// This controller acts as an interface between the UI and the game systems
// It will eventually be split into client and server components

// Local player ID (for now, hardcoded to player1)
const LOCAL_PLAYER_ID = 'player1';

const getTick = () => {
	return gameState.state.tickCount;
};

// Start territory capture
const startCapturingTerritory = (unitId: string, territoryId: string): void => {
	const action = createStartCaptureAction(LOCAL_PLAYER_ID, unitId, territoryId);
	queueAction(action);
};

// Hire a new unit
const hireUnit = (unitId: string): void => {
	const action = createHireUnitAction(LOCAL_PLAYER_ID, unitId);
	queueAction(action);
};

const assignUnitToTerritory = (unitId: string, territoryId: string): void => {
	const action = createAssignToTerritoryAction(LOCAL_PLAYER_ID, unitId, territoryId);
	queueAction(action);
};

const removeUnitFromTerritory = (unitId: string, territoryId: string): void => {
	const action = createRemoveFromTerritoryAction(LOCAL_PLAYER_ID, unitId, territoryId);
	queueAction(action);
};

// Get the local player
const getLocalPlayer = () => {
	return state.players.get(LOCAL_PLAYER_ID);
};

const getPlayerColor = () => {
	const player = getLocalPlayer();
	return player ? player.color : '';
};

// Get all territories
const getAllTerritories = () => {
	return state.territories;
};

// Get territories owned by the local player
const getPlayerTerritories = () => {
	const player = getLocalPlayer();
	return player ? player.territories : [];
};

// Get territories not owned by any player (neutral)
const getNeutralTerritories = () => {
	return Array.from(state.territories.values()).filter((territory) => territory.ownerId === null);
};

// Get territories that can be captured
const getCapturableTerritories = () => {
	return Array.from(state.territories.values()).filter(
		(territory) => territory.ownerId !== LOCAL_PLAYER_ID && !territory.isBeingCaptured
	);
};

const getMyMissions = (): IMission[] => {
	return Array.from(state.missions.values()).filter((m) => m.playerId === LOCAL_PLAYER_ID);
};

const getActiveMissions = (): IMission[] => {
	return Array.from(state.missions.values()).filter(
		(m) => m.status === MissionStatus.ACTIVE && m.playerId === LOCAL_PLAYER_ID
	);
};

const getFinishedMissions = (): IMission[] => {
	return Array.from(state.missions.values()).filter(
		(m) => m.status !== MissionStatus.ACTIVE && m.playerId === LOCAL_PLAYER_ID
	);
};

// Get all units
const getAllUnits = () => {
	return Array.from(state.units.values());
};

const getAllUnitsMap = () => {
	return state.units;
};

// Get all units
const getAssociates = () => {
	return Array.from(state.units.values()).filter((unit) => unit.rank === UnitRank.ASSOCIATE);
};

// Get units owned by the local player
const getPlayerUnits = () => {
	const allUnitsMap = getAllUnitsMap();
	const player = getLocalPlayer();
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

const getAvailableMissions = (): IMissionInfo[] => {
	const player = getLocalPlayer();
	if (!player) return [];

	const activeTemplates = new Set(getMyMissions().map((m) => m.missionInfoId));

	return player.unlockedMissionIds
		.filter((id) => !activeTemplates.has(id)) // exclude running ones
		.map((id) => DEFAULT_MISSIONS[id]);
};

const launchMission = (missionId: string, unitIds: string[]) => {
	const action = createLaunchMissionAction(LOCAL_PLAYER_ID, missionId, unitIds);
	queueAction(action);
};

const getMyMission = (missionInfoId: string): IMission | undefined => {
	return getMyMissions().filter((mission) => mission.missionInfoId === missionInfoId)[0];
};

// Export the game controller functions
export {
	getTick,
	startCapturingTerritory,
	hireUnit,
	assignUnitToTerritory,
	removeUnitFromTerritory,
	launchMission,
	getLocalPlayer,
	getAllTerritories,
	getPlayerTerritories,
	getNeutralTerritories,
	getCapturableTerritories,
	getAllUnits,
	getAllUnitsMap,
	getAssociates,
	getPlayerUnits,
	getCurrentDateFormatted,
	getPlayerColor,
	getMyMissions,
	getAvailableMissions,
	getActiveMissions,
	getFinishedMissions,
	getMyMission
};
