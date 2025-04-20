import { CoreAttribute } from '$lib/models/UnitModels';

export const getUnitImage = (imageNumber?: number) =>
	imageNumber ? `/mobsters/${imageNumber}.png` : '';

export function calculateMissionSuccessChance(
	missionRequirements: Record<CoreAttribute, number>,
	teamAttributes: Record<CoreAttribute, number>
): number {
	// Calculate individual success chances for each attribute
	const muscleChance = Math.min(
		95,
		(teamAttributes[CoreAttribute.MUSCLE] / missionRequirements[CoreAttribute.MUSCLE]) * 100
	);
	const brainsChance = Math.min(
		95,
		(teamAttributes[CoreAttribute.BRAINS] / missionRequirements[CoreAttribute.BRAINS]) * 100
	);
	const cunningChance = Math.min(
		95,
		(teamAttributes[CoreAttribute.CUNNING] / missionRequirements[CoreAttribute.CUNNING]) * 100
	);
	const influenceChance = Math.min(
		95,
		(teamAttributes[CoreAttribute.INFLUENCE] / missionRequirements[CoreAttribute.INFLUENCE]) * 100
	);

	// Return the minimum chance (weakest link)
	return Math.min(muscleChance, brainsChance, cunningChance, influenceChance);
}

/**
 * Determines if a mission succeeds or fails based on team attributes and mission requirements
 * @param missionRequirements The attribute requirements for the mission
 * @param teamAttributes The combined attributes of the team
 * @returns A boolean indicating success (true) or failure (false)
 */
export function checkMissionSuccess(
	missionRequirements: Record<CoreAttribute, number>,
	teamAttributes: Record<CoreAttribute, number>
): boolean {
	// Calculate the success chance
	const successChance = calculateMissionSuccessChance(missionRequirements, teamAttributes);

	// Roll once for the overall mission (1-100)
	const roll = Math.floor(Math.random() * 100) + 1;

	// Mission succeeds if roll is less than or equal to success chance
	return roll <= successChance;
}
