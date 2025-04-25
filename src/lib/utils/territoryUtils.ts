import { CoreAttribute, type IUnit } from '$lib/models/UnitModels';

export const getManagerMultiplier = (unit: IUnit) => {
	return (100 + unit.skills[CoreAttribute.BRAINS] + unit.skills[CoreAttribute.INFLUENCE]) / 100;
};
