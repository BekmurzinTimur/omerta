import {
	BASE_CAPTURE_PROGRESS,
	CAPTURE_PROGRESS_PER_MUSCLE,
	CAPTURE_PROGRESS_PER_NEIGHBOUR
} from '$lib/const/globalConstants';
import type { ITerritory } from '$lib/models/TerritoryModel';
import type { IUnit } from '$lib/models/UnitModels';

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

export const countNeighboringPlayerTerritories = (
	territory: ITerritory,
	territoriesMap: Map<string, ITerritory>,
	playerId: string
): number => {
	const { x, y } = territory.position;

	// Define the four adjacent positions
	const neighborIds = [
		`${x}-${y - 1}`, // up
		`${x + 1}-${y}`, // right
		`${x}-${y + 1}`, // down
		`${x - 1}-${y}` // left
	];

	let count = 0;

	// Check each neighboring territory
	for (const neighborId of neighborIds) {
		const neighbor = territoriesMap.get(neighborId);
		if (neighbor && neighbor.ownerId === playerId) {
			count++;
		}
	}

	return count;
};

export const getCaptureProgress = (
	territory: ITerritory,
	territoriesMap: Map<string, ITerritory>,
	unit: IUnit
) => {
	const neighbours = countNeighboringPlayerTerritories(
		territory,
		territoriesMap,
		territory.captureInitiator!
	);

	return (
		(BASE_CAPTURE_PROGRESS + (unit.skills.Muscle - 5) * CAPTURE_PROGRESS_PER_MUSCLE) *
		(1 + (neighbours - 1) * CAPTURE_PROGRESS_PER_NEIGHBOUR)
	);
};
