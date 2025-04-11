import { SvelteMap } from 'svelte/reactivity';
import {
	type GameState as GameStateInterface,
	type Player,
	type Territory,
	type Unit,
	UnitStatus,
	UnitType
} from '../models/GameModels';

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
		units: []
	};

	// Create initial territories
	const territories: Territory[] = [];
	for (let i = 0; i < 10; i++) {
		territories.push({
			id: `territory${i}`,
			name: `Territory ${i}`,
			ownerId: i < 3 ? 'player1' : null, // Player 1 starts with 3 territories
			position: {
				x: Math.floor(i / 3) * 100,
				y: (i % 3) * 100
			},
			resources: {
				production: 5 + Math.floor(Math.random() * 10),
				manpower: 2 + Math.floor(Math.random() * 5)
			},
			isBeingCaptured: false,
			captureProgress: 0,
			captureInitiator: null
		});
	}

	// Assign owned territories to player
	playerOne.territories = territories.filter((t) => t.ownerId === 'player1');

	// Create initial units
	const units: Unit[] = [
		{
			id: 'unit1',
			type: UnitType.INFANTRY,
			ownerId: 'player1',
			position: {
				x: 0,
				y: 0
			},
			status: UnitStatus.IDLE,
			strength: 10,
			maintenanceCost: 5
		}
	];

	playerOne.units = units;

	// Create maps for efficient lookups
	const playerMap = new SvelteMap<string, Player>();
	playerMap.set(playerOne.id, playerOne);

	const territoryMap = new SvelteMap<string, Territory>();
	territories.forEach((territory) => {
		territoryMap.set(territory.id, territory);
	});

	const unitMap = new SvelteMap<string, Unit>();
	units.forEach((unit) => {
		unitMap.set(unit.id, unit);
	});
	return {
		players: playerMap,
		territories: territoryMap,
		units: unitMap,
		currentDate: startDate,
		isRunning: false,
		tickCount: 0
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
	updateTerritory(territoryId: string, updates: Partial<Territory>): void {
		const territory = this.state.territories.get(territoryId);
		if (territory) {
			this.state.territories.set(territoryId, { ...territory, ...updates });
		}
	}

	/**
	 * Update a unit
	 */
	updateUnit(unitId: string, updates: Partial<Unit>): void {
		const unit = this.state.units.get(unitId);
		if (unit) {
			this.state.units.set(unitId, { ...unit, ...updates });
		}
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
	getTerritory(territoryId: string): Territory | undefined {
		return this.state.territories.get(territoryId);
	}

	/**
	 * Get a unit by ID
	 */
	getUnit(unitId: string): Unit | undefined {
		return this.state.units.get(unitId);
	}

	/**
	 * Get all territories
	 */
	getAllTerritories(): Territory[] {
		return Array.from(this.state.territories.values());
	}

	/**
	 * Get all units
	 */
	getAllUnits(): Unit[] {
		return Array.from(this.state.units.values());
	}
}

export type GameStateType = InstanceType<typeof GameState>;

// Create and export a single instance of GameState
const gameState = new GameState();
export default gameState;
