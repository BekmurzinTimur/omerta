// MissionModels.ts
import { CoreAttribute } from './UnitModels';

/*------------- templates (static) -------------*/
export interface IMissionInfo {
	infoId: string;
	name: string;
	reward: number;
	difficulty: Record<CoreAttribute, number>;
	durationTicks: number;
	image: string;
	repeatable?: boolean;
}

export const DEFAULT_MISSIONS: Record<string, IMissionInfo> = {
	SHAKEDOWN: {
		infoId: 'SHAKEDOWN',
		name: 'Shakedown Local Shop',
		reward: 1_000,
		difficulty: {
			[CoreAttribute.MUSCLE]: 20,
			[CoreAttribute.BRAINS]: 20,
			[CoreAttribute.CUNNING]: 20,
			[CoreAttribute.INFLUENCE]: 20
		},
		durationTicks: 2,
		repeatable: true,
		image: '/themes/shop_shakedown.png' // put your file in static or assets
	}
	// add more here …
};

/*------------- live instances (per player) -------------*/
export enum MissionStatus {
	ACTIVE = 'ACTIVE',
	SUCCEEDED = 'SUCCEEDED',
	FAILED = 'FAILED'
}

export interface IMission {
	id: string; // same as action.id
	missionInfoId: string;
	playerId: string;
	unitIds: string[];
	startTick: number;
	endTick: number; // tick when it will finish
	status: MissionStatus;
}
