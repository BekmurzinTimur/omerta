// AIActionHelpers.svelte.ts
// Helper functions to bridge AI actions with the existing action system

import { UnitRank } from '$lib/models/UnitModels';
import gameState from '../GameState.svelte';
import { queueAction } from '../ActionManager.svelte';
import { createHireUnitAction } from '../Actions/UnitActions.svelte';
import { getUnit } from '../GameController.svelte';

/**
 * AI-specific helper to hire a unit of a specific rank
 * This generates a new unit and queues the hire action
 */
export function aiHireUnit(playerId: string, unitId: string): boolean {
	try {
		// Generate a new unit of the specified rank
		const unit = getUnit(unitId);

		if (!unit) {
			console.warn(`Unit ${unitId} doesn't exist `);
			return false;
		}

		// Create and queue the hire action
		const action = createHireUnitAction(playerId, unit.id);
		queueAction(action);

		console.log(`AI: Queued hire action for (${unit.id}) for player ${playerId}`);
		return true;
	} catch (error) {
		console.error(`AI: Error hiring unit for player ${playerId}:`, error);
		return false;
	}
}

/**
 * AI-specific helper to validate if a player can afford an action
 */
export function aiCanAfford(playerId: string, cost: number): boolean {
	const player = gameState.getPlayer(playerId);
	return player ? player.resources.money >= cost : false;
}

/**
 * AI-specific helper to get unit hiring costs
 */
export function getUnitHiringCost(rank: UnitRank): number {
	switch (rank) {
		case UnitRank.ASSOCIATE:
			return 5000;
		case UnitRank.SOLDIER:
			return 8000;
		case UnitRank.CAPO:
			return 15000;
		case UnitRank.CONSIGLIERE:
			return 25000;
		case UnitRank.UNDERBOSS:
			return 50000;
		default:
			return 5000;
	}
}

/**
 * AI-specific helper to check territory capture feasibility
 */
export function aiCanCaptureTerritory(playerId: string): boolean {
	const player = gameState.getPlayer(playerId);
	if (!player) return false;

	// Check if player has money for capture operations (rough estimate)
	if (player.resources.money < 15000) return false;

	// Check if player has available units
	const playerUnits = player.units
		.map((id) => gameState.state.units.get(id))
		.filter((unit) => unit && unit.status === 'Idle');

	return playerUnits.length > 0;
}

/**
 * AI-specific helper to evaluate mission viability
 */
export function aiEvaluateMissionRisk(
	playerId: string,
	missionHeat: number
): 'low' | 'medium' | 'high' {
	const player = gameState.getPlayer(playerId);
	if (!player) return 'high';

	const currentHeat = player.resources.heat;
	const totalHeat = currentHeat + missionHeat;

	if (totalHeat < 30) return 'low';
	if (totalHeat < 60) return 'medium';
	return 'high';
}
