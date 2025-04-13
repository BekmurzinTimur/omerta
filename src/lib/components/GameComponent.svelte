<!-- Game.svelte - Main game component -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import gameService from '../services/GameService.svelte';
	import {
		getLocalPlayer,
		getCapturableTerritories,
		startCapturingTerritory
	} from '../services/GameController.svelte';
	import GridMap from './GridMap.svelte';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';

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

	// Get the local player
	let player = $derived(getLocalPlayer());

	// Start capturing a territory
	const onCaptureClick = (territoryId: string) => {
		startCapturingTerritory(territoryId);
	};
</script>

<div class="game-container flex h-full flex-col">
	<Header />
	<div class="game-content flex flex-grow gap-4 bg-gray-700 p-4">
		<!-- Left panel - Map/Grid will go here -->
		<div class="map-container flex-grow bg-gray-600">
			<GridMap />
		</div>

		<!-- Right panel - Game controls and information -->
		<div class="control-panel flex w-80 flex-col bg-gray-800 p-4">
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
			</div>
		</div>
	</div>
	<Footer />
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
</style>
