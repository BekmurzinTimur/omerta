<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import {
		OrbitControls,
		Grid,
		interactivity,
		BakeShadows,
		MeshLineGeometry,
		MeshLineMaterial
	} from '@threlte/extras';
	import NeighborhoodCell from './Cell.svelte';
	import {
		getAllRegions,
		getAllTerritories,
		getAllUnitsMap,
		getPlayerColor,
		getPlayerTerritories
	} from '$lib/services/GameController.svelte';
	import type { Cell } from '$lib/models/MapTypes';
	import { computeRegionBorders } from '$lib/utils/regionBorderUtils';
	import { REGIONS } from '$lib/const/globalConstants';
	import { getRegionsWithPlayerPresence } from '$lib/utils/regionsUtils';

	let {
		selectedCellId,
		onSelect
	}: { selectedCellId: string | null; onSelect: (cellid: string | null) => void } = $props();

	let territories = $derived(getAllTerritories());
	let units = $derived(getAllUnitsMap());
	let playerTerritories = $derived(getPlayerTerritories());
	let territoryIds = $derived([...territories.keys()]);
	let playerTerritorySet = $derived(new Set(playerTerritories.map((t) => t.id)));
	let playerColor = $derived(getPlayerColor());

	function getCellData(territoryId: string): Cell | null {
		const territory = territories.get(territoryId);
		if (!territory) return null;

		return {
			id: territory.id,
			x: territory.position.x,
			y: territory.position.y,
			territory,
			unit: units.get(territory.managerId || '') || units.get(territory.capturingUnitId || ''),
			isBeingCaptured: !!territory.capturingUnitId
		};
	}

	const { camera, renderer } = useThrelte();
	renderer.shadowMap.enabled = true;

	// Using Svelte 5 state management
	let density = $state(50);
	let gridSize = $state(10); // Number of cells in each direction
	let showGrid = $state(true);
	let timeOfDay = $state<'day' | 'night'>('day');
	let topHoveredCell = $state(null);

	function setTopHoveredCell(object: any) {
		topHoveredCell = object;
	}

	// Toggle cell selection
	function selectCell(cellId: string): void {
		// If the cell is already selected, deselect it
		if (selectedCellId === cellId) {
			onSelect(null);
		} else {
			onSelect(cellId);
		}
	}
	// Generate a grid of cells with different density patterns
	function calculateCellDensity(x: number, z: number, pattern: string): number {
		switch (pattern) {
			case 'center':
				// Higher density in center, lower on edges
				const distance = Math.sqrt(Math.pow(x, 2) + Math.pow(z, 2));
				const maxDistance = Math.sqrt(Math.pow(gridSize - 1, 2) + Math.pow(gridSize - 1, 2));
				return 90 - (distance / maxDistance) * 70;

			case 'gradient':
				// Gradient from high density on one side to low on other
				return 90 - ((x + gridSize - 1) / (gridSize * 2 - 2)) * 80;

			case 'random':
				// Random density values but consistent
				return Math.floor(((Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1) * 80) + 10;

			case 'districts':
				// Create distinct density districts
				if (x < gridSize / 2 && z < gridSize / 2) return 85; // Downtown
				if (x >= gridSize / 2 && z < gridSize / 2) return 60; // Commercial
				if (x < gridSize / 2 && z >= gridSize / 2) return 40; // Residential
				return 20; // Suburbs

			default:
				return density;
		}
	}

	// Pattern selection
	let densityPattern = $state<'uniform' | 'center' | 'gradient' | 'random' | 'districts'>('center');

	// Cell grid data
	let cells = $derived(
		Array.from({ length: gridSize * gridSize }, (_, i) => {
			const x = (i % gridSize) - Math.floor(gridSize / 2);
			const z = Math.floor(i / gridSize) - Math.floor(gridSize / 2);
			return {
				id: `cell-${x}-${z}`,
				x: x * 10, // cellSize = 10
				z: z * 10,
				density: densityPattern === 'uniform' ? density : calculateCellDensity(x, z, densityPattern)
			};
		})
	);

	// Environment lighting based on time of day
	let sunPosition = $derived(
		timeOfDay === 'day' ? { x: 30, y: 30, z: 30 } : { x: -150, y: -100, z: -50 }
	);

	let ambientIntensity = $derived(timeOfDay === 'day' ? 0.4 : 0.1);

	let skyColor = $derived(timeOfDay === 'day' ? 0x87ceeb : 0x000033);

	let regions = $derived(getAllRegions());
	let regionBorders = $derived(computeRegionBorders(territories, regions, 10));
	$inspect(regionBorders);
	interactivity();
</script>

<T.PerspectiveCamera
	makeDefault
	position={[0, 30, 10]}
	oncreate={(ref) => {
		ref.lookAt(0, 1, 0);
	}}
>
	<OrbitControls enablePan enableRotate={false} screenSpacePanning />
</T.PerspectiveCamera>
<!-- Scene lighting -->
<T.DirectionalLight
	intensity={timeOfDay === 'day' ? 4 : 0.3}
	position={[sunPosition.x, sunPosition.y, sunPosition.z]}
	castShadow
	shadow.mapSize.width={2048}
	shadow.mapSize.height={2048}
	shadow.bias={-0.0001}
	shadow.normalBias={0.05}
>
	<T.OrthographicCamera
		args={[-100, 100, 100, -100, 1, 250]}
		attach="shadow.camera"
		oncreate={(cam) => cam.updateProjectionMatrix()}
	></T.OrthographicCamera>
</T.DirectionalLight>

<T.AmbientLight intensity={ambientIntensity} />

{#if timeOfDay === 'night'}
	<!-- Moon light for night -->
	<!-- <T.PointLight position={[-30, 20, -30]} intensity={0.5} color={0xccddff} /> -->
{/if}

<!-- Sky background -->
<T.Scene>
	<T.Color args={[100, 100, 200]}></T.Color>
</T.Scene>

{#each territoryIds as id (id)}
	{@const cellData = getCellData(id)}
	{#if cellData}
		<T.Group position={[cellData.x * 10 - 50, 0, cellData.y * 10 - 50]}>
			<NeighborhoodCell
				cellSize={10}
				{setTopHoveredCell}
				{topHoveredCell}
				{selectCell}
				{selectedCellId}
				isBeingCaptured={cellData.isBeingCaptured}
				color={playerTerritorySet.has(id) || cellData.isBeingCaptured
					? parseInt(playerColor.substring(1), 16)
					: 0xaaaaaa}
				unit={cellData.unit}
				territoryId={id}
			/>
		</T.Group>
	{/if}
{/each}

{#each Array.from(regionBorders) as [key, points]}
	{@const region = regions.get(key)}
	<T.Mesh position={[-50, 0, -50]}>
		<MeshLineGeometry {points} />
		<MeshLineMaterial color={region?.color} width={0.5} />
	</T.Mesh>
{/each}

<!-- <BakeShadows /> -->
