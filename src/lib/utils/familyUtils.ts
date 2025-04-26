import { MAX_CREW_SIZE } from '$lib/const/globalConstants';
import { UnitRank, type IUnit } from '$lib/models/UnitModels';

export const getMaxFamilySize = (units: IUnit[]) => {
	return units.reduce((prev, cur) => {
		return prev + (cur.rank === UnitRank.CAPO ? MAX_CREW_SIZE : 0);
	}, 0);
};
