<script lang="ts">
	import { REGIONS_DATA } from '$lib/const/regionsData';
	import type { IUnit } from '$lib/models/UnitModels';
	import { getRegion, getTerritory } from '$lib/services/GameController.svelte';
	import { T } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import { Spring } from 'svelte/motion';
	import Buildings from './Buildings.svelte';

	// Props with TypeScript types
	let {
		cellSize = 10,
		setTopHoveredCell,
		topHoveredCell,
		selectedCellId,
		selectCell,
		unit,
		isBeingCaptured,
		territoryId,
		color
	}: {
		cellSize: number;
		setTopHoveredCell: (object: any) => void;
		topHoveredCell: any;
		selectedCellId: string | null;
		selectCell: (cellId: string) => void;
		unit?: IUnit;
		isBeingCaptured: boolean;
		territoryId: string;
		color: number;
	} = $props();

	let territory = $derived(getTerritory(territoryId));
	let region = $derived(getRegion(territory!.regionId));
	let regionInfo = $derived(REGIONS_DATA[region?.type || 0]);
	let isSelected = $derived(selectedCellId === territoryId);
	// Custom utility to replace degToRad from Three.js
	const degToRad = (degrees: number): number => degrees * (Math.PI / 180);

	// Use Svelte 5's state management
	const normalizedDensity = $derived(regionInfo.bonus / 100);
	const hasParks = $derived(normalizedDensity < 0.7);
	const parkSize = $derived(1.5 + (1 - normalizedDensity) * 2);

	// Park position with seed based on cellId for consistency
	const parkX = $derived((Math.random() - 0.5) * cellSize * 0.5);
	const parkZ = $derived((Math.random() - 0.5) * cellSize * 0.5);
	interactivity();
	const scale = new Spring(1);
	$effect(() => {
		if (territoryId === topHoveredCell) {
			scale.target = 1.2;
		} else {
			scale.target = 1;
		}
	});
</script>

<!-- Base plate for the cell with a unique ID -->
<T.Mesh
	position={[cellSize / 2, -0.05, cellSize / 2]}
	rotation={[degToRad(-90), 0, 0]}
	receiveShadow
	onpointermove={(e: any) => {
		setTopHoveredCell(territoryId);
	}}
	onclick={() => {
		selectCell(territoryId);
	}}
>
	<T.PlaneGeometry args={[cellSize, cellSize]} />
	<T.MeshStandardMaterial color={region?.color} roughness={0.8} />
</T.Mesh>

<T.Mesh
	position={[cellSize / 2, -0.05, cellSize / 2]}
	rotation={[degToRad(-90), 0, 0]}
	scale={scale.current}
>
	<T.BoxGeometry args={[cellSize, cellSize, cellSize]} />
	<T.MeshStandardMaterial
		color={color || 0xaaaaaa}
		opacity={isSelected ? 0.6 : 0.2}
		transparent={true}
	/>
</T.Mesh>

<Buildings density={regionInfo.bonus} {cellSize} />

<T.Group position={[cellSize / 2, 0, cellSize / 2]}>
	<!-- Parks/open areas (only in less dense areas) -->
	{#if hasParks}
		<!-- <T.Mesh position={[parkX, 0.01, parkZ]} rotation={[degToRad(-90), 0, 0]} receiveShadow>
			<T.PlaneGeometry args={[parkSize, parkSize]} />
			<T.MeshStandardMaterial color={0x88aa88} />
		</T.Mesh> -->

		<!-- Add some trees in the park -->
		{#each Array(Math.floor(parkSize * 2)) as _, i}
			{@const treeX = parkX + Math.random() * parkSize * 2.8}
			{@const treeZ = parkZ + Math.random() * parkSize * 2.8}
			{@const treeHeight = 0.2 + Math.random() * 0.3}

			<!-- Tree trunk -->
			<T.Mesh position={[treeX, treeHeight / 2, treeZ]} castShadow>
				<T.CylinderGeometry args={[0.05, 0.08, treeHeight, 5]} />
				<T.MeshStandardMaterial color={0x8b4513} />
			</T.Mesh>

			<!-- Tree foliage -->
			<T.Mesh position={[treeX, treeHeight + 0.2, treeZ]} castShadow>
				<T.ConeGeometry args={[0.25, 0.4, 6]} />
				<T.MeshStandardMaterial color={0x228822} />
			</T.Mesh>
		{/each}
	{/if}
</T.Group>

<!-- Street grid - more realistic -->
<T.Mesh position={[cellSize, 0.01, cellSize / 2]} rotation={[degToRad(-90), 0, 0]} receiveShadow>
	<T.PlaneGeometry args={[0.8, cellSize]} />
	<T.MeshStandardMaterial color={0x333333} />
</T.Mesh>

<T.Mesh position={[0, 0.01, cellSize / 2]} rotation={[degToRad(-90), 0, 0]} receiveShadow>
	<T.PlaneGeometry args={[0.8, cellSize]} />
	<T.MeshStandardMaterial color={0x333333} />
</T.Mesh>

<T.Mesh position={[cellSize / 2, 0.01, cellSize]} rotation={[degToRad(-90), 0, 0]} receiveShadow>
	<T.PlaneGeometry args={[cellSize, 0.8]} />
	<T.MeshStandardMaterial color={0x333333} />
</T.Mesh>

<T.Mesh position={[cellSize / 2, 0.01, 0]} rotation={[degToRad(-90), 0, 0]} receiveShadow>
	<T.PlaneGeometry args={[cellSize, 0.8]} />
	<T.MeshStandardMaterial color={0x333333} />
</T.Mesh>

<!-- Crosswalks at intersections -->
{#each [1, 0] as xDir}
	{#each [1, 0] as zDir}
		<T.Mesh
			position={[xDir * cellSize, 0.02, zDir * cellSize]}
			rotation={[degToRad(-90), 0, 0]}
			receiveShadow
		>
			<T.PlaneGeometry args={[1, 1]} />
			<T.MeshStandardMaterial color={0x444444} />
		</T.Mesh>
	{/each}
{/each}
