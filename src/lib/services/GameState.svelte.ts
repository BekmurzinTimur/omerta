//GameState.svelte.ts
import { SvelteMap } from 'svelte/reactivity';
import { type GameState as GameStateInterface, type Player } from '../models/GameModels';
import { UnitRank, UnitStatus, type IUnit } from '$lib/models/UnitModels';
import { mockUnits } from '$lib/const/mockData';
import type { ITerritory } from '$lib/models/TerritoryModel';
import { DEFAULT_MISSIONS, type IMission } from '$lib/models/MissionModels';

const createInitialState = () => {
	// Start date: January 1, 1960, 00:00
	const startDate = new Date(1960, 0, 1, 0, 0, 0, 0);

	// Create initial players
	const playerOne: Player = {
		id: 'player1',
		name: 'Player 1',
		resources: {
			money: 1000,
			manpower: 500
		},
		territories: [],
		units: [],
		unlockedMissionIds: Object.keys(DEFAULT_MISSIONS),
		color: '#ff0000'
	};

	// Create initial territories
	const territories: ITerritory[] = [];
	for (let x = 0; x < 20; x++) {
		for (let y = 0; y < 20; y++) {
			territories.push({
				id: `territory_${x}-${y}`,
				name: `Territory ${x}-${y}`,
				ownerId: (x === 10 || x === 9) && y === 10 ? 'player1' : null, // Player 1 starts with 1 territory
				position: {
					x: x,
					y: y
				},
				resources: {
					income: 5 + Math.floor(Math.random() * 10),
					manpower: 2 + Math.floor(Math.random() * 5)
				},
				isBeingCaptured: false,
				captureProgress: 0,
				captureInitiator: null,
				managerId: null,
				capturingUnitId: null
			});
		}
	}

	// Assign owned territories to player
	playerOne.territories = territories.filter((t) => t.ownerId === 'player1');

	// Create initial units
	const units: IUnit[] = [
		{
			id: 'unit1',
			name: 'John Doe',
			ownerId: 'player1',
			rank: UnitRank.SOLDIER,
			skills: {
				Muscle: 3,
				Brains: 5,
				Cunning: 6,
				Influence: 9
			},
			experience: 50,
			loyalty: 75,
			heat: 20,
			level: 3,
			cut: 10,
			status: UnitStatus.IDLE,
			image: 1
		},
		{
			id: 'unit2',
			name: 'Jack Doe',
			ownerId: 'player1',
			rank: UnitRank.CAPO,
			skills: {
				Muscle: 4,
				Brains: 6,
				Cunning: 7,
				Influence: 10
			},
			experience: 4,
			loyalty: 5,
			heat: 80,
			level: 6,
			cut: 10,
			status: UnitStatus.IDLE,
			image: 2
		}
	];

	playerOne.units = units;

	// Create maps for efficient lookups
	const playerMap = new SvelteMap<string, Player>();
	playerMap.set(playerOne.id, playerOne);

	const territoryMap = new SvelteMap<string, ITerritory>();
	territories.forEach((territory) => {
		territoryMap.set(territory.id, territory);
	});

	const unitMap = new SvelteMap<string, IUnit>();
	units.forEach((unit) => {
		unitMap.set(unit.id, unit);
	});

	mockUnits.forEach((unit) => {
		unitMap.set(unit.id, unit);
	});

	const missionMap = new SvelteMap<string, IMission>();

	return {
		players: playerMap,
		territories: territoryMap,
		units: unitMap,
		currentDate: startDate,
		isRunning: false,
		tickCount: 0,
		missions: missionMap
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
		if (unit) {
			this.state.units.set(unitId, { ...unit, ...updates });
		}
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
}

export type GameStateType = InstanceType<typeof GameState>;

// Create and export a single instance of GameState
const gameState = new GameState();
export default gameState;
