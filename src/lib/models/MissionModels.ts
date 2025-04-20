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
			[CoreAttribute.MUSCLE]: 4,
			[CoreAttribute.BRAINS]: 0,
			[CoreAttribute.CUNNING]: 0,
			[CoreAttribute.INFLUENCE]: 0
		},
		durationTicks: 3,
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
