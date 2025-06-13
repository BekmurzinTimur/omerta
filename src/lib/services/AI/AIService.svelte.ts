// AIService.svelte.ts
import type { GameState, Player } from '../../models/GameModels';
import { type IMission, MissionStatus } from '../../models/MissionModels';
import { type IUnit, UnitRank, UnitStatus, CoreAttribute } from '../../models/UnitModels';
import { queueAction } from '../ActionManager.svelte';
import { createPromoteUnitAction } from '../Actions/UnitActions.svelte';
import {
	createStartCaptureAction,
	createAssignToTerritoryAction
	// createRemoveFromTerritoryAction
} from '../Actions/TerritoryActions.svelte';
import { createLaunchMissionAction } from '../Actions/MissionActions.svelte';
import { AI_DECISIONS } from './AIDecisions';
import {
	aiHireUnit,
	aiCanAfford,
	getUnitHiringCost,
	aiCanCaptureTerritory,
	aiEvaluateMissionRisk
} from './AIHelpers.svelte';

// AI Decision System Types
export interface AICondition {
	type: string;
	[key: string]: any;
}

export interface WeightModifier {
	condition: AICondition;
	multiplier: number;
}

export interface AIAction {
	type: string;
	[key: string]: any;
}

export interface AIDecision {
	id: string;
	name: string;
	triggers: AICondition[];
	baseWeight: number;
	weightModifiers: WeightModifier[];
	actions: AIAction[];
	cooldown?: number;
}

export interface AIDecisionSet {
	decisions: AIDecision[];
}

// Mission Analysis Helper
class MissionAnalyzer {
	static calculateMissionSuitability(
		mission: IMission,
		availableUnits: IUnit[]
	): {
		suitability: number;
		bestUnits: string[];
		totalSkills: Record<CoreAttribute, number>;
	} {
		if (availableUnits.length === 0) {
			return { suitability: 0, bestUnits: [], totalSkills: {} as Record<CoreAttribute, number> };
		}

		const requiredSkills = mission.info.difficulty;

		// Find best unit combination (simple greedy algorithm)
		const sortedUnits = availableUnits
			.filter((unit) => unit.status === UnitStatus.IDLE)
			.sort((a, b) => this.getUnitTotalSkill(b) - this.getUnitTotalSkill(a));

		const selectedUnits: IUnit[] = [];
		const totalSkills: Record<CoreAttribute, number> = {
			[CoreAttribute.MUSCLE]: 0,
			[CoreAttribute.BRAINS]: 0,
			[CoreAttribute.CUNNING]: 0,
			[CoreAttribute.INFLUENCE]: 0
		};

		// Select up to 4 units, prioritizing skill coverage
		for (let i = 0; i < Math.min(4, sortedUnits.length); i++) {
			const unit = sortedUnits[i];
			selectedUnits.push(unit);

			Object.values(CoreAttribute).forEach((attr) => {
				totalSkills[attr] += unit.skills[attr];
			});

			// Check if we have enough skills
			const hasEnoughSkills = Object.values(CoreAttribute).every(
				(attr) => totalSkills[attr] >= requiredSkills[attr]
			);

			if (hasEnoughSkills && selectedUnits.length >= 1) break;
		}

		// Calculate suitability score
		let suitability = 0;
		Object.values(CoreAttribute).forEach((attr) => {
			const ratio = totalSkills[attr] / Math.max(requiredSkills[attr], 1);
			suitability += Math.min(ratio, 2); // Cap at 2x requirement
		});

		suitability = suitability / 4; // Average across attributes

		// Penalty for insufficient skills
		const hasRequiredSkills = Object.values(CoreAttribute).every(
			(attr) => totalSkills[attr] >= requiredSkills[attr]
		);

		if (!hasRequiredSkills) {
			suitability *= 0.3; // Heavy penalty for not meeting requirements
		}

		return {
			suitability,
			bestUnits: selectedUnits.map((u) => u.id),
			totalSkills
		};
	}

	private static getUnitTotalSkill(unit: IUnit): number {
		return Object.values(unit.skills).reduce((sum, skill) => sum + skill, 0);
	}
}

// Condition Evaluators
class ConditionEvaluator {
	static evaluate(condition: AICondition, player: Player, gameState: GameState): boolean {
		switch (condition.type) {
			case 'has_money':
				return player.resources.money >= condition.amount;

			case 'heat_level':
				return this.compareValues(player.resources.heat, condition.operator, condition.value);

			case 'awareness_level':
				return this.compareValues(player.resources.awareness, condition.operator, condition.value);

			case 'territory_count':
				return this.compareValues(player.territories.length, condition.operator, condition.value);

			case 'unit_count':
				const playerUnits = this.getPlayerUnits(player, gameState);
				return this.compareValues(playerUnits.length, condition.operator, condition.value);

			case 'unit_rank_count':
				const unitsOfRank = this.getPlayerUnits(player, gameState).filter(
					(unit) => unit.rank === condition.rank
				);
				return this.compareValues(unitsOfRank.length, condition.operator, condition.value);

			case 'idle_units':
				const idleUnits = this.getPlayerUnits(player, gameState).filter(
					(unit) => unit.status === UnitStatus.IDLE
				);
				return this.compareValues(idleUnits.length, condition.operator, condition.value);

			case 'suitable_mission_available':
				return this.hasSuitableMissions(player, gameState, condition.minSuitability || 0.7);

			case 'capturable_territory_nearby':
				return this.hasCaptureOpportunities(player, gameState);

			case 'unmanaged_territories':
				const unmanagedCount = player.territories.filter((t) => !t.managerId).length;
				return unmanagedCount >= (condition.count || 1);

			case 'low_loyalty_units':
				const lowLoyaltyUnits = this.getPlayerUnits(player, gameState).filter(
					(unit) => unit.loyalty < (condition.threshold || 50)
				);
				return lowLoyaltyUnits.length >= (condition.count || 1);

			case 'high_skill_unit_available':
				const highSkillUnits = this.getPlayerUnits(player, gameState)
					.filter((unit) => unit.status === UnitStatus.IDLE)
					.filter((unit) =>
						Object.values(unit.skills).some((skill) => skill >= (condition.skillLevel || 20))
					);
				return highSkillUnits.length > 0;

			case 'active_missions':
				const activeMissions = Array.from(gameState.missions.values()).filter(
					(m) => m.playerId === player.id && m.status === MissionStatus.ACTIVE
				);
				return this.compareValues(activeMissions.length, condition.operator, condition.value);

			case 'can_afford_unit':
				const cost = getUnitHiringCost(condition.rank || UnitRank.ASSOCIATE);
				return aiCanAfford(player.id, cost);

			case 'can_afford_capture':
				return aiCanCaptureTerritory(player.id);

			case 'mission_risk_acceptable':
				const riskThreshold = condition.maxRisk || 'medium';
				const missions = Array.from(gameState.missions.values()).filter(
					(m) => m.playerId === player.id && m.status === MissionStatus.AVAILABLE
				);

				return missions.some((mission) => {
					const risk = aiEvaluateMissionRisk(player.id, mission.info.heat);
					const acceptableRisks = ['low'];
					if (riskThreshold === 'medium') acceptableRisks.push('medium');
					if (riskThreshold === 'high') acceptableRisks.push('high');
					return acceptableRisks.includes(risk);
				});

			default:
				console.warn(`Unknown AI condition type: ${condition.type}`);
				return false;
		}
	}

	private static compareValues(actual: number, operator: string, expected: number): boolean {
		switch (operator) {
			case '>':
				return actual > expected;
			case '>=':
				return actual >= expected;
			case '<':
				return actual < expected;
			case '<=':
				return actual <= expected;
			case '==':
				return actual === expected;
			case '!=':
				return actual !== expected;
			default:
				return false;
		}
	}

	private static getPlayerUnits(player: Player, gameState: GameState): IUnit[] {
		return player.units
			.map((unitId) => gameState.units.get(unitId))
			.filter((unit): unit is IUnit => unit !== undefined);
	}

	private static hasSuitableMissions(
		player: Player,
		gameState: GameState,
		minSuitability: number
	): boolean {
		const availableUnits = this.getPlayerUnits(player, gameState).filter(
			(unit) => unit.status === UnitStatus.IDLE
		);

		const availableMissions = Array.from(gameState.missions.values()).filter(
			(mission) =>
				mission.playerId === player.id &&
				mission.status === MissionStatus.AVAILABLE &&
				mission.tipExpires > gameState.tickCount
		);

		return availableMissions.some((mission) => {
			const analysis = MissionAnalyzer.calculateMissionSuitability(mission, availableUnits);
			return analysis.suitability >= minSuitability;
		});
	}

	private static hasCaptureOpportunities(player: Player, gameState: GameState): boolean {
		const availableTerritories = Array.from(gameState.territories.values()).filter(
			(territory) => territory.ownerId !== player.id && !territory.isBeingCaptured
		);

		return availableTerritories.length > 0;
	}
}

// Weight Calculator
class WeightCalculator {
	static calculate(decision: AIDecision, player: Player, gameState: GameState): number {
		let weight = decision.baseWeight;

		// Apply weight modifiers
		for (const modifier of decision.weightModifiers) {
			if (ConditionEvaluator.evaluate(modifier.condition, player, gameState)) {
				weight *= modifier.multiplier;
			}
		}

		// Add randomness to prevent predictable behavior
		const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
		return weight * randomFactor;
	}
}

// AI Player State
interface AIPlayerState {
	playerId: string;
	decisionCooldowns: Map<string, number>;
	lastDecisionTick: number;
}

// Main AI Service
class AIService {
	private decisions: AIDecision[] = [];
	private aiPlayers: Map<string, AIPlayerState> = new Map();
	private currentTick: number = 0;

	constructor() {
		this.loadDecisions(AI_DECISIONS);
	}

	private loadDecisions(decisionData: AIDecisionSet): void {
		console.log('service');
		this.decisions = decisionData.decisions;
		console.log(`AI: Loaded ${this.decisions.length} decisions`);
	}

	addAIPlayer(playerId: string): void {
		this.aiPlayers.set(playerId, {
			playerId,
			decisionCooldowns: new Map(),
			lastDecisionTick: 0
		});
		console.log(`AI: Added AI player ${playerId}`);
	}

	removeAIPlayer(playerId: string): void {
		this.aiPlayers.delete(playerId);
		console.log(`AI: Removed AI player ${playerId}`);
	}

	tick(gameState: GameState): void {
		this.currentTick = gameState.tickCount;

		for (const [playerId, aiState] of this.aiPlayers) {
			const player = gameState.players.get(playerId);
			if (!player) continue;

			this.processAIPlayer(aiState, player, gameState);
		}

		this.updateCooldowns();
	}

	private processAIPlayer(aiState: AIPlayerState, player: Player, gameState: GameState): void {
		const validDecisions = this.getValidDecisions(aiState, player, gameState);

		if (validDecisions.length === 0) return;

		const weightedDecisions = validDecisions.map((decision) => ({
			decision,
			weight: WeightCalculator.calculate(decision, player, gameState)
		}));

		weightedDecisions.sort((a, b) => b.weight - a.weight);

		const selectedDecision = this.selectDecisionByWeight(weightedDecisions);

		if (selectedDecision) {
			this.executeDecision(selectedDecision.decision, player, gameState, aiState);
		}
	}

	private getValidDecisions(
		aiState: AIPlayerState,
		player: Player,
		gameState: GameState
	): AIDecision[] {
		return this.decisions.filter((decision) => {
			const cooldownEnd = aiState.decisionCooldowns.get(decision.id) || 0;
			if (this.currentTick < cooldownEnd) return false;

			return decision.triggers.every((trigger) =>
				ConditionEvaluator.evaluate(trigger, player, gameState)
			);
		});
	}

	private selectDecisionByWeight(
		weightedDecisions: { decision: AIDecision; weight: number }[]
	): { decision: AIDecision; weight: number } | null {
		if (weightedDecisions.length === 0) return null;

		const totalWeight = weightedDecisions.reduce((sum, wd) => sum + wd.weight, 0);
		let random = Math.random() * totalWeight;

		for (const weightedDecision of weightedDecisions) {
			random -= weightedDecision.weight;
			if (random <= 0) {
				return weightedDecision;
			}
		}

		return weightedDecisions[0];
	}

	private executeDecision(
		decision: AIDecision,
		player: Player,
		gameState: GameState,
		aiState: AIPlayerState
	): void {
		console.log(`AI: ${player.name} executing "${decision.name}"`);

		for (const action of decision.actions) {
			this.executeAction(action, player, gameState);
		}

		if (decision.cooldown && decision.cooldown > 0) {
			aiState.decisionCooldowns.set(decision.id, this.currentTick + decision.cooldown);
		}

		aiState.lastDecisionTick = this.currentTick;
	}

	private executeAction(action: AIAction, player: Player, gameState: GameState): void {
		try {
			switch (action.type) {
				case 'hire_unit':
					this.hireUnit(player.id, action.rank || UnitRank.ASSOCIATE);
					break;

				case 'promote_unit':
					this.promoteUnit(player, gameState);
					break;

				case 'launch_best_mission':
					this.launchBestAvailableMission(player, gameState);
					break;

				case 'capture_territory':
					this.attemptTerritoryCapture(player, gameState);
					break;

				case 'assign_territory_manager':
					this.assignTerritoryManagers(player, gameState);
					break;

				default:
					console.warn(`AI: Unknown action type: ${action.type}`);
			}
		} catch (error) {
			console.error(`AI: Error executing action ${action.type}:`, error);
		}
	}

	private hireUnit(playerId: string, rank: UnitRank): void {
		// Use AI-specific helper for better integration
		const success = aiHireUnit(playerId, rank);
		if (!success) {
			console.warn(`AI: Failed to hire ${rank} for player ${playerId}`);
		}
	}

	private promoteUnit(player: Player, gameState: GameState): void {
		const units = player.units
			.map((id) => gameState.units.get(id))
			.filter((unit): unit is IUnit => unit !== undefined)
			.filter((unit) => unit.loyalty > 70 && unit.experience > 50)
			.sort((a, b) => b.loyalty + b.experience - (a.loyalty + a.experience));

		if (units.length > 0) {
			const action = createPromoteUnitAction(player.id, units[0].id);
			queueAction(action);
		}
	}

	private launchBestAvailableMission(player: Player, gameState: GameState): void {
		const availableUnits = player.units
			.map((id) => gameState.units.get(id))
			.filter((unit): unit is IUnit => unit !== undefined)
			.filter((unit) => unit.status === UnitStatus.IDLE);

		const availableMissions = Array.from(gameState.missions.values()).filter(
			(mission) =>
				mission.playerId === player.id &&
				mission.status === MissionStatus.AVAILABLE &&
				mission.tipExpires > gameState.tickCount
		);

		let bestMission: IMission | null = null;
		let bestScore = 0;
		let bestUnits: string[] = [];

		for (const mission of availableMissions) {
			const analysis = MissionAnalyzer.calculateMissionSuitability(mission, availableUnits);

			// Calculate risk-reward score
			const riskAdjustedReward = mission.info.reward / Math.max(mission.info.heat, 1);
			const score = analysis.suitability * riskAdjustedReward;

			if (score > bestScore && analysis.suitability >= 0.6) {
				bestScore = score;
				bestMission = mission;
				bestUnits = analysis.bestUnits;
			}
		}

		if (bestMission && bestUnits.length > 0) {
			const action = createLaunchMissionAction(player.id, bestMission.id, bestUnits);
			queueAction(action);
		}
	}

	private attemptTerritoryCapture(player: Player, gameState: GameState): void {
		const availableUnits = player.units
			.map((id) => gameState.units.get(id))
			.filter((unit): unit is IUnit => unit !== undefined)
			.filter((unit) => unit.status === UnitStatus.IDLE);

		const captureTargets = Array.from(gameState.territories.values())
			.filter((territory) => territory.ownerId !== player.id && !territory.isBeingCaptured)
			.sort((a, b) => b.resources.income - a.resources.income);

		if (availableUnits.length > 0 && captureTargets.length > 0) {
			const bestUnit = availableUnits.sort(
				(a, b) =>
					b.skills[CoreAttribute.MUSCLE] +
					b.skills[CoreAttribute.CUNNING] -
					(a.skills[CoreAttribute.MUSCLE] + a.skills[CoreAttribute.CUNNING])
			)[0];

			const action = createStartCaptureAction(player.id, bestUnit.id, captureTargets[0].id);
			queueAction(action);
		}
	}

	private assignTerritoryManagers(player: Player, gameState: GameState): void {
		const unmanagedTerritories = player.territories.filter((t) => !t.managerId);
		const availableUnits = player.units
			.map((id) => gameState.units.get(id))
			.filter((unit): unit is IUnit => unit !== undefined)
			.filter((unit) => unit.status === UnitStatus.IDLE);

		for (let i = 0; i < Math.min(unmanagedTerritories.length, availableUnits.length); i++) {
			const action = createAssignToTerritoryAction(
				player.id,
				availableUnits[i].id,
				unmanagedTerritories[i].id
			);
			queueAction(action);
		}
	}

	private updateCooldowns(): void {
		for (const aiState of this.aiPlayers.values()) {
			for (const [decisionId, cooldownEnd] of aiState.decisionCooldowns) {
				if (this.currentTick >= cooldownEnd) {
					aiState.decisionCooldowns.delete(decisionId);
				}
			}
		}
	}

	getAIPlayers(): string[] {
		return Array.from(this.aiPlayers.keys());
	}

	isAIPlayer(playerId: string): boolean {
		return this.aiPlayers.has(playerId);
	}
}

// Create and export a single instance
const aiService = new AIService();
export default aiService;
