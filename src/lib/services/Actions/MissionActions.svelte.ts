import { v4 as uuidv4 } from 'uuid';
import {
	ActionStatus,
	ActionType,
	ScheduledActionType,
	type LaunchMissionAction
} from '$lib/models/ActionModels';
import type { GameState } from '$lib/models/GameModels';
import { MissionStatus, type IMission } from '$lib/models/MissionModels';
import { UnitRank, UnitStatus } from '$lib/models/UnitModels';
import gameState from '../GameState.svelte';
import { revealUnitAttribute } from '$lib/utils/unitUtils';
import { getChanceToBeCaught, wasCaught } from '$lib/utils/statsUtils';
import { getHeatLevel } from '$lib/utils/familyUtils';
import { BASE_CHANCE_TO_CAUGHT, LOYALITY_REWARD_MISSION } from '$lib/const/globalConstants';
import { checkMissionSuccess, getTeamStats } from '$lib/utils/common';
import { getAllUnitsMap } from '../GameController.svelte';
import { addScheduledAction } from '../ScheduledActionManager.svelte';

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
// ACTION PROCESSING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export const processLaunchMissionAction = (action: LaunchMissionAction): void => {
	const { playerId, missionId, unitIds } = action;

	const validationResult = validateLaunchMission(gameState.state, playerId, missionId, unitIds);
	if (!validationResult.valid) {
		throw new Error(validationResult.reason || 'Validation failed');
	}

	const mission = gameState.state.missions.get(missionId)!;

	// Mark units as on‑mission
	unitIds.forEach((uid) => {
		const unit = gameState.state.units.get(uid);
		gameState.updateUnit(uid, {
			status: UnitStatus.MISSION,
			missions: [...unit!.missions, missionId]
		});
	});

	const endTick = gameState.state.tickCount + mission.info.durationTicks;

	const updatedMission = {
		...mission,
		unitIds,
		startTick: gameState.state.tickCount,
		endTick: endTick,
		status: MissionStatus.ACTIVE
	};
	gameState.updateMission(missionId, updatedMission);

	// Schedule mission resolution
	addScheduledAction({
		id: `mission-${mission.id}`,
		type: ScheduledActionType.MISSION_COMPLETE,
		interval: mission.info.durationTicks,
		nextExecutionTick: endTick,
		isRecurring: false,
		execute: (state) => resolveMission(state, playerId, updatedMission)
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
	const teamStats = getTeamStats(units, state.units);
	const success = checkMissionSuccess(info.difficulty, teamStats);

	let netReward = 0;
	// 2. Apply money to player
	if (success) {
		// calculate total cut %
		const totalCutPct = units.reduce((acc, unit) => acc + (unit?.cut ?? 0), 0) / 100;
		netReward = Math.round(info.reward * (1 - totalCutPct));

		gameState.updatePlayer(playerId, {
			resources: {
				...player.resources,
				money: player.resources.money + netReward
			}
		});
	}

	// 3. Update each unit
	const experience = success ? 20 : 0;
	unitIds.forEach((uid) => {
		const unit = state.units.get(uid);

		if (!unit) return;

		const loyaltyDelta = success ? +LOYALITY_REWARD_MISSION : -LOYALITY_REWARD_MISSION / 2;
		const heatLevel = getHeatLevel(player.resources.heat);
		const chanceToBeCaught = getChanceToBeCaught(BASE_CHANCE_TO_CAUGHT[heatLevel], 0, unit.heat);
		const isUnitCaught = wasCaught(chanceToBeCaught);
		console.log(player.resources.heat, { heatLevel, chanceToBeCaught, isUnitCaught });
		gameState.updateUnit(unit.id, {
			status: isUnitCaught ? UnitStatus.PRISON : UnitStatus.IDLE,
			loyalty: unit.loyalty + loyaltyDelta,
			heat: unit.heat + info.heat,
			experience: unit.experience + experience,
			mask: UnitRank.ASSOCIATE ? revealUnitAttribute(unit.mask) : unit.mask
		});
	});

	const status = success ? MissionStatus.SUCCEEDED : MissionStatus.FAILED;
	const results = success
		? {
				money: netReward
			}
		: undefined;
	gameState.updateMission(activeMission.id, {
		status,
		results
	});

	console.log(
		`Mission ${info.name} ${success ? 'succeeded' : 'failed'} ` + `for player ${playerId}`
	);
};

// ═══════════════════════════════════════════════════════════════════
// ACTION CREATOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export const createLaunchMissionAction = (
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
