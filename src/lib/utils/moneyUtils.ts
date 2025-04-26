// moneyUtils.ts
export const formatUSD = (value: number): string => {
	// Store the sign
	const isNegative = value < 0;
	const absValue = Math.abs(value);

	// Format the result
	let result: string;

	// Handle numbers below 1000
	if (absValue < 1000) {
		result = `$${Math.floor(absValue)}`;
	}
	// Handle thousands
	else if (absValue < 1000000) {
		const formatted = (absValue / 1000).toFixed(1);
		// Remove trailing zero if decimal is .0
		const cleanFormatted = formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
		result = `$${cleanFormatted}k`;
	}
	// Handle millions
	else {
		const formatted = (absValue / 1000000).toFixed(1);
		// Remove trailing zero if decimal is .0
		const cleanFormatted = formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
		result = `$${cleanFormatted}m`;
	}

	// Add negative sign if needed
	return isNegative ? `-${result}` : result;
};
