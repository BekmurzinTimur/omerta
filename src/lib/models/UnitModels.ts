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
	IDLE = 'Idle',
	MISSION = 'Mission',
	TERRITORY = 'Territory',
	BUSINESS = 'Business'
}

export interface IUnit {
	id: string;
	ownerId?: string;
	name: string;
	rank: UnitRank;
	nickname?: string;
	skills: Record<CoreAttribute, number>;
	experience: number;
	level: number;
	loyalty: number;
	heat: number;
	cut: number;
	image: number;
	status: UnitStatus;
}
