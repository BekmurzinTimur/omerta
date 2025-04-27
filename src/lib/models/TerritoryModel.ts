//TerritoryModel.ts
export interface ITerritory {
	id: string;
	name: string;
	ownerId: string | null;
	position: {
		x: number;
		y: number;
	};
	regionId: string;
	resources: {
		income: number;
	};
	isBeingCaptured: boolean;
	captureProgress: number;
	captureInitiator: string | null;
	capturingUnitId: string | null;
	managerId: string | null;
	borders: TerritoryBorders;
}

export interface IRegion {
	id: string;
	name: string;
	territoryIds: string[]; // References to all territories in this region
	color: string; // For visualization
}

interface TerritoryBorders {
	top: boolean;
	right: boolean;
	bottom: boolean;
	left: boolean;
}
