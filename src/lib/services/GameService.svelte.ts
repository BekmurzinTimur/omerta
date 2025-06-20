//GameService.svelte.ts (Updated with AI integration)
import gameState from './GameState.svelte';
import { processActions } from './ActionManager.svelte';
import {
	processScheduledActions,
	setupInitialScheduledActions
} from './ScheduledActionManager.svelte';
import { END_DATE } from '$lib/const/globalConstants';
import aiService from './AI/AIService.svelte';
import playerManager from './PlayerManager.svelte';

class GameService {
	// Game tick interval in milliseconds
	private readonly TICK_INTERVAL: number = 500;

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

		const aiPlayers = playerManager.getAIPlayers();
		console.log({ aiPlayers });
		aiPlayers.forEach((aiPlayer) => aiService.addAIPlayer(aiPlayer.id));

		console.log('Game initialized');
	}

	// Start the game loop
	startGameLoop(): void {
		if (this.isRunning) {
			console.warn('Game loop is already running');
			return;
		}
		if (gameState.state.hasEnded) {
			console.warn('Game has ended');
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
		this.lastTickTime = startTime;

		// Increment tick count
		gameState.state.tickCount++;

		console.log(`=== Tick ${gameState.state.tickCount} ===`);

		// 1. Advance game date
		gameState.advanceGameDate();

		console.log(gameState.state.currentDate);
		if (gameState.state.currentDate >= END_DATE) {
			console.log('reached end', END_DATE);
			this.endGame();
		}

		// 2. Process AI decisions (before player actions)
		// This allows AI to queue actions that will be processed with player actions
		try {
			aiService.tick(gameState.state);
		} catch (error) {
			console.error('Error processing AI decisions:', error);
		}

		// 3. Process player-initiated actions (including AI actions)
		processActions();

		// 4. Process scheduled actions
		processScheduledActions(gameState.state.tickCount);

		// 5. Any additional processing needed

		const endTime = Date.now();
		const tickProcessingTime = endTime - startTime;

		console.log(`Tick processing took ${tickProcessingTime}ms `);

		// Check if tick took too long
		if (tickProcessingTime > this.TICK_INTERVAL * 0.8) {
			console.warn(
				`Tick processing time (${tickProcessingTime}ms) is approaching tick interval (${this.TICK_INTERVAL}ms)`
			);
		}
	}

	endGame(): void {
		console.log('ending the game');
		this.stopGameLoop();
		gameState.state.hasEnded = true;
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

	// AI-related helper methods
	getAIPlayerIds(): string[] {
		return aiService.getAIPlayers();
	}

	isAIPlayer(playerId: string): boolean {
		return aiService.isAIPlayer(playerId);
	}
}

// Create and export an instance of the class
const gameService = new GameService();
export default gameService;
