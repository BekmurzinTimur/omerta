import { CoreAttribute } from '$lib/models/UnitModels';

/** Row/col lookup inside the 4×4 sheet                      */
export const ICON_LABELS: Record<string, [number, number]> = {
	/* 4 core attributes */
	[CoreAttribute.MUSCLE]: [2, 2], // knuckles
	[CoreAttribute.BRAINS]: [2, 0], // bank
	[CoreAttribute.CUNNING]: [1, 2], // playing cards
	[CoreAttribute.INFLUENCE]: [0, 3], // skyscraper

	/* extra stats */
	EXP: [1, 3], // checklist
	LVL: [1, 2], // playing cards
	LOYALTY: [2, 3], // wiskey
	CUT: [3, 2], // hand with cash
	HEAT: [0, 2], // cigar
	MONEY: [1, 0],
	FILES: [2, 1]
};
