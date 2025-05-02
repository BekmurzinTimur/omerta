// MissionModels.ts
import { BASE_TIP_LIFESPAN } from '$lib/const/globalConstants';
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
	heat: number;
}

// Additional mission templates for DEFAULT_MISSIONS
export const DEFAULT_MISSIONS: MissionInfo[] = [
	{
		name: 'Shakedown Local Shop',
		reward: 1_000,
		difficulty: {
			[CoreAttribute.MUSCLE]: 5,
			[CoreAttribute.BRAINS]: 5,
			[CoreAttribute.CUNNING]: 5,
			[CoreAttribute.INFLUENCE]: 5
		},
		durationTicks: 12,
		repeatable: true,
		image: '/themes/shop_shakedown.png',
		heat: 5
	},
	{
		name: 'Rob Convenience Store',
		reward: 2_500,
		difficulty: {
			[CoreAttribute.MUSCLE]: 8,
			[CoreAttribute.BRAINS]: 4,
			[CoreAttribute.CUNNING]: 10,
			[CoreAttribute.INFLUENCE]: 4
		},
		durationTicks: 24,
		repeatable: true,
		image: '/themes/shop_robbery.png',
		heat: 8
	},
	{
		name: 'Run Protection Racket',
		reward: 5_000,
		difficulty: {
			[CoreAttribute.MUSCLE]: 12,
			[CoreAttribute.BRAINS]: 6,
			[CoreAttribute.CUNNING]: 9,
			[CoreAttribute.INFLUENCE]: 15
		},
		durationTicks: 48,
		repeatable: true,
		image: '/themes/protection_racket.png',
		heat: 12
	},
	{
		name: 'Hijack Delivery Truck',
		reward: 8_000,
		difficulty: {
			[CoreAttribute.MUSCLE]: 15,
			[CoreAttribute.BRAINS]: 10,
			[CoreAttribute.CUNNING]: 18,
			[CoreAttribute.INFLUENCE]: 6
		},
		durationTicks: 48,
		repeatable: true,
		image: '/themes/hijack_delivery.png',
		heat: 16
	},
	{
		name: 'Drug Distribution Run',
		reward: 12_000,
		difficulty: {
			[CoreAttribute.MUSCLE]: 10,
			[CoreAttribute.BRAINS]: 8,
			[CoreAttribute.CUNNING]: 15,
			[CoreAttribute.INFLUENCE]: 12
		},
		durationTicks: 56,
		repeatable: true,
		image: '/themes/drug_run.png',
		heat: 20
	},
	{
		name: 'Illegal Gambling Operation',
		reward: 20_000,
		difficulty: {
			[CoreAttribute.MUSCLE]: 15,
			[CoreAttribute.BRAINS]: 22,
			[CoreAttribute.CUNNING]: 18,
			[CoreAttribute.INFLUENCE]: 25
		},
		durationTicks: 80,
		repeatable: false,
		image: '/themes/gambling.png',
		heat: 25
	},
	{
		name: 'Underground Fight Club',
		reward: 15_000,
		difficulty: {
			[CoreAttribute.MUSCLE]: 25,
			[CoreAttribute.BRAINS]: 5,
			[CoreAttribute.CUNNING]: 12,
			[CoreAttribute.INFLUENCE]: 18
		},
		durationTicks: 100,
		repeatable: true,
		image: '/themes/fight_club.png',
		heat: 18
	},
	{
		name: 'Blackmail Local Official',
		reward: 25_000,
		difficulty: {
			[CoreAttribute.MUSCLE]: 6,
			[CoreAttribute.BRAINS]: 20,
			[CoreAttribute.CUNNING]: 25,
			[CoreAttribute.INFLUENCE]: 30
		},
		durationTicks: 48,
		repeatable: false,
		image: '/themes/blackmail.png',
		heat: 30
	},
	{
		name: 'Smuggle Contraband',
		reward: 18_000,
		difficulty: {
			[CoreAttribute.MUSCLE]: 12,
			[CoreAttribute.BRAINS]: 20,
			[CoreAttribute.CUNNING]: 28,
			[CoreAttribute.INFLUENCE]: 10
		},
		durationTicks: 72,
		repeatable: true,
		image: '/themes/contraband.png',
		heat: 22
	},
	{
		name: 'Steal Luxury Cars',
		reward: 22_000,
		difficulty: {
			[CoreAttribute.MUSCLE]: 10,
			[CoreAttribute.BRAINS]: 15,
			[CoreAttribute.CUNNING]: 30,
			[CoreAttribute.INFLUENCE]: 8
		},
		durationTicks: 48,
		repeatable: true,
		image: '/themes/steal.png',
		heat: 24
	},
	{
		name: 'Eliminate Informant',
		reward: 30_000,
		difficulty: {
			[CoreAttribute.MUSCLE]: 25,
			[CoreAttribute.BRAINS]: 20,
			[CoreAttribute.CUNNING]: 35,
			[CoreAttribute.INFLUENCE]: 15
		},
		durationTicks: 100,
		repeatable: false,
		image: '/themes/eliminate.png',
		heat: 40
	}
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
	results?: {
		money?: number;
	};
	tipExpires: number;
}

/*────────────────────────────
 *  Helpers
 *───────────────────────────*/
const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

/** Create a *new* mission from a prototype, applying light randomisation. */
export function buildMissionFromPrototype(
	playerId: string,
	prototype: MissionInfo,
	currentTick: number
): IMission {
	const rewardVar = prototype.reward * 0.2; // ±20%
	const reward = prototype.reward + rnd(-rewardVar, rewardVar);

	const difficulty: Record<CoreAttribute, number> = {} as any;
	Object.entries(prototype.difficulty).forEach(([key, val]) => {
		const diffVar = val * 0.1; // ±10%
		difficulty[key as CoreAttribute] = Math.round(val + rnd(-diffVar, diffVar));
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
		status: MissionStatus.AVAILABLE,
		tipExpires: currentTick + BASE_TIP_LIFESPAN
	};
}
