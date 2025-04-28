/**
 * Converts ticks to a Date object, where one tick represents 2 hours
 * @param ticks Number of ticks (2-hour increments)
 * @param referenceDate Optional reference date from which to count ticks. Defaults to Unix epoch (Jan 1, 1970)
 * @returns Date object representing the date after the specified number of ticks
 */
function ticksToDate(ticks: number, referenceDate: Date = new Date(0)): Date {
	// Clone the reference date to avoid modifying it
	const resultDate = new Date(referenceDate.getTime());

	// Convert ticks to milliseconds (1 tick = 2 hours = 2 * 60 * 60 * 1000 ms)
	const milliseconds = ticks * 2 * 60 * 60 * 1000;

	// Add the milliseconds to the reference date
	resultDate.setTime(resultDate.getTime() + milliseconds);

	return resultDate;
}

/**
 * Calculates how many ticks (2-hour increments) are left until a target date
 * @param targetDate The target date to calculate ticks until
 * @param currentDate Optional current date to calculate from. Defaults to now.
 * @returns Number of ticks (2-hour increments) until the target date
 */
function ticksUntilDate(targetDate: Date, currentDate: Date = new Date()): number {
	// Calculate the time difference in milliseconds
	const timeDifference = targetDate.getTime() - currentDate.getTime();

	// Convert milliseconds to ticks (divide by 2 hours in milliseconds)
	const ticks = Math.floor(timeDifference / (2 * 60 * 60 * 1000));

	return ticks;
}

/**
 * Calculates how many ticks (2-hour increments) are between two dates
 * @param startDate The start date
 * @param endDate The end date
 * @returns Number of ticks (2-hour increments) between the two dates
 */
function ticksBetweenDates(startDate: Date, endDate: Date): number {
	// Calculate the time difference in milliseconds
	const timeDifference = endDate.getTime() - startDate.getTime();

	// Convert milliseconds to ticks (divide by 2 hours in milliseconds)
	const ticks = Math.floor(timeDifference / (2 * 60 * 60 * 1000));

	return ticks;
}

// Example usage:
// const now = new Date();
// const future = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours in the future

// const ticksLeft = ticksUntilDate(future, now);
// console.log(`Ticks until future date: ${ticksLeft}`); // Should be 12 ticks (24 hours / 2)

// const dateFromTicks = ticksToDate(12, now);
// console.log(`Date after 12 ticks from now: ${dateFromTicks}`); // Should be 24 hours from now

// const totalTicks = ticksBetweenDates(now, future);
// console.log(`Ticks between dates: ${totalTicks}`); // Should be 12 ticks
export { ticksBetweenDates, ticksToDate, ticksUntilDate };
