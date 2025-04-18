import { UnitRank, type IUnit } from '$lib/models/UnitModels';

export const mockUnits: IUnit[] = [
	{
		id: '_unit1',
		name: 'Vinny Malone',
		nickname: 'The Shark',
		ownerId: undefined,
		rank: UnitRank.ASSOCIATE,
		skills: {
			Muscle: 7,
			Brains: 4,
			Cunning: 5,
			Influence: 3
		},
		experience: 42,
		loyalty: 80,
		heat: 35,
		level: 4,
		cut: 10,
		image: 1
	},
	{
		id: '_unit2',
		name: 'Salvatore Ricci',
		nickname: 'Numbers',
		ownerId: undefined,
		rank: UnitRank.ASSOCIATE,
		skills: {
			Muscle: 2,
			Brains: 8,
			Cunning: 7,
			Influence: 6
		},
		experience: 78,
		loyalty: 65,
		heat: 15,
		level: 7,
		cut: 10,
		image: 1
	},
	{
		id: '_unit3',
		name: 'Maria Vasquez',
		nickname: 'Ice Queen',
		ownerId: undefined,
		rank: UnitRank.ASSOCIATE,
		skills: {
			Muscle: 5,
			Brains: 9,
			Cunning: 8,
			Influence: 7
		},
		experience: 95,
		loyalty: 90,
		heat: 40,
		level: 8,
		cut: 10,
		image: 1
	},
	{
		id: '_unit4',
		name: 'Tommy Russo',
		nickname: 'Two-Time',
		ownerId: undefined,
		rank: UnitRank.ASSOCIATE,
		skills: {
			Muscle: 6,
			Brains: 3,
			Cunning: 4,
			Influence: 5
		},
		experience: 20,
		loyalty: 45,
		heat: 30,
		level: 2,
		cut: 10,
		image: 1
	},
	{
		id: '_unit5',
		name: 'Carmine Lucchesi',
		nickname: 'The Ghost',
		ownerId: undefined,
		rank: UnitRank.ASSOCIATE,
		skills: {
			Muscle: 3,
			Brains: 10,
			Cunning: 9,
			Influence: 8
		},
		experience: 120,
		loyalty: 85,
		heat: 10,
		level: 9,
		cut: 10,
		image: 1
	},
	{
		id: '_unit6',
		name: 'Frankie DeLuca',
		nickname: 'Knuckles',
		ownerId: undefined,
		rank: UnitRank.ASSOCIATE,
		skills: {
			Muscle: 9,
			Brains: 2,
			Cunning: 3,
			Influence: 4
		},
		experience: 38,
		loyalty: 70,
		heat: 45,
		level: 3,
		cut: 10,
		image: 1
	},
	{
		id: '_unit7',
		name: 'Sophia Moretti',
		nickname: 'Silencer',
		ownerId: undefined,
		rank: UnitRank.ASSOCIATE,
		skills: {
			Muscle: 6,
			Brains: 7,
			Cunning: 9,
			Influence: 5
		},
		experience: 85,
		loyalty: 75,
		heat: 25,
		level: 6,
		cut: 10,
		image: 1
	},
	{
		id: '_unit8',
		name: 'Don Romano',
		nickname: 'Big Money',
		ownerId: undefined,
		rank: UnitRank.ASSOCIATE,
		skills: {
			Muscle: 8,
			Brains: 8,
			Cunning: 8,
			Influence: 10
		},
		experience: 150,
		loyalty: 100,
		heat: 60,
		level: 10,
		cut: 10,
		image: 1
	},
	{
		id: '_unit9',
		name: 'Luca Bianchi',
		nickname: 'The Fixer',
		ownerId: undefined,
		rank: UnitRank.ASSOCIATE,
		skills: {
			Muscle: 5,
			Brains: 6,
			Cunning: 8,
			Influence: 7
		},
		experience: 55,
		loyalty: 60,
		heat: 20,
		level: 5,
		cut: 10,
		image: 1
	},
	{
		id: '_unit10',
		name: 'Enzo Rossi',
		nickname: 'The Cleaner',
		ownerId: undefined,
		rank: UnitRank.ASSOCIATE,
		skills: {
			Muscle: 4,
			Brains: 5,
			Cunning: 6,
			Influence: 2
		},
		experience: 15,
		loyalty: 50,
		heat: 5,
		level: 1,
		cut: 10,
		image: 1
	}
];
