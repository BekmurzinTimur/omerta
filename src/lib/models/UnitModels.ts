// UnitModels.ts
export enum UnitRank {
	ASSOCIATE = 'ASSOCIATE',
	SOLDIER = 'SOLDIER',
	CAPO = 'CAPO',
	CONSIGLIERE = 'CONSIGLIERE',
	UNDERBOSS = 'UNDERBOSS'
}

export enum CoreAttribute {
	MUSCLE = 'Muscle', // Physical force, combat, protection, intimidation
	BRAINS = 'Brains', // Intelligence, planning, strategy, business acumen
	CUNNING = 'Cunning', // Survival skills, awareness, connections, practical knowledge
	INFLUENCE = 'Influence' // Charisma, respect, ability to command others
}
export enum UnitStatus {
	ASSIGNED = 'ASSIGNED',
	IDLE = 'Idle',
	MISSION = 'Mission',
	TERRITORY = 'Territory',
	EXPAND = 'Expand',
	BUSINESS = 'Business',
	PRISON = 'Prison'
}

export type UnitAttributeMask = Record<CoreAttribute, boolean>;

export interface IUnit {
	id: string;
	ownerId?: string;
	name: string;
	rank: UnitRank;
	nickname?: string;
	skills: Record<CoreAttribute, number>;
	mask: UnitAttributeMask;
	experience: number;
	level: number;
	loyalty: number;
	heat: number;
	cut: number;
	image: number;
	status: UnitStatus;
	missions: string[];
}
