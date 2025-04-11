import { v4 as uuidv4 } from 'uuid';
import { type ScheduledAction, ScheduledActionType } from '../models/ActionModels';
import gameState from './GameState.svelte';
import type { GameState, Player, Territory } from '$lib/models/GameModels';

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
				let totalProduction = 0;

				// Calculate total production from territories
				player.territories.forEach((territory: Territory) => {
					const territoryData = state.territories.get(territory.id);
					if (territoryData) {
						totalProduction += territoryData.resources.production;
					}
				});

				// Update player's money
				const income = totalProduction * 10; // 10 money per production point
				gameState.updatePlayer(player.id, {
					resources: {
						...player.resources,
						money: player.resources.money + income
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
			// Find all territories being captured
			state.territories.forEach((territory: Territory) => {
				if (territory.isBeingCaptured && territory.captureInitiator) {
					// Increase capture progress
					const newProgress = territory.captureProgress + 10; // 10% per tick

					if (newProgress >= 100) {
						// Capture complete
						const playerId = territory.captureInitiator;
						const player = state.players.get(playerId);

						if (player) {
							// Update territory owner
							gameState.updateTerritory(territory.id, {
								ownerId: playerId,
								isBeingCaptured: false,
								captureProgress: 0,
								captureInitiator: null
							});

							// Add territory to player's territories
							gameState.updatePlayer(playerId, {
								territories: [...player.territories, territory]
							});

							console.log(`Player ${playerId} completed capture of territory ${territory.id}`);
						}
					} else {
						// Update progress
						gameState.updateTerritory(territory.id, {
							captureProgress: newProgress
						});
					}
				}
			});
		}
	});

	// Collect maintenance costs every 10 ticks
	addScheduledAction({
		id: 'maintenance-costs',
		type: ScheduledActionType.MAINTENANCE_COST,
		interval: 10,
		nextExecutionTick: 10,
		isRecurring: true,
		execute: (state: GameState) => {
			// For each player, collect maintenance costs for units
			state.players.forEach((player: Player) => {
				let totalMaintenance = 0;

				// Calculate total maintenance cost
				player.units.forEach((unit) => {
					totalMaintenance += unit.maintenanceCost;
				});

				// Update player's money
				gameState.updatePlayer(player.id, {
					resources: {
						...player.resources,
						money: player.resources.money - totalMaintenance
					}
				});

				console.log(`Collected ${totalMaintenance} maintenance costs from player ${player.id}`);
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
