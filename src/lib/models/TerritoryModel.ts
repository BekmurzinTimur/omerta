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
	territoryIds: string[];
	color: string;
	controlBonus: {
		income: number;
	};
	type: number;
}

interface TerritoryBorders {
	top: boolean;
	right: boolean;
	bottom: boolean;
	left: boolean;
}
