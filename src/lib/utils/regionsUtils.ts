import type { GameState } from '$lib/models/GameModels';
import type { IRegion, ITerritory } from '$lib/models/TerritoryModel';

/**
 * Creates regions based on a 2D grid representation
 * @param regionGrid A 2D array where each cell contains the region ID for that position
 * @returns A map of region objects
 */
export function createRegionsFromGrid(regionGrid: number[][]): Map<string, IRegion> {
	const regions = new Map<string, IRegion>();
	const regionColors = generateRegionColors(new Set(regionGrid.flat()).size);

	// First pass: Create region objects and collect territory IDs
	for (let y = 0; y < regionGrid.length; y++) {
		for (let x = 0; x < regionGrid[y].length; x++) {
			const regionId = `region-${regionGrid[y][x]}`;
			const territoryId = `${x}-${y}`;

			if (!regions.has(regionId)) {
				regions.set(regionId, {
					id: regionId,
					name: `Region ${regionGrid[y][x] + 1}`, // 1-based naming for user display
					territoryIds: [territoryId],
					color: regionColors[regionGrid[y][x]],
					controlBonus: {
						income: Math.round(50 + Math.random() * 50)
					},
					type: regions.size
				});
			} else {
				const region = regions.get(regionId)!;
				region.territoryIds.push(territoryId);
			}
		}
	}

	return regions;
}

/**
 * Updates all territories with their region IDs
 * @param territories Map of all territories
 * @param regions Map of all regions
 */
export function assignRegionsToTerritories(
	territories: Map<string, ITerritory>,
	regions: Map<string, IRegion>
): void {
	// Clear any existing region assignments
	territories.forEach((territory) => {
		territory.regionId = '';
	});

	// Assign new region IDs
	regions.forEach((region) => {
		region.territoryIds.forEach((territoryId) => {
			const territory = territories.get(territoryId);
			if (territory) {
				territory.regionId = region.id;
			}
		});
	});
}

/**
 * Gets all territories in a specific region
 * @param regionId The ID of the region
 * @param gameState The current game state
 * @returns An array of territories in the region
 */
export function getTerritoriesInRegion(regionId: string, gameState: GameState): ITerritory[] {
	const region = gameState.regions.get(regionId);
	if (!region) return [];

	return region.territoryIds
		.map((id) => gameState.territories.get(id))
		.filter((t): t is ITerritory => t !== undefined);
}

/**
 * Calculates the percentage of a region owned by each player
 * @param regionId The ID of the region
 * @param gameState The current game state
 * @returns A map of player IDs to their ownership percentage
 */
export function calculateRegionOwnership(
	regionId: string,
	gameState: GameState
): Map<string, number> {
	const region = gameState.regions.get(regionId);
	if (!region) return new Map();

	const territories = getTerritoriesInRegion(regionId, gameState);
	const totalTerritories = territories.length;

	const ownershipCount = new Map<string, number>();

	// Count territories owned by each player
	territories.forEach((territory) => {
		if (territory.ownerId) {
			const currentCount = ownershipCount.get(territory.ownerId) || 0;
			ownershipCount.set(territory.ownerId, currentCount + 1);
		}
	});

	// Convert counts to percentages
	const ownershipPercentage = new Map<string, number>();
	ownershipCount.forEach((count, playerId) => {
		ownershipPercentage.set(playerId, (count / totalTerritories) * 100);
	});

	return ownershipPercentage;
}

/**
 * Checks if a player has full control of a region
 * @param playerId The ID of the player
 * @param regionId The ID of the region
 * @param gameState The current game state
 * @returns True if the player owns all territories in the region
 */
export function playerControlsRegion(
	playerId: string,
	regionId: string,
	gameState: GameState
): boolean {
	const territories = getTerritoriesInRegion(regionId, gameState);
	return territories.every((t) => t.ownerId === playerId);
}

/**
 * Gets all regions where a player has at least one territory
 * @param playerId The ID of the player
 * @param gameState The current game state
 * @returns An array of regions the player has presence in
 */
export function getRegionsWithPlayerPresence(playerId: string, gameState: GameState): IRegion[] {
	const result: IRegion[] = [];
	gameState.regions.forEach((region) => {
		const territories = getTerritoriesInRegion(region.id, gameState);
		if (territories.some((t) => t.ownerId === playerId)) {
			result.push(region);
		}
	});
	return result;
}

/**
 * Generates distinct colors for regions
 * @param count Number of colors needed
 * @returns Array of color strings
 */
function generateRegionColors(count: number): string[] {
	const colors: string[] = [];
	for (let i = 0; i < count; i++) {
		const hue = ((i * 360) / count) % 360;
		colors.push(`hsl(${hue}, 70%, 60%)`);
	}
	return colors;
}

/**
 * Creates a grid of region IDs using a growth algorithm
 * @param numRegions Number of regions to generate
 * @param gridSize Size of the grid (width and height)
 * @param randomness Value from 0-100 controlling border irregularity
 * @returns A 2D grid with region IDs assigned to each cell
 */
export function generateRegionGrid(
	numRegions: number = 5,
	gridSize: number = 10,
	randomness: number = 50
): number[][] {
	// Initialize empty grid
	const grid: number[][] = Array(gridSize)
		.fill(null)
		.map(() => Array(gridSize).fill(-1));

	// Place initial seeds randomly
	const placeSeeds = (): void => {
		const positions: { x: number; y: number }[] = [];

		// Generate unique positions for seeds
		while (positions.length < numRegions) {
			const x = Math.floor(Math.random() * gridSize);
			const y = Math.floor(Math.random() * gridSize);

			// Check if this position is already taken
			if (!positions.some((pos) => pos.x === x && pos.y === y)) {
				positions.push({ x, y });
				grid[y][x] = positions.length - 1; // Assign region ID
			}
		}
	};

	// Get valid neighbors for growth
	const getValidNeighbors = (x: number, y: number): { x: number; y: number }[] => {
		const neighbors: { x: number; y: number }[] = [];
		const directions = [
			{ dx: -1, dy: 0 }, // left
			{ dx: 1, dy: 0 }, // right
			{ dx: 0, dy: -1 }, // up
			{ dx: 0, dy: 1 } // down
		];

		for (const dir of directions) {
			const nx = x + dir.dx;
			const ny = y + dir.dy;

			// Check if within grid bounds and unassigned
			if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[ny][nx] === -1) {
				neighbors.push({ x: nx, y: ny });
			}
		}

		return neighbors;
	};

	// Grow regions until the grid is filled
	const growRegions = (): void => {
		let unassignedCells = gridSize * gridSize - numRegions;

		// Keep track of frontier cells for each region
		let frontiers: { x: number; y: number }[][] = Array(numRegions)
			.fill(null)
			.map(() => []);

		// Initialize frontiers with neighbors of seed cells
		for (let y = 0; y < gridSize; y++) {
			for (let x = 0; x < gridSize; x++) {
				if (grid[y][x] !== -1) {
					const regionId = grid[y][x];
					const neighbors = getValidNeighbors(x, y);
					neighbors.forEach((n) => frontiers[regionId].push(n));
				}
			}
		}

		// Remove duplicates from frontiers
		frontiers = frontiers.map((frontier) => {
			const unique: { x: number; y: number }[] = [];
			frontier.forEach((cell) => {
				if (!unique.some((c) => c.x === cell.x && c.y === cell.y)) {
					unique.push(cell);
				}
			});
			return unique;
		});

		// Grow until all cells are assigned
		while (unassignedCells > 0) {
			// Choose a random region to grow
			const regionToGrow = Math.floor(Math.random() * numRegions);

			if (frontiers[regionToGrow].length === 0) continue;

			// Apply randomness factor to frontier selection
			let frontierIndex: number;
			if (Math.random() * 100 < randomness) {
				// Random selection for irregular growth
				frontierIndex = Math.floor(Math.random() * frontiers[regionToGrow].length);
			} else {
				// Deterministic selection for more compact shapes
				frontierIndex = 0;
			}

			const cell = frontiers[regionToGrow][frontierIndex];

			// Only proceed if cell is still unassigned
			if (grid[cell.y][cell.x] === -1) {
				grid[cell.y][cell.x] = regionToGrow;
				unassignedCells--;

				// Update frontiers with new neighbors
				const newNeighbors = getValidNeighbors(cell.x, cell.y);
				newNeighbors.forEach((n) => {
					if (!frontiers[regionToGrow].some((c) => c.x === n.x && c.y === n.y)) {
						frontiers[regionToGrow].push(n);
					}
				});
			}

			// Remove the processed cell from frontier
			frontiers[regionToGrow].splice(frontierIndex, 1);
		}
	};

	// Generate the regions
	placeSeeds();
	growRegions();

	return grid;
}

export const addRegionBorders = (territoriesMap: Map<string, ITerritory>) => {
	territoriesMap.forEach((territory) => {
		const borders = {
			left: false,
			right: false,
			bottom: false,
			top: false
		};
		const { x, y } = territory.position;

		// Define the four adjacent positions
		const neighborIds = {
			top: `${x}-${y - 1}`, // up
			right: `${x + 1}-${y}`, // right
			bottom: `${x}-${y + 1}`, // down
			left: `${x - 1}-${y}` // left
		};

		borders.top = territoriesMap.get(neighborIds.top)?.regionId !== territory.regionId;
		borders.right = territoriesMap.get(neighborIds.right)?.regionId !== territory.regionId;
		borders.bottom = territoriesMap.get(neighborIds.bottom)?.regionId !== territory.regionId;
		borders.left = territoriesMap.get(neighborIds.left)?.regionId !== territory.regionId;

		territory.borders = borders;
	});
};
