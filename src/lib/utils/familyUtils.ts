import { HEAT_LEVELS, MAX_CREW_SIZE } from '$lib/const/globalConstants';
import { UnitRank, type IUnit } from '$lib/models/UnitModels';

export const getMaxFamilySize = (units: IUnit[]) => {
	return units.reduce((prev, cur) => {
		return prev + (cur.rank === UnitRank.CAPO ? MAX_CREW_SIZE : 0);
	}, 0);
};

export const getHeatLevel = (heat: number) => {
	if (HEAT_LEVELS[3] < heat) {
		return 3;
	} else if (HEAT_LEVELS[2] < heat) {
		return 2;
	} else if (HEAT_LEVELS[1] < heat) {
		return 1;
	} else return 0;
};
