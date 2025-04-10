import gameState from './GameState.svelte';
import { processActions } from './ActionManager.svelte';
import {
	processScheduledActions,
	setupInitialScheduledActions
} from './ScheduledActionManager.svelte';

class GameService {
	// Game tick interval in milliseconds
	private readonly TICK_INTERVAL: number = 1000;

	// Timer ID
	private gameLoopTimerId: number | null = null;

	// Game loop status
	isRunning = $state(false);

	// Current FPS
	currentFps = $state(0);
	lastTickTime = $state(0);

	constructor() {
		console.log('GameService created');
	}

	// Initialize the game
	initGame(): void {
		console.log('Initializing game');

		// Set up initial scheduled actions
		setupInitialScheduledActions();

		console.log('Game initialized');
	}

	// Start the game loop
	startGameLoop(): void {
		if (this.isRunning) {
			console.warn('Game loop is already running');
			return;
		}

		console.log('Starting game loop');

		this.isRunning = true;
		gameState.state.isRunning = true;

		// Start the game loop
		this.lastTickTime = Date.now();
		this.gameLoopTimerId = window.setInterval(() => this.gameTick(), this.TICK_INTERVAL);
	}

	// Stop the game loop
	stopGameLoop(): void {
		if (!this.isRunning) {
			console.warn('Game loop is not running');
			return;
		}

		console.log('Stopping game loop');

		this.isRunning = false;
		gameState.state.isRunning = false;

		// Clear the interval
		if (this.gameLoopTimerId !== null) {
			window.clearInterval(this.gameLoopTimerId);
			this.gameLoopTimerId = null;
		}
	}

	// Main game tick function
	private gameTick(): void {
		const startTime = Date.now();
		const tickDelta = startTime - this.lastTickTime;
		this.lastTickTime = startTime;

		// Calculate current FPS
		this.currentFps = Math.round(1000 / tickDelta);

		// Increment tick count
		gameState.state.tickCount++;

		console.log(`=== Tick ${gameState.state.tickCount} ===`);

		// 1. Advance game date
		gameState.advanceGameDate();

		// 2. Process player-initiated actions
		processActions();

		// 3. Process scheduled actions
		processScheduledActions(gameState.state.tickCount);

		// 4. Any additional processing needed

		const endTime = Date.now();
		const tickProcessingTime = endTime - startTime;

		console.log(`Tick processing took ${tickProcessingTime}ms (FPS: ${this.currentFps})`);

		// Check if tick took too long
		if (tickProcessingTime > this.TICK_INTERVAL * 0.8) {
			console.warn(
				`Tick processing time (${tickProcessingTime}ms) is approaching tick interval (${this.TICK_INTERVAL}ms)`
			);
		}
	}

	// Toggle the game loop
	toggleGameLoop(): void {
		if (this.isRunning) {
			this.stopGameLoop();
		} else {
			this.startGameLoop();
		}
	}

	// Get current game status information
	getGameStatus() {
		return {
			isRunning: this.isRunning,
			tickCount: gameState.state.tickCount,
			fps: this.currentFps,
			gameDate: gameState.state.currentDate
		};
	}
}

// Create and export an instance of the class
const gameService = new GameService();
export default gameService;
