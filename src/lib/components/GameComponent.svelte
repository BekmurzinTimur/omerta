<!-- Game.svelte - Main game component -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import gameService from '../services/GameService.svelte';
	import { getAllTerritories } from '../services/GameController.svelte';
	import GridMap from './Map/GridMap.svelte';
	import Header from './Header.svelte';
	import Footer from './Footer.svelte';
	import Territory from './Territory.svelte';
	import MissionSidebar from './Mission/MissionSidebar.svelte';

	// Store only the ID of the selected cell
	let allTerritories = $derived(getAllTerritories());
	let selectedCellId: string | null = $state(null);
	let selectedTerritory = $derived(allTerritories.get(selectedCellId || ''));
	// Initialize the game on component mount
	onMount(() => {
		gameService.initGame();
	});

	// Clean up when component is destroyed
	onDestroy(() => {
		gameService.stopGameLoop();
	});

	const onSelect = (cellId: string | null) => {
		selectedCellId = cellId;
	};
</script>

<div class="game-container flex h-full flex-col">
	<Header />
	<div class="game-content flex flex-grow gap-4 bg-gray-700 p-4">
		<!-- Right panel - Game controls and information -->
		<div class="control-panel flex w-80 flex-col bg-gray-800 p-4">
			<Territory territory={selectedTerritory} />
		</div>
		<!-- Left panel - Map/Grid will go here -->
		<div class="map-container flex-grow bg-gray-600">
			<GridMap {selectedCellId} {onSelect} />
		</div>
		<MissionSidebar />
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
