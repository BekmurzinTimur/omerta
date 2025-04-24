//TerritoryModel.ts
export interface ITerritory {
	id: string;
	name: string;
	ownerId: string | null;
	position: {
		x: number;
		y: number;
	};
	resources: {
		income: number;
	};
	isBeingCaptured: boolean;
	captureProgress: number;
	captureInitiator: string | null;
	capturingUnitId: string | null;
	managerId: string | null;
}
