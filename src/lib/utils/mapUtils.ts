import type { ITerritory } from '$lib/models/TerritoryModel';

export const isNeighboringPlayerTerritory = (
	territory: ITerritory,
	territoriesMap: Map<string, ITerritory>,
	playerId: string
): boolean => {
	const { x, y } = territory.position;

	// Define the four adjacent positions
	const neighborIds = [
		`${x}-${y - 1}`, // up
		`${x + 1}-${y}`, // right
		`${x}-${y + 1}`, // down
		`${x - 1}-${y}` // left
	];

	// Check each neighboring territory
	for (const neighborId of neighborIds) {
		const neighbor = territoriesMap.get(neighborId);
		if (neighbor && neighbor.ownerId === playerId) {
			return true;
		}
	}

	return false;
};
