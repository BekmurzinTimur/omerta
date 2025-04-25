import type { MissionInfo } from '$lib/models/MissionModels';
import { CoreAttribute } from '$lib/models/UnitModels';

export const getMissionExperience = (missionInfo: MissionInfo, amountOfUnits: number) => {
	return Math.round(
		(missionInfo.difficulty[CoreAttribute.MUSCLE] +
			missionInfo.difficulty[CoreAttribute.BRAINS] +
			missionInfo.difficulty[CoreAttribute.CUNNING] +
			missionInfo.difficulty[CoreAttribute.INFLUENCE]) /
			amountOfUnits
	);
};

// export const getMissionLoyality = (missionInfo: MissionInfo, amountOfUnits: number) => {
// 	return 5;
// };
