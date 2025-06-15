// GameState.svelte.ts (Updated with AI support)
import { SvelteMap } from 'svelte/reactivity';
import { type GameState as GameStateInterface, type Player } from '../models/GameModels';
import { type IUnit } from '$lib/models/UnitModels';
import type { ITerritory } from '$lib/models/TerritoryModel';
import { type IMission } from '$lib/models/MissionModels';
import {
	disloyalUnit,
	generateStartingAssociates,
	generateStartingUnits,
	STARTING_COMPOSITION,
	upgradeUnit
} from '$lib/utils/unitUtils';
import { BORDER_RANDOMNESS, MAP_HEIGHT, MAP_WIDTH, REGIONS } from '$lib/const/globalConstants';
import {
	addRegionBorders,
	assignRegionsToTerritories,
	createRegionsFromGrid,
	generateRegionGrid
} from '$lib/utils/regionsUtils';
import playerManager, { PlayerControllerType } from './PlayerManager.svelte';

// Player colors for up to 4 players
const playerColors = ['#ff0000', '#0000ff', '#00ff00', '#ffff00'];

// Starting positions for each player (corners of the map)
const startingPositions = [
	{ x: 0, y: 0 }, // Top-left
	{ x: MAP_WIDTH - 1, y: 0 }, // Top-right
	{ x: 0, y: MAP_HEIGHT - 1 }, // Bottom-left
	{ x: MAP_WIDTH - 1, y: MAP_HEIGHT - 1 } // Bottom-right
];

const createInitialState = () => {
	// Start date: January 1, 1960, 00:00
	const startDate = new Date(1960, 0, 1, 0, 0, 0, 0);

	const playerMap = new SvelteMap<string, Player>();
	const regionGrid = generateRegionGrid(REGIONS, MAP_WIDTH, BORDER_RANDOMNESS);

	// Create initial territories
	const territories: ITerritory[] = [];
	for (let x = 0; x < MAP_WIDTH; x++) {
		for (let y = 0; y < MAP_HEIGHT; y++) {
			territories.push({
				id: `${x}-${y}`,
				name: `Territory ${x}-${y}`,
				ownerId: null, // Will be assigned based on active players
				position: {
					x: x,
					y: y
				},
				regionId: '',
				resources: {
					income: 1000 + (Math.floor(Math.random() * 10) - 5) * 100
				},
				isBeingCaptured: false,
				captureProgress: 0,
				captureInitiator: null,
				managerId: null,
				capturingUnitId: null,
				borders: {
					top: false,
					right: false,
					bottom: false,
					left: false
				}
			});
		}
	}

	const regions = createRegionsFromGrid(regionGrid);

	const territoryMap = new SvelteMap<string, ITerritory>();
	territories.forEach((territory) => {
		territoryMap.set(territory.id, territory);
	});
	assignRegionsToTerritories(territoryMap, regions);
	addRegionBorders(territoryMap);

	const unitMap = new SvelteMap<string, IUnit>();
	const missionMap = new SvelteMap<string, IMission>();

	// Generate starting associates (neutral units)
	const startingAssociates = generateStartingAssociates(15);
	startingAssociates.forEach((unit) => {
		unitMap.set(unit.id, unit);
	});

	return {
		players: playerMap,
		territories: territoryMap,
		units: unitMap,
		currentDate: startDate,
		isRunning: false,
		tickCount: 0,
		missions: missionMap,
		regions,
		hasEnded: false
	};
};

/**
 * GameState class - Encapsulates all game state and related operations
 */
class GameState {
	state: GameStateInterface = $state(createInitialState());

	constructor() {
		this.initializeWithPlayers([
			{
				playerId: 'player1',
				controllerType: PlayerControllerType.HUMAN,
				name: 'Human player'
			},
			{
				playerId: 'player2',
				controllerType: PlayerControllerType.AI,
				name: 'AI Player 1'
			},
			{
				playerId: 'player3',
				controllerType: PlayerControllerType.AI,
				name: 'AI Player 2'
			},
			{
				playerId: 'player4',
				controllerType: PlayerControllerType.NONE,
				name: 'Empty player'
			}
		]);
	}

	/**
	 * Initialize game with specific player configuration
	 * @param playerConfigs Array of player configurations
	 */
	initializeWithPlayers(
		playerConfigs: Array<{
			playerId: string;
			controllerType: PlayerControllerType;
			name?: string;
		}>
	): void {
		console.log('init with players', playerConfigs);
		// Reset player manager and AI service
		playerManager.reset();

		// Initialize with 4 player slots
		playerManager.initializeSlots(4);

		// Configure players
		playerConfigs.forEach((config) => {
			// Create a temporary player object for slot assignment
			const tempPlayer: Player = {
				id: config.playerId,
				name: config.name || `Player ${config.playerId}`,
				resources: { money: 0, lastIncome: 0, heat: 0, awareness: 0 },
				territories: [],
				units: [],
				color: '#000000'
			};

			playerManager.assignPlayerToSlot(config.playerId, tempPlayer, config.controllerType);
		});
		playerManager.setViewingPlayer(playerConfigs[0].playerId);

		// Initialize players based on active slots
		const activeSlots = playerManager.getActiveSlots();

		activeSlots.forEach((slot, index) => {
			if (index >= startingPositions.length) return; // Safety check

			const playerName =
				slot.controllerType === PlayerControllerType.AI
					? `AI Family ${index}`
					: `Player ${index + 1}`;

			const player: Player = {
				id: slot.id,
				name: playerName,
				resources: {
					money: 10500,
					lastIncome: 0,
					heat: 0,
					awareness: 0
				},
				territories: [],
				units: [],
				color: playerColors[index] || '#888888'
			};

			// Assign starting territories
			const startPos = startingPositions[index];
			const startingTerritories = [`${startPos.x}-${startPos.y}`];

			startingTerritories.forEach((territoryId) => {
				const territory = this.state.territories.get(territoryId);
				if (territory) {
					territory.ownerId = player.id;
					player.territories.push(territory);
				}
			});

			// Generate starting units for this player
			const startingUnits = generateStartingUnits(STARTING_COMPOSITION);
			startingUnits.forEach((unit) => {
				unit.ownerId = player.id;
				this.state.units.set(unit.id, unit);
				player.units.push(unit.id);
			});

			this.state.players.set(player.id, player);
		});
		console.log([...this.state.players.keys()]);
	}

	/**
	 * Get the current state
	 */
	get currentState(): GameStateInterface {
		return this.state;
	}

	/**
	 * Advance the game date by 2 hours
	 */
	advanceGameDate(): void {
		// Add 2 hours (2 hours = 2 * 60 * 60 * 1000 milliseconds)
		const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
		this.state.currentDate = new Date(this.state.currentDate.getTime() + TWO_HOURS_MS);
	}

	/**
	 * Format the game date as a string
	 */
	formatGameDate(date: Date): string {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const hour = date.getHours().toString().padStart(2, '0');

		return `${year}-${month}-${day} ${hour}:00`;
	}

	/**
	 * Reset game state
	 */
	resetState(): void {
		console.log('reseting state');
		this.state = createInitialState();
	}

	/**
	 * Update a player
	 */
	updatePlayer(playerId: string, updates: Partial<Player>): void {
		const player = this.state.players.get(playerId);
		if (player) {
			this.state.players.set(playerId, { ...player, ...updates });
		}
	}

	/**
	 * Update a territory
	 */
	updateTerritory(territoryId: string, updates: Partial<ITerritory>): void {
		const territory = this.state.territories.get(territoryId);
		if (territory) {
			this.state.territories.set(territoryId, { ...territory, ...updates });
		}
	}

	/**
	 * Update a unit
	 */
	updateUnit(unitId: string, updates: Partial<IUnit>): void {
		const unit = this.state.units.get(unitId);
		if (!unit) return console.error('Cannott update unit. Unit doesnt exist');
		const newUnit = { ...unit, ...updates };
		if (newUnit.experience >= 100 && newUnit.level < 10) {
			upgradeUnit(newUnit);
		}
		// if (newUnit.heat >= 100) {
		// 	imprisonUnit(newUnit);
		// }
		if (newUnit.loyalty <= 0) {
			const player = this.state.players.get(newUnit.ownerId || '');
			if (player) {
				disloyalUnit(newUnit);
				this.removeUnitFromPlayer(player.id, newUnit.id);
			}
		}
		this.state.units.set(unitId, newUnit);
	}
	updateMission(missionId: string, updates: Partial<IMission>): void {
		const m = this.state.missions.get(missionId);
		if (m) this.state.missions.set(missionId, { ...m, ...updates });
	}
	/**
	 * Get a player by ID
	 */
	getPlayer(playerId: string): Player | undefined {
		return this.state.players.get(playerId);
	}

	/**
	 * Get a territory by ID
	 */
	getTerritory(territoryId: string): ITerritory | undefined {
		return this.state.territories.get(territoryId);
	}

	/**
	 * Get a unit by ID
	 */
	getUnit(unitId: string): IUnit | undefined {
		return this.state.units.get(unitId);
	}

	/**
	 * Get all territories
	 */
	getAllTerritories(): Map<string, ITerritory> {
		return this.state.territories;
	}

	/**
	 * Get all units
	 */
	getAllUnits(): IUnit[] {
		return Array.from(this.state.units.values());
	}

	getAllUnitsMap(): Map<string, IUnit> {
		return this.state.units;
	}

	/** Get missions belonging to a player */
	getPlayerMissions(playerId: string): IMission[] {
		return Array.from(this.state.missions.values()).filter((m) => m.playerId === playerId);
	}
	removeUnitFromPlayer(playerId: string, unitId: string) {
		const player = this.state.players.get(playerId);
		if (!player) return;
		player.units = player?.units.filter((item) => item !== unitId);
		this.updatePlayer(playerId, player);
	}
}

export type GameStateType = InstanceType<typeof GameState>;

// Create and export a single instance of GameState
const gameState = new GameState();
export default gameState;
