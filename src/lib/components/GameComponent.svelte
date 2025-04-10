<!-- Game.svelte - Main game component -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import gameService from '../services/GameService.svelte';
	import gameState from '../services/GameState.svelte';
	import {
		getLocalPlayer,
		getAllTerritories,
		getCapturableTerritories,
		startCapturingTerritory,
		hireUnit,
		getAllUnits
	} from '../services/GameController.svelte';
	import { UnitType } from '../models/GameModels';
	import GridMap from './GridMap.svelte';

	let state = gameState.state;
	// Initialize the game on component mount
	onMount(() => {
		gameService.initGame();
	});

	// Clean up when component is destroyed
	onDestroy(() => {
		gameService.stopGameLoop();
	});

	// Get territories that can be captured by the player
	let capturableTerritories = $derived(getCapturableTerritories());

	// Get all units in the game
	let units = $derived(getAllUnits());

	// Get the local player
	let player = $derived(getLocalPlayer());

	// Format the current game date
	let formattedDate = $derived(gameState.formatGameDate(state.currentDate));

	// Start capturing a territory
	const onCaptureClick = (territoryId: string) => {
		startCapturingTerritory(territoryId);
	};

	// Hire a new unit
	const onHireUnitClick = (unitType: UnitType) => {
		// For simplicity, placing the unit at a fixed position for now
		const position = { x: 0, y: 0 };
		hireUnit(unitType, position);
	};
</script>

<div class="game-container flex h-full flex-col p-4">
	<div
		class="game-header flex items-center justify-between rounded-t-lg bg-gray-800 p-4 text-white"
	>
		<div class="flex items-center space-x-4">
			<h1 class="text-xl font-bold">Grand Strategy Game</h1>
			<span class="text-green-400">{formattedDate}</span>
		</div>

		<div class="flex items-center space-x-4">
			<span class="text-sm">Tick: {state.tickCount}</span>
			<span class="text-sm">FPS: {gameService.currentFps}</span>
			<button
				class="rounded px-4 py-2 text-sm font-medium {gameService.isRunning
					? 'bg-red-600 hover:bg-red-700'
					: 'bg-green-600 hover:bg-green-700'}"
				onclick={gameService.toggleGameLoop}
			>
				{gameService.isRunning ? 'Pause' : 'Start'}
			</button>
		</div>
	</div>

	<div class="game-content flex flex-grow gap-4 bg-gray-700 p-4">
		<!-- Left panel - Map/Grid will go here -->
		<div class="map-container flex-grow rounded-lg bg-gray-600 p-4">
			<h2 class="mb-4 text-lg font-semibold text-white">Game Map</h2>
			<GridMap />

			<!-- This is where our interactive map component would go -->
			<div class="grid-placeholder flex h-full items-center justify-center rounded-lg bg-gray-500">
				<p class="text-opacity-70 text-white">Interactive map would render here</p>
			</div>
		</div>

		<!-- Right panel - Game controls and information -->
		<div class="control-panel flex w-80 flex-col rounded-lg bg-gray-800 p-4">
			<!-- Player resources -->
			<div class="resources mb-6 rounded-lg bg-gray-700 p-3">
				<h3 class="text-md mb-2 font-semibold text-white">Resources</h3>
				<div class="grid grid-cols-2 gap-2">
					<div class="resource rounded bg-gray-800 p-2">
						<span class="text-sm text-yellow-400">Money</span>
						<div class="font-semibold text-white">{player?.resources.money || 0}</div>
					</div>
					<div class="resource rounded bg-gray-800 p-2">
						<span class="text-sm text-green-400">Manpower</span>
						<div class="font-semibold text-white">{player?.resources.manpower || 0}</div>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="actions mb-6 rounded-lg bg-gray-700 p-3">
				<h3 class="text-md mb-2 font-semibold text-white">Actions</h3>

				<!-- Territory capture section -->
				<div class="action-group mb-4">
					<h4 class="mb-1 text-sm text-gray-300">Capture Territory</h4>
					<div class="space-y-2">
						{#if capturableTerritories.length > 0}
							{#each capturableTerritories as territory}
								<button
									class="w-full rounded bg-blue-800 px-3 py-2 text-left text-sm text-white hover:bg-blue-700"
									onclick={() => onCaptureClick(territory.id)}
								>
									{territory.name}
									{territory.isBeingCaptured ? '(Being Captured)' : ''}
								</button>
							{/each}
						{:else}
							<p class="text-sm text-gray-400">No territories available to capture</p>
						{/if}
					</div>
				</div>

				<!-- Unit recruitment section -->
				{#if player}
					<div class="action-group">
						<h4 class="mb-1 text-sm text-gray-300">Recruit Units</h4>
						<div class="grid grid-cols-1 gap-2">
							<button
								class="rounded bg-green-800 px-3 py-2 text-sm text-white hover:bg-green-700"
								onclick={() => onHireUnitClick(UnitType.INFANTRY)}
								disabled={player.resources.money < 100}
							>
								Infantry (100 Money)
							</button>
							<button
								class="rounded bg-green-800 px-3 py-2 text-sm text-white hover:bg-green-700"
								onclick={() => onHireUnitClick(UnitType.TANK)}
								disabled={player.resources.money < 300}
							>
								Tank (300 Money)
							</button>
							<button
								class="rounded bg-green-800 px-3 py-2 text-sm text-white hover:bg-green-700"
								onclick={() => onHireUnitClick(UnitType.AIRCRAFT)}
								disabled={player.resources.money < 500}
							>
								Aircraft (500 Money)
							</button>
						</div>
					</div>
					on:
				{/if}
			</div>

			<!-- Units list -->
			<div class="units mb-6 flex-grow overflow-y-auto rounded-lg bg-gray-700 p-3">
				<h3 class="text-md mb-2 font-semibold text-white">Units ({units.length})</h3>
				<div class="space-y-2">
					{#if units.length > 0}
						{#each units as unit}
							<div class="unit flex items-center justify-between rounded bg-gray-800 p-2">
								<div>
									<div class="text-sm text-white">{unit.type}</div>
									<div class="text-xs text-gray-400">Strength: {unit.strength}</div>
								</div>
								<span class="rounded bg-gray-700 px-2 py-1 text-xs text-gray-300"
									>{unit.status}</span
								>
							</div>
						{/each}
					{:else}
						<p class="text-sm text-gray-400">No units available</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.game-container {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.game-content {
		flex-grow: 1;
		overflow: hidden;
	}

	.control-panel {
		display: flex;
		flex-direction: column;
	}

	.units {
		max-height: 300px;
		overflow-y: auto;
	}
</style>
