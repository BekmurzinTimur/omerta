import { v4 as uuidv4 } from 'uuid';
import {
	CoreAttribute,
	UnitRank,
	UnitStatus,
	type IUnit,
	type UnitAttributeMask
} from '$lib/models/UnitModels';
import {
	BASE_SALARY_CAPO,
	BASE_SALARY_CONSIGLIERI,
	BASE_SALARY_SOLDIER,
	BASE_SALARY_UNDERBOSS
} from '$lib/const/globalConstants';

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
	'Frankie',
	'Francesco'
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
	'Ricci',
	'Cusamano',
	'DeCoco',
	'Margharetti',
	'Gorlami',
	'Dimeo'
];
const IMAGES = 11;

export const generateUnit = ({ rank, level }: { rank: UnitRank; level: number }): IUnit => {
	const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
	const lastName = LAST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
	return {
		id: uuidv4(),
		name: `${firstName} ${lastName}`,
		ownerId: undefined,
		rank: rank,
		skills: {
			Muscle: Math.ceil(Math.random() * 10),
			Brains: Math.ceil(Math.random() * 10),
			Cunning: Math.ceil(Math.random() * 10),
			Influence: Math.ceil(Math.random() * 10)
		},
		mask: {
			Muscle: rank === UnitRank.ASSOCIATE ? true : false,
			Brains: rank === UnitRank.ASSOCIATE ? true : false,
			Cunning: rank === UnitRank.ASSOCIATE ? true : false,
			Influence: rank === UnitRank.ASSOCIATE ? true : false
		},
		experience: 0,
		loyalty: 50,
		heat: 50,
		level: level,
		cut: getUnitCut({ rank, level }),
		status: UnitStatus.IDLE,
		missions: [],
		image: Math.ceil(Math.random() * IMAGES),
		crew: UnitRank.CAPO ? [] : undefined
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
				level: 1
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
	unit.loyalty = 0;
	unit.ownerId = undefined;
};

export const _promoteUnit = (unit: IUnit) => {
	unit.rank = getPromotedRank(unit.rank);
	unit.cut = getUnitCut(unit);
	if (unit.rank === UnitRank.CAPO) {
		unit.crew = [];
	}
};

export const getPromotedRank = (currentRank: UnitRank) => {
	if (currentRank === UnitRank.SOLDIER) {
		return UnitRank.CAPO;
	} else if (currentRank === UnitRank.CAPO) {
		return UnitRank.UNDERBOSS;
	}
	return UnitRank.SOLDIER;
};

export const getSalary = (unit?: IUnit) => {
	if (!unit) return 0;
	switch (unit?.rank) {
		case UnitRank.SOLDIER:
			return BASE_SALARY_SOLDIER;
		case UnitRank.CAPO:
			return BASE_SALARY_CAPO;
		case UnitRank.UNDERBOSS:
			return BASE_SALARY_UNDERBOSS;
		case UnitRank.CONSIGLIERE:
			return BASE_SALARY_CONSIGLIERI;
		default:
			return 0;
	}
};

export const revealUnitAttribute = (mask: UnitAttributeMask) => {
	const hiddenAttributes: CoreAttribute[] = (Object.keys(mask) as CoreAttribute[]).filter(
		(attribute: CoreAttribute) => mask[attribute]
	);
	if (hiddenAttributes.length === 0) return mask;
	const newMask = { ...mask };
	const rnd = Math.floor(Math.random() * hiddenAttributes.length);
	console.log({ hiddenAttributes, rnd });
	newMask[hiddenAttributes[rnd] as CoreAttribute] = false;
	return newMask;
};

export const hasHiddenAttribute = (mask: UnitAttributeMask) => {
	const hiddenAttributes: CoreAttribute[] = (Object.keys(mask) as CoreAttribute[]).filter(
		(attribute: CoreAttribute) => mask[attribute]
	);
	return hiddenAttributes.length > 0;
};
