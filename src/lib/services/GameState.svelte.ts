//GameState.svelte.ts
import { SvelteMap } from 'svelte/reactivity';
import { type GameState as GameStateInterface, type Player } from '../models/GameModels';
import { type IUnit } from '$lib/models/UnitModels';
import type { ITerritory } from '$lib/models/TerritoryModel';
import {
	buildMissionFromPrototype,
	DEFAULT_MISSIONS,
	type IMission
} from '$lib/models/MissionModels';
import {
	disloyalUnit,
	generateStartingAssociates,
	generateStartingUnits,
	imprisonUnit,
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

const createInitialState = () => {
	// Start date: January 1, 1960, 00:00
	const startDate = new Date(1960, 0, 1, 0, 0, 0, 0);

	// Create initial players
	const playerOne: Player = {
		id: 'player1',
		name: 'Player 1',
		resources: {
			money: 10500,
			lastIncome: 0,
			heat: 0
		},
		territories: [],
		units: [],
		color: '#ff0000'
	};
	const regionGrid = generateRegionGrid(REGIONS, MAP_WIDTH, BORDER_RANDOMNESS);

	// Create initial territories
	const territories: ITerritory[] = [];
	for (let x = 0; x < MAP_WIDTH; x++) {
		for (let y = 0; y < MAP_HEIGHT; y++) {
			territories.push({
				id: `${x}-${y}`,
				name: `Territory ${x}-${y}`,
				ownerId: (x === 5 || x === 4) && y === 4 ? 'player1' : null, // Player 1 starts with 1 territory
				position: {
					x: x,
					y: y
				},
				regionId: '',
				resources: {
					income: 5000 + (Math.floor(Math.random() * 50) - 25) * 100
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

	// Assign owned territories to player
	playerOne.territories = territories.filter((t) => t.ownerId === 'player1');

	const territoryMap = new SvelteMap<string, ITerritory>();
	territories.forEach((territory) => {
		territoryMap.set(territory.id, territory);
	});
	assignRegionsToTerritories(territoryMap, regions);
	addRegionBorders(territoryMap);
	const unitMap = new SvelteMap<string, IUnit>();

	const startingUnits = generateStartingUnits(STARTING_COMPOSITION);
	startingUnits.forEach((unit) => {
		unit.ownerId = playerOne.id;
		unitMap.set(unit.id, unit);
	});

	playerOne.units = startingUnits.map((unit) => unit.id);

	// Create maps for efficient lookups
	const playerMap = new SvelteMap<string, Player>();
	playerMap.set(playerOne.id, playerOne);

	const missionMap = new SvelteMap<string, IMission>();
	playerMap.forEach((_, playerId) => {
		const proto = DEFAULT_MISSIONS[0]; // first prototype for now
		const mission = buildMissionFromPrototype(playerMap.get(playerId)!.id, proto);
		missionMap.set(mission.id, mission);
	});

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
		regions
	};
};
/**
 * GameState class - Encapsulates all game state and related operations
 */
class GameState {
	state: GameStateInterface = $state(createInitialState());

	constructor() {}

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
		if (!unit) return console.error('Cant updat unit. Unit doesnt exist');
		const newUnit = { ...unit, ...updates };
		if (newUnit.experience >= 100 && newUnit.level < 10) {
			upgradeUnit(newUnit);
		}
		if (newUnit.heat >= 100) {
			imprisonUnit(newUnit);
		}
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
