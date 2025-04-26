/**
 * Formats a number as US dollars
 * - Below 1000: $768
 * - Thousands: $1.5k, $234.7k
 * - Millions: $1.6m
 * @param value The number to format
 * @returns Formatted string with dollar sign
 */
export const formatUSD = (value: number): string => {
	// Ensure the value is a positive number
	const absValue = Math.abs(value);

	// Handle numbers below 1000
	if (absValue < 1000) {
		return `$${Math.floor(absValue)}`;
	}

	// Handle thousands
	if (absValue < 1000000) {
		const formatted = (absValue / 1000).toFixed(1);
		// Remove trailing zero if decimal is .0
		const cleanFormatted = formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
		return `$${cleanFormatted}k`;
	}

	// Handle millions
	const formatted = (absValue / 1000000).toFixed(1);
	// Remove trailing zero if decimal is .0
	const cleanFormatted = formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
	return `$${cleanFormatted}m`;
};
