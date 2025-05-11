<!-- Game.svelte - Main game component -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import gameService from '../services/GameService.svelte';
	import { getAllTerritories, getHasGameEnded } from '../services/GameController.svelte';
	import GridMap from './Map/GridMap.svelte';
	import Header from './Header.svelte';
	import UnitsRow from './Unit/UnitsRow.svelte';
	import Territory from './Territory/Territory.svelte';
	import MissionSidebar from './Mission/MissionSidebar.svelte';
	import { addWindow } from './DialogWindows/windowStore.svelte';
	import EndGameWindow from './EndGame/EndGameWindow.svelte';
	import Canvas from './Canvas/Canvas.svelte';

	// Store only the ID of the selected cell
	let allTerritories = $derived(getAllTerritories());
	let selectedCellId: string | null = $state(null);
	let selectedTerritory = $derived(allTerritories.get(selectedCellId || ''));
	let hasEndGameWindow = $state(false);
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

	let gameEnded = $derived(getHasGameEnded());

	$effect(() => {
		console.log('effect', gameEnded);
		if (!gameEnded) return;
		if (hasEndGameWindow) return;
		hasEndGameWindow = true;
		console.log('add window');
		addWindow({
			id: `window-game-over`,
			title: `Game Over`,
			content: { component: EndGameWindow, props: {} },
			position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
			size: { width: 600, height: 500 }
		});
	});
</script>

<div class="game-container flex h-full flex-col">
	<Header />
	<div class="game-content relative flex flex-grow gap-4">
		<!-- Left panel - Map/Grid will go here -->
		<div class="map-container flex-grow bg-gray-600">
			<!-- <GridMap {selectedCellId} {onSelect} /> -->
			<Canvas {selectedCellId} {onSelect} />
		</div>
		<!-- Right panel - Game controls and information -->
		<Territory territory={selectedTerritory} {allTerritories} />
		<MissionSidebar />
	</div>
	<UnitsRow />
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
