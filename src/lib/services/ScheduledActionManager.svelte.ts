import { v4 as uuidv4 } from 'uuid';
import { type ScheduledAction, ScheduledActionType } from '../models/ActionModels';
import gameState from './GameState.svelte';
import type { GameState, Player } from '$lib/models/GameModels';
import type { ITerritory } from '$lib/models/TerritoryModel';
import { UnitStatus } from '$lib/models/UnitModels';
import { buildMissionFromPrototype, DEFAULT_MISSIONS } from '$lib/models/MissionModels';
import { getManagerMultiplier } from '$lib/utils/territoryUtils';

let state: GameState = gameState.state;

// Collection of scheduled actions
let scheduledActions = $state<ScheduledAction[]>([]);

// Add a scheduled action
const addScheduledAction = (action: ScheduledAction): void => {
	scheduledActions.push({
		...action,
		id: action.id || uuidv4()
	});
};

// Remove a scheduled action by ID
const removeScheduledAction = (actionId: string): void => {
	scheduledActions = scheduledActions.filter((action) => action.id !== actionId);
};

// Get scheduled actions that should run on a specific tick
const getActionsForTick = (tickCount: number): ScheduledAction[] => {
	return scheduledActions.filter((action) => action.nextExecutionTick <= tickCount);
};

// Execute scheduled actions for the current tick
const processScheduledActions = (currentTick: number): void => {
	const actionsToExecute = getActionsForTick(currentTick);

	console.log(`Processing ${actionsToExecute.length} scheduled actions for tick ${currentTick}`);

	actionsToExecute.forEach((action) => {
		try {
			// Execute the action
			action.execute(state);

			// For recurring actions, update the next execution time
			if (action.isRecurring) {
				action.nextExecutionTick = currentTick + action.interval;
			} else {
				// For one-time actions, remove them after execution
				removeScheduledAction(action.id);
			}
		} catch (error) {
			console.error(`Error executing scheduled action ${action.id}:`, error);
		}
	});
};

// Setup initial scheduled actions
const setupInitialScheduledActions = (): void => {
	// Clear existing scheduled actions
	scheduledActions = [];

	// Generate income every 5 ticks
	addScheduledAction({
		id: 'income-generation',
		type: ScheduledActionType.GENERATE_INCOME,
		interval: 5,
		nextExecutionTick: 5,
		isRecurring: true,
		execute: (state: GameState) => {
			// For each player, generate income based on their territories
			state.players.forEach((player: Player) => {
				let income = 0;

				// Calculate total production from territories
				player.territories.forEach((territory: ITerritory) => {
					const territoryData = state.territories.get(territory.id);
					const manager = state.units.get(territoryData?.managerId || '');
					let territoryMultiplier = 1;
					if (manager) {
						territoryMultiplier = getManagerMultiplier(manager);
						gameState.updateUnit(manager.id, { experience: manager.experience + 5 });
					}
					if (territoryData) {
						income += territoryData.resources.income * territoryMultiplier;
					}
				});

				gameState.updatePlayer(player.id, {
					resources: {
						...player.resources,
						money: player.resources.money + income,
						lastIncome: income
					}
				});

				console.log(`Generated ${income} income for player ${player.id}`);
			});
		}
	});

	// Progress territory captures every tick
	addScheduledAction({
		id: 'capture-progress',
		type: ScheduledActionType.INCREASE_CAPTURE_PROGRESS,
		interval: 1,
		nextExecutionTick: 1,
		isRecurring: true,
		execute: (state: GameState) => {
			state.territories.forEach((territory: ITerritory) => {
				if (!territory.isBeingCaptured) return;

				const unit = territory.capturingUnitId ? state.units.get(territory.capturingUnitId) : null;

				// Abort if the capturing unit is gone or reassigned
				if (
					!unit ||
					unit.ownerId !== territory.captureInitiator || // unit switched sides?
					unit.status !== UnitStatus.EXPAND
				) {
					gameState.updateTerritory(territory.id, {
						isBeingCaptured: false,
						captureProgress: 0,
						captureInitiator: null,
						capturingUnitId: null
					});
					console.log(`Capture of ${territory.id} aborted - missing or invalid unit`);
					return;
				}

				// Advance progress
				const newProgress = territory.captureProgress + 10; // 10% per tick

				if (newProgress >= 100) {
					const playerId = unit.ownerId!;
					const player = state.players.get(playerId);

					if (player) {
						// Transfer ownership
						gameState.updateTerritory(territory.id, {
							ownerId: playerId,
							isBeingCaptured: false,
							captureProgress: 0,
							captureInitiator: null,
							capturingUnitId: null,
							managerId: unit.id // now the manager
						});

						gameState.updatePlayer(playerId, {
							territories: [...player.territories, territory]
						});

						gameState.updateUnit(unit.id, {
							status: UnitStatus.TERRITORY,
							experience: unit.experience + 25
						});

						console.log(`Player ${playerId} captured territory ${territory.id} with ${unit.name}`);
					}
				} else {
					// Simply update progress
					gameState.updateTerritory(territory.id, {
						captureProgress: newProgress
					});
				}
			});
		}
	});

	addScheduledAction({
		id: 'mission-supply',
		type: ScheduledActionType.GENERATE_MISSIONS,
		interval: 5,
		nextExecutionTick: 5,
		isRecurring: true,
		execute: (state) => {
			state.players.forEach((player: Player) => {
				const proto = DEFAULT_MISSIONS[Math.floor(Math.random() * DEFAULT_MISSIONS.length)];
				const mission = buildMissionFromPrototype(player.id, proto);
				state.missions.set(mission.id, mission);
				console.log(`Added new mission "${mission.info.name}" for ${player.id}`);
			});
		}
	});

	console.log('Initial scheduled actions set up');
};

// Export the scheduled action manager functions
export {
	addScheduledAction,
	removeScheduledAction,
	processScheduledActions,
	setupInitialScheduledActions
};
