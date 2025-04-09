// const date = $state(new Date('01-01-1960'))
export const gameState = $state({ date: new Date('01-01-1960') });

let interval: number = 0;

export const startTime = () => {
	if (interval) return;
	interval = setInterval(() => {
		const newTime = new Date(gameState.date.getTime() + 1000 * 60 * 60 * 2);
		gameState.date = newTime;
	}, 1000);
};

export const stopTime = () => {
	if (!interval) return;
	clearInterval(interval);
	interval = 0;
};
