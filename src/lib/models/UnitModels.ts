export enum UnitRank {
	ASSOCIATE = 'ASSOCIATE',
	SOLDIER = 'SOLDIER',
	CAPO = 'CAPO',
	CONSIGLIERE = 'CONSIGLIERE',
	UNDERBOSS = 'UNDERBOSS'
}

export enum CoreAttribute {
	FORCE = 'Force', // Physical force, combat, protection, intimidation
	BRAINS = 'Brains', // Intelligence, planning, strategy, business acumen
	CUNNING = 'Cunning', // Survival skills, awareness, connections, practical knowledge
	INFLUENCE = 'Influence' // Charisma, respect, ability to command others
}

export interface IUnit {
	id: string;
	ownerId?: string;
	name: string;
	rank: UnitRank;
	nickname?: string;
	skills: {
		[CoreAttribute.FORCE]: number;
		[CoreAttribute.BRAINS]: number;
		[CoreAttribute.CUNNING]: number;
		[CoreAttribute.INFLUENCE]: number;
	};
	experience: number;
	level: number;
	loyalty: number;
	heat: number;
}
