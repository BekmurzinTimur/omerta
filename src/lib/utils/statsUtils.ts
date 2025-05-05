export const getChanceToBeCaught = (
	baseChance: number,
	missionChance: number,
	unitHeat: number
) => {
	return (baseChance + missionChance) * ((100 + unitHeat) / 100);
};

export const wasCaught = (chance: number) => {
	const rnd = Math.round(Math.random() * 100);
	return rnd < chance;
};
