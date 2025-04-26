import { v4 as uuidv4 } from 'uuid';
import { CoreAttribute, UnitRank, UnitStatus, type IUnit } from '$lib/models/UnitModels';

const STAT_NAMES = [
	CoreAttribute.MUSCLE,
	CoreAttribute.BRAINS,
	CoreAttribute.CUNNING,
	CoreAttribute.INFLUENCE
];
const FIRST_NAMES = [
	'Mikey',
	'Jimmy',
	'Tony',
	'Luka',
	'Enzo',
	'Furio',
	'Vito',
	'John',
	'Carmine',
	'Dickie',
	'Paulie',
	'Vinny',
	'Salvatore',
	'Tommy',
	'Frankie'
];
const LAST_NAMES = [
	'Aprile',
	'Soprano',
	'Palmisi',
	'Lupertazi',
	'Brazi',
	'Corleone',
	'Moltisanti',
	'Rossi',
	'Bianchi',
	'Romano',
	'Moretti',
	'DeLuca',
	'Lucchesi',
	'Russo',
	'Ricci'
];
const IMAGES = 6;

export const generateUnit = ({
	rank,
	level,
	tier
}: {
	rank: UnitRank;
	level: number;
	tier: number;
}): IUnit => {
	const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
	const lastName = LAST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
	return {
		id: uuidv4(),
		name: `${firstName} ${lastName}`,
		ownerId: undefined,
		rank: rank,
		skills: {
			Muscle: Math.ceil(Math.random() * 3) + (tier - 1) * 3,
			Brains: Math.ceil(Math.random() * 3) + (tier - 1) * 3,
			Cunning: Math.ceil(Math.random() * 3) + (tier - 1) * 3,
			Influence: Math.ceil(Math.random() * 3) + (tier - 1) * 3
		},
		experience: 0,
		loyalty: 50,
		heat: 0,
		level: level,
		cut: getUnitCut({ rank, level }),
		status: UnitStatus.IDLE,
		image: Math.ceil(Math.random() * IMAGES)
	};
};

export const getUnitCut = ({ rank, level }: { rank: UnitRank; level: number }) => {
	switch (rank) {
		case UnitRank.ASSOCIATE:
			return 10 + level * 2;
		case UnitRank.SOLDIER:
			return 15 + level * 2;
		case UnitRank.CAPO:
			return 20 + level * 2;
		case UnitRank.UNDERBOSS:
			return 40 + level * 2;
		case UnitRank.CONSIGLIERE:
			return 40 + level * 2;
		default:
			return level * 2;
	}
};
interface IUnitTemplate {
	rank: UnitRank;
	level: number;
	tier: number;
}
export const generateStartingUnits = (composition: IUnitTemplate[]) => {
	let units: IUnit[] = [];
	composition.forEach((template) => {
		units.push(generateUnit(template));
	});

	return units;
};

export const generateStartingAssociates = (amount: number) => {
	let associates: IUnit[] = [];
	for (let i = 0; i < amount; i++) {
		associates.push(
			generateUnit({
				rank: UnitRank.ASSOCIATE,
				level: 1,
				tier: Math.ceil(Math.random() * 3)
			})
		);
	}
	return associates;
};

export const STARTING_COMPOSITION: IUnitTemplate[] = [
	{
		rank: UnitRank.CAPO,
		level: 3,
		tier: 3
	},
	{
		rank: UnitRank.SOLDIER,
		level: 2,
		tier: 2
	},
	{
		rank: UnitRank.SOLDIER,
		level: 1,
		tier: 1
	}
];

export const upgradeUnit = (unit: IUnit) => {
	unit.experience = unit.experience - 100;
	unit.level += 1;
	if (unit.experience >= 100) upgradeUnit(unit);
	unit.cut = getUnitCut(unit);
	upgradeRandomStat(unit);
	upgradeRandomStat(unit);
};

export const upgradeRandomStat = (unit: IUnit) => {
	const randomStatName = STAT_NAMES[Math.floor(Math.random() * STAT_NAMES.length)];
	unit.skills[randomStatName] += 1;
};

export const imprisonUnit = (unit: IUnit) => {
	unit.status = UnitStatus.PRISON;
	unit.heat = 100;
};

export const disloyalUnit = (unit: IUnit) => {
	unit.loyalty = 50;
	unit.ownerId = undefined;
};

export const _promoteUnit = (unit: IUnit) => {
	unit.rank = getPromotedRank(unit.rank);
	unit.cut = getUnitCut(unit);
};

export const getPromotedRank = (currentRank: UnitRank) => {
	if (currentRank === UnitRank.SOLDIER) {
		return UnitRank.CAPO;
	} else if (currentRank === UnitRank.CAPO) {
		return UnitRank.UNDERBOSS;
	}
	return UnitRank.SOLDIER;
};
