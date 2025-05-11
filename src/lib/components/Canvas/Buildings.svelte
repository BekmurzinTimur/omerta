<script lang="ts">
	import { T } from '@threlte/core';

	let { density, cellSize }: { density: number; cellSize: number } = $props();
	// Define interfaces for better type safety
	interface Building {
		x: number;
		z: number;
		width: number;
		height: number;
		depth: number;
		color: number;
	}

	// Memoize building generation to avoid expensive recalculations
	let previousDensity = -1;
	let buildingsCache: Building[] = [];

	const normalizedDensity = $derived(density / 100);

	const buildingCount = $derived(Math.floor(3 + normalizedDensity * 6)); // 3-9 buildings
	const maxHeight = $derived(0.5 + normalizedDensity * 10); // 0.5-5 height units

	// HSL to RGB conversion utility
	function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
		let r, g, b;

		if (s === 0) {
			r = g = b = l; // achromatic
		} else {
			const hue2rgb = (p: number, q: number, t: number) => {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			};

			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}

		return { r, g, b };
	}

	// RGB to hex conversion utility
	function rgbToHex(r: number, g: number, b: number): number {
		return (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255);
	}

	function generateBuildings(densityValue: number): Building[] {
		// Return cached buildings if density hasn't changed
		if (densityValue === previousDensity) {
			return buildingsCache;
		}

		const buildings: Building[] = [];
		const nd = normalizedDensity;

		// How much of the cell should be covered with buildings (30-80%)
		const coverage = 0.3 + nd * 0.5;

		// Variance in building sizes
		const sizeVariance = (0.2 + (1 - nd) * 0.3) * 10; // Less variance in dense areas

		console.log;
		// Generate buildings
		for (let i = 0; i < buildingCount; i++) {
			// Randomize position within cell
			const x = 0.1 * cellSize + Math.random() * cellSize * 0.8;
			const z = 0.1 * cellSize + Math.random() * cellSize * 0.8;

			// Building size - smaller in dense areas
			const baseSize = 0.8 - nd * 0.3;
			const width = baseSize + sizeVariance * Math.random();
			const depth = baseSize + sizeVariance * Math.random();

			// Building height distribution changes with density
			// Dense areas have more tall buildings
			let height;
			const _r = Math.random();

			if (nd > 0.7) {
				// High density areas have some very tall buildings
				height = maxHeight * (0.7 + _r * 0.3);
			} else if (nd > 0.4) {
				// Medium density has more even distribution
				height = maxHeight * (0.3 + _r * 0.2);
			} else {
				// Low density has mostly small buildings
				height = maxHeight * (0.1 + _r * 0.2);
			}

			// Building color based on height (taller buildings are more modern)
			const hue = 0.08 + (height / maxHeight) * 0.02; // Slight variation in hue
			const sat = 0.05 + (1 - height / maxHeight) * 0.2; // Lower saturation for taller buildings
			const light = 0.6 + (height / maxHeight) * 0.2; // Taller buildings are lighter

			// Convert HSL to RGB, then to hex color
			const { r, g, b } = hslToRgb(hue, sat, light);
			const colorHex = rgbToHex(r, g, b);

			buildings.push({
				x,
				z,
				width,
				depth,
				height,
				color: colorHex
			});
		}

		// Update cache
		previousDensity = densityValue;
		buildingsCache = buildings;

		return buildings;
	}

	// Derived value for buildings
	const buildings = $derived(generateBuildings(density));
</script>

<!-- Buildings -->
{#each buildings as building}
	<!-- Main building structure -->
	<T.Mesh position={[building.x, building.height / 2, building.z]} castShadow receiveShadow>
		<T.BoxGeometry args={[building.width, building.height, building.depth]} />
		<T.MeshStandardMaterial color={building.color} roughness={0.7} />
	</T.Mesh>
{/each}
