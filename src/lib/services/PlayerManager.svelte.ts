// PlayerManager.svelte.ts (Updated to support AI)
import type { Player } from '../models/GameModels';

export enum PlayerControllerType {
	HUMAN = 'HUMAN',
	AI = 'AI',
	NONE = 'NONE'
}

export interface PlayerSlot {
	id: string;
	isActive: boolean;
	player: Player | null;
	controllerType: PlayerControllerType;
}

class PlayerManager {
	private slots = $state<PlayerSlot[]>([]);
	private viewingPlayerId = $state<string | null>(null);

	constructor() {
		console.log('PlayerManager created');
	}

	/**
	 * Initialize player slots
	 */
	initializeSlots(count: number): void {
		this.slots = Array.from({ length: count }, (_, index) => ({
			id: `player${index + 1}`,
			isActive: false,
			player: null,
			controllerType: PlayerControllerType.NONE
		}));
	}

	/**
	 * Assign a player to a slot
	 */
	assignPlayerToSlot(
		slotId: string,
		player: Player,
		controllerType: PlayerControllerType
	): boolean {
		const slot = this.slots.find((s) => s.id === slotId);
		if (!slot) return false;

		slot.isActive = true;
		slot.player = player;
		slot.controllerType = controllerType;
		return true;
	}

	/**
	 * Remove player from slot
	 */
	removePlayerFromSlot(slotId: string): boolean {
		const slot = this.slots.find((s) => s.id === slotId);
		if (!slot) return false;

		slot.isActive = false;
		slot.player = null;
		slot.controllerType = PlayerControllerType.NONE;
		return true;
	}

	/**
	 * Get all slots
	 */
	getSlots(): PlayerSlot[] {
		return this.slots;
	}

	/**
	 * Get active slots only
	 */
	getActiveSlots(): PlayerSlot[] {
		return this.slots.filter((slot) => slot.isActive);
	}

	/**
	 * Get AI player slots
	 */
	getAISlots(): PlayerSlot[] {
		return this.slots.filter(
			(slot) => slot.isActive && slot.controllerType === PlayerControllerType.AI
		);
	}

	getAIPlayersId(): string[] {
		return this.getAISlots().map((slot) => slot.id);
	}

	getAIPlayers(): Player[] {
		return this.getAISlots()
			.map((slot) => slot.player)
			.filter((_) => !!_);
	}
	/**
	 * Get human player slots
	 */
	getHumanSlots(): PlayerSlot[] {
		return this.slots.filter(
			(slot) => slot.isActive && slot.controllerType === PlayerControllerType.HUMAN
		);
	}

	/**
	 * Check if a player is AI controlled
	 */
	isAIPlayer(playerId: string): boolean {
		const slot = this.slots.find((s) => s.id === playerId);
		return slot?.controllerType === PlayerControllerType.AI || false;
	}

	/**
	 * Set the viewing player (for UI)
	 */
	setViewingPlayer(playerId: string): void {
		this.viewingPlayerId = playerId;
	}

	/**
	 * Get the viewing player ID
	 */
	getViewingPlayerId(): string | null {
		return this.viewingPlayerId;
	}

	/**
	 * Get the viewing player object
	 */
	getViewingPlayer(): Player | null {
		if (!this.viewingPlayerId) return null;
		const slot = this.slots.find((s) => s.id === this.viewingPlayerId);
		return slot?.player || null;
	}

	/**
	 * Reset player manager
	 */
	reset(): void {
		this.slots = [];
		this.viewingPlayerId = null;
	}

	/**
	 * Update player in slot
	 */
	updatePlayerInSlot(playerId: string, player: Player): void {
		const slot = this.slots.find((s) => s.id === playerId);
		if (slot) {
			slot.player = player;
		}
	}
}

// Create and export a single instance
const playerManager = new PlayerManager();
export default playerManager;
