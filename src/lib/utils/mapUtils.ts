export const convertCellIdToTerritory = (cellId: number | null): string => {
	if (cellId === null) return 'not_found';
	// Validate the input
	if (cellId < 0 || cellId >= 400 || !Number.isInteger(cellId)) {
		throw new Error('Cell ID must be an integer between 0 and 399');
	}

	// Calculate x and y coordinates
	const y = cellId % 20;
	const x = Math.floor(cellId / 20);

	// Return the formatted territory string
	return `territory_${x}-${y}`;
};

export const convertTerritoryToCellId = (territory: string | null): number | null => {
	if (!territory) return null;
	// Validate input format using a regular expression
	const regex = /^territory_(\d+)-(\d+)$/;
	const match = territory.match(regex);

	if (!match) {
		throw new Error('Invalid territory format. Expected "territory_x-y"');
	}

	// Extract x and y coordinates
	const y = parseInt(match[1], 10);
	const x = parseInt(match[2], 10);

	// Validate coordinates are within the 20x20 grid
	if (x < 0 || x >= 20 || y < 0 || y >= 20) {
		throw new Error('Coordinates must be between 0 and 19');
	}

	// Calculate the cell ID
	return y * 20 + x;
};
