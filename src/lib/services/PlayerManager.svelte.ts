// PlayerManager.svelte.ts
import type { Player } from '../models/GameModels';

export enum PlayerControllerType {
	HUMAN = 'HUMAN',
	AI = 'AI',
	NONE = 'NONE' // Empty slot
}

export interface PlayerSlot {
	id: string;
	controllerType: PlayerControllerType;
	player: Player | null;
	isActive: boolean;
}

export interface IPlayerController {
	playerId: string;
	type: PlayerControllerType;
	// Future AI/Network controllers will implement this interface
	// requestActions?: () => Action[];
}

/**
 * PlayerManager - Central registry for all players in the game
 *
 * This manager handles player slots, controller types, and provides
 * a unified API for querying and mutating player state. It's designed
 * to support both human and AI players transparently.
 *
 * Following the Paradox Interactive model, any slot can be:
 * - Controlled by a human player
 * - Controlled by an AI
 * - Empty (no player)
 */
class PlayerManager {
	private slots = $state<PlayerSlot[]>([]);
	private controllers = new Map<string, IPlayerController>();
	private viewingPlayerId = $state<string>('');

	constructor() {}

	/**
	 * Initialize player slots
	 */
	initializeSlots(count: number): void {
		this.slots = [];
		for (let i = 0; i < count; i++) {
			this.slots.push({
				id: `player${i + 1}`,
				controllerType: PlayerControllerType.NONE,
				player: null,
				isActive: false
			});
		}
	}

	/**
	 * Get all player slots
	 */
	getSlots(): PlayerSlot[] {
		return this.slots;
	}

	/**
	 * Get active players (slots with players assigned)
	 */
	getActivePlayers(): Player[] {
		return this.slots.filter((slot) => slot.isActive && slot.player).map((slot) => slot.player!);
	}

	/**
	 * Get active player IDs
	 */
	getActivePlayerIds(): string[] {
		return this.slots.filter((slot) => slot.isActive).map((slot) => slot.id);
	}

	/**
	 * Get a specific player by ID
	 */
	getPlayer(playerId: string): Player | null {
		const slot = this.slots.find((s) => s.id === playerId);
		return slot?.player || null;
	}

	/**
	 * Get a player slot by ID
	 */
	getSlot(playerId: string): PlayerSlot | null {
		return this.slots.find((s) => s.id === playerId) || null;
	}

	/**
	 * Assign a player to a slot
	 */
	assignPlayerToSlot(playerId: string, player: Player, controllerType: PlayerControllerType): void {
		const slot = this.slots.find((s) => s.id === playerId);
		console.log('assigning', playerId, player, controllerType, slot);
		if (slot) {
			slot.player = player;
			slot.controllerType = controllerType;
			slot.isActive = true;

			// Create controller
			this.controllers.set(playerId, {
				playerId,
				type: controllerType
			});
		}
	}

	/**
	 * Remove a player from a slot
	 */
	removePlayerFromSlot(playerId: string): void {
		const slot = this.slots.find((s) => s.id === playerId);
		if (slot) {
			slot.player = null;
			slot.controllerType = PlayerControllerType.NONE;
			slot.isActive = false;
			this.controllers.delete(playerId);
		}
	}

	/**
	 * Get controller for a player
	 */
	getController(playerId: string): IPlayerController | null {
		return this.controllers.get(playerId) || null;
	}

	/**
	 * Set which player the human is currently viewing/controlling
	 * (For UI purposes - doesn't affect game logic)
	 */
	setViewingPlayer(playerId: string): void {
		if (this.getSlot(playerId)?.isActive) {
			this.viewingPlayerId = playerId;
		}
	}

	/**
	 * Get the currently viewing player ID
	 */
	getViewingPlayerId(): string {
		return this.viewingPlayerId;
	}

	/**
	 * Get the currently viewing player
	 */
	getViewingPlayer(): Player | null {
		return this.getPlayer(this.viewingPlayerId);
	}

	/**
	 * Check if a player is human-controlled
	 */
	isHumanPlayer(playerId: string): boolean {
		const slot = this.getSlot(playerId);
		return slot?.controllerType === PlayerControllerType.HUMAN;
	}

	/**
	 * Check if a player is AI-controlled
	 */
	isAIPlayer(playerId: string): boolean {
		const slot = this.getSlot(playerId);
		return slot?.controllerType === PlayerControllerType.AI;
	}

	/**
	 * Get all human players
	 */
	getHumanPlayers(): Player[] {
		return this.slots
			.filter((slot) => slot.controllerType === PlayerControllerType.HUMAN && slot.player)
			.map((slot) => slot.player!);
	}

	/**
	 * Get all AI players
	 */
	getAIPlayers(): Player[] {
		return this.slots
			.filter((slot) => slot.controllerType === PlayerControllerType.AI && slot.player)
			.map((slot) => slot.player!);
	}

	/**
	 * Reset all slots
	 */
	reset(): void {
		this.initializeSlots(4);
		this.controllers.clear();
		this.viewingPlayerId = '';
	}
}

// Export singleton instance
const playerManager = new PlayerManager();
export default playerManager;

// Export type for dependency injection
export type PlayerManagerType = InstanceType<typeof PlayerManager>;
