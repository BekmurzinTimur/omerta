import { CoreAttribute } from './UnitModels';

/*------------- templates (static) -------------*/
export interface MissionTemplate {
	templateId: string;
	name: string;
	reward: number;
	difficulty: Record<CoreAttribute, number>;
	durationTicks: number;
	image: string;
}

export const DEFAULT_MISSIONS: Record<string, MissionTemplate> = {
	SHAKEDOWN: {
		templateId: 'SHAKEDOWN',
		name: 'Shakedown Local Shop',
		reward: 1_000,
		difficulty: {
			[CoreAttribute.MUSCLE]: 4,
			[CoreAttribute.BRAINS]: 0,
			[CoreAttribute.CUNNING]: 0,
			[CoreAttribute.INFLUENCE]: 0
		},
		durationTicks: 3,
		image: '/img/missions/shakedown.jpg' // put your file in static or assets
	}
	// add more here …
};

/*------------- live instances (per player) -------------*/
export enum MissionStatus {
	ACTIVE = 'ACTIVE',
	SUCCEEDED = 'SUCCEEDED',
	FAILED = 'FAILED'
}

export interface IMission extends MissionTemplate {
	id: string; // same as action.id
	playerId: string;
	unitIds: string[];
	startTick: number;
	endTick: number; // tick when it will finish
	status: MissionStatus;
	progress: number; // 0‑100 cached for UI convenience
}
