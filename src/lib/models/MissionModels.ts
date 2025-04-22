// MissionModels.ts
import { CoreAttribute } from './UnitModels';
import { v4 as uuidv4 } from 'uuid';

/*────────────────────────────
 *  Mission static prototypes
 *───────────────────────────*/
export interface MissionInfo {
	name: string;
	reward: number;
	difficulty: Record<CoreAttribute, number>;
	durationTicks: number;
	image: string;
	repeatable?: boolean;
}

export const DEFAULT_MISSIONS: MissionInfo[] = [
	{
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
		image: '/themes/shop_shakedown.png'
	}
	// …add more prototypes here
];

/*────────────────────────────
 *  Live mission instances
 *───────────────────────────*/
export enum MissionStatus {
	AVAILABLE = 'AVAILABLE',
	ACTIVE = 'ACTIVE',
	SUCCEEDED = 'SUCCEEDED',
	FAILED = 'FAILED'
}

export interface IMission {
	id: string;
	playerId: string;
	info: MissionInfo; // <── full self‑contained data
	unitIds: string[]; // empty until launched
	startTick: number | null;
	endTick: number | null;
	status: MissionStatus;
}

/*────────────────────────────
 *  Helpers
 *───────────────────────────*/
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Create a *new* mission from a prototype, applying light randomisation. */
export function buildMissionFromPrototype(playerId: string, prototype: MissionInfo): IMission {
	const rewardVar = prototype.reward * 0.2; // ±20%
	const reward = prototype.reward + rnd(-rewardVar, rewardVar);

	const difficulty: Record<CoreAttribute, number> = {} as any;
	Object.entries(prototype.difficulty).forEach(([key, val]) => {
		const diffVar = val * 0.1; // ±10%
		difficulty[key as CoreAttribute] = val + rnd(-diffVar, diffVar);
	});

	return {
		id: uuidv4(),
		playerId,
		info: {
			...prototype,
			reward,
			difficulty
		},
		unitIds: [],
		startTick: null,
		endTick: null,
		status: MissionStatus.AVAILABLE
	};
}
