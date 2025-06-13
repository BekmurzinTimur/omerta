// AIDecisions.ts
import { UnitRank } from '../../models/UnitModels';
import type { AIDecisionSet } from './AIService.svelte';

export const AI_DECISIONS: AIDecisionSet = {
	decisions: [
		{
			id: 'launch_suitable_mission',
			name: 'Launch Suitable Mission',
			triggers: [
				{ type: 'suitable_mission_available', minSuitability: 0.7 },
				{ type: 'idle_units', operator: '>=', value: 1 },
				{ type: 'active_missions', operator: '<', value: 3 },
				{ type: 'mission_risk_acceptable', maxRisk: 'medium' }
			],
			baseWeight: 60,
			weightModifiers: [
				{
					condition: { type: 'has_money', amount: 50000 },
					multiplier: 0.8 // Less urgent when rich
				},
				{
					condition: { type: 'heat_level', operator: '<', value: 30 },
					multiplier: 1.3 // More willing when heat is low
				},
				{
					condition: { type: 'territory_count', operator: '<', value: 2 },
					multiplier: 1.5 // Need money for expansion
				}
			],
			actions: [{ type: 'launch_best_mission' }],
			cooldown: 5
		},
		{
			id: 'hire_associate',
			name: 'Hire Associate',
			triggers: [
				{ type: 'can_afford_unit', rank: UnitRank.ASSOCIATE },
				{ type: 'unit_count', operator: '<', value: 8 },
				{ type: 'heat_level', operator: '<', value: 50 }
			],
			baseWeight: 30,
			weightModifiers: [
				{
					condition: { type: 'territory_count', operator: '>', value: 2 },
					multiplier: 1.5 // More territories need more units
				},
				{
					condition: { type: 'idle_units', operator: '<', value: 2 },
					multiplier: 2.0 // Desperate for units
				},
				{
					condition: { type: 'unit_count', operator: '<', value: 3 },
					multiplier: 2.5 // Very few units
				}
			],
			actions: [{ type: 'hire_unit', rank: UnitRank.ASSOCIATE }],
			cooldown: 8
		},
		{
			id: 'hire_soldier',
			name: 'Hire Soldier',
			triggers: [
				{ type: 'can_afford_unit', rank: UnitRank.SOLDIER },
				{ type: 'unit_rank_count', rank: UnitRank.SOLDIER, operator: '<', value: 4 },
				{ type: 'unit_count', operator: '>=', value: 3 }
			],
			baseWeight: 25,
			weightModifiers: [
				{
					condition: { type: 'territory_count', operator: '>', value: 3 },
					multiplier: 1.8 // Need soldiers for territory control
				},
				{
					condition: { type: 'awareness_level', operator: '>', value: 40 },
					multiplier: 1.6 // Need protection when being watched
				}
			],
			actions: [{ type: 'hire_unit', rank: UnitRank.SOLDIER }],
			cooldown: 12
		},
		{
			id: 'promote_loyal_unit',
			name: 'Promote Loyal Unit',
			triggers: [
				{ type: 'has_money', amount: 10000 },
				{ type: 'high_skill_unit_available', skillLevel: 15 },
				{ type: 'unit_rank_count', rank: UnitRank.ASSOCIATE, operator: '>=', value: 2 }
			],
			baseWeight: 25,
			weightModifiers: [
				{
					condition: { type: 'low_loyalty_units', threshold: 60, count: 1 },
					multiplier: 2.0 // Loyalty crisis - promote to improve morale
				},
				{
					condition: { type: 'unit_rank_count', rank: UnitRank.SOLDIER, operator: '<', value: 2 },
					multiplier: 1.8 // Need more ranked units
				}
			],
			actions: [{ type: 'promote_unit' }],
			cooldown: 15
		},
		{
			id: 'capture_territory',
			name: 'Capture Territory',
			triggers: [
				{ type: 'capturable_territory_nearby' },
				{ type: 'idle_units', operator: '>=', value: 1 },
				{ type: 'can_afford_capture' },
				{ type: 'heat_level', operator: '<', value: 40 }
			],
			baseWeight: 45,
			weightModifiers: [
				{
					condition: { type: 'territory_count', operator: '<', value: 3 },
					multiplier: 1.8 // Early expansion is critical
				},
				{
					condition: { type: 'territory_count', operator: '<', value: 5 },
					multiplier: 1.4 // Still expanding
				},
				{
					condition: { type: 'awareness_level', operator: '>', value: 60 },
					multiplier: 0.6 // Too much attention
				},
				{
					condition: { type: 'unit_rank_count', rank: UnitRank.SOLDIER, operator: '>=', value: 2 },
					multiplier: 1.3 // Have muscle for territory capture
				}
			],
			actions: [{ type: 'capture_territory' }],
			cooldown: 12
		},
		{
			id: 'assign_managers',
			name: 'Assign Territory Managers',
			triggers: [
				{ type: 'unmanaged_territories', count: 1 },
				{ type: 'idle_units', operator: '>=', value: 1 }
			],
			baseWeight: 35,
			weightModifiers: [
				{
					condition: { type: 'territory_count', operator: '>', value: 2 },
					multiplier: 1.6 // More territories = more important
				},
				{
					condition: { type: 'unmanaged_territories', count: 3 },
					multiplier: 2.0 // Many unmanaged territories
				}
			],
			actions: [{ type: 'assign_territory_manager' }],
			cooldown: 3
		},
		{
			id: 'conservative_mission_when_hot',
			name: 'Conservative Mission (High Heat)',
			triggers: [
				{ type: 'suitable_mission_available', minSuitability: 0.9 },
				{ type: 'heat_level', operator: '>', value: 50 },
				{ type: 'idle_units', operator: '>=', value: 2 },
				{ type: 'mission_risk_acceptable', maxRisk: 'low' }
			],
			baseWeight: 20,
			weightModifiers: [
				{
					condition: { type: 'has_money', amount: 20000 },
					multiplier: 0.5 // Don't need money when rich and hot
				}
			],
			actions: [{ type: 'launch_best_mission' }],
			cooldown: 10
		},
		{
			id: 'aggressive_expansion',
			name: 'Aggressive Expansion',
			triggers: [
				{ type: 'capturable_territory_nearby' },
				{ type: 'unit_count', operator: '>=', value: 6 },
				{ type: 'has_money', amount: 25000 },
				{ type: 'heat_level', operator: '<', value: 25 },
				{ type: 'territory_count', operator: '<', value: 8 }
			],
			baseWeight: 40,
			weightModifiers: [
				{
					condition: { type: 'unit_rank_count', rank: UnitRank.SOLDIER, operator: '>=', value: 3 },
					multiplier: 1.5 // Have military strength
				}
			],
			actions: [{ type: 'capture_territory' }],
			cooldown: 8
		},
		{
			id: 'build_reputation',
			name: 'Build Reputation through Missions',
			triggers: [
				{ type: 'suitable_mission_available', minSuitability: 0.8 },
				{ type: 'territory_count', operator: '>=', value: 2 },
				{ type: 'idle_units', operator: '>=', value: 2 }
			],
			baseWeight: 30,
			weightModifiers: [
				{
					condition: { type: 'unit_rank_count', rank: UnitRank.ASSOCIATE, operator: '>', value: 4 },
					multiplier: 1.4 // Many low-rank units need experience
				},
				{
					condition: { type: 'has_money', amount: 30000 },
					multiplier: 1.2 // Can afford to focus on reputation
				}
			],
			actions: [{ type: 'launch_best_mission' }],
			cooldown: 6
		},
		{
			id: 'emergency_hire',
			name: 'Emergency Hiring',
			triggers: [
				{ type: 'unit_count', operator: '<', value: 3 },
				{ type: 'can_afford_unit', rank: UnitRank.ASSOCIATE },
				{ type: 'territory_count', operator: '>', value: 0 }
			],
			baseWeight: 80, // High priority
			weightModifiers: [
				{
					condition: { type: 'unit_count', operator: '<', value: 2 },
					multiplier: 2.0 // Critical unit shortage
				}
			],
			actions: [{ type: 'hire_unit', rank: UnitRank.ASSOCIATE }],
			cooldown: 5
		}
	]
};
