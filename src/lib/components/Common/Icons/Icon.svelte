<script lang="ts">
	import { CoreAttribute } from '$lib/models/UnitModels';

	let { className, text }: { className?: string; text?: string } = $props();

	/* --------‑‑ Spritesheet helpers ‑‑-------- */
	const ICON_SHEET = '/icons/IconPack.png'; // ✔️  adjust if you store it elsewhere
	const TILE = 80 / 4; // 230 px

	/** Row/col lookup inside the 4×4 sheet                      */
	const ICON: Record<string, [number, number]> = {
		/* 4 core attributes */
		[CoreAttribute.MUSCLE]: [2, 2], // knuckles
		[CoreAttribute.BRAINS]: [2, 0], // bank
		[CoreAttribute.CUNNING]: [1, 2], // playing cards
		[CoreAttribute.INFLUENCE]: [0, 3], // skyscraper

		/* extra stats */
		EXP: [1, 3], // checklist
		LVL: [1, 2], // playing cards
		LOYALTY: [2, 3], // wiskey
		CUT: [3, 2], // hand with cash
		HEAT: [0, 2] // cigar
	};

	/** CSS background‑image style for a given sprite tile */
	const iconStyle = (tile?: [number, number]) => {
		if (!tile) return ''; // <- graceful fallback
		const [r, c] = tile;
		return `
			background-image: url('${ICON_SHEET}');
			background-size: 80px 80px;
			background-position: -${c * TILE}px -${r * TILE}px;
		`;
	};
</script>

<span
	class={'inline-flex size-5 flex-col items-center justify-center  rounded-full bg-red-500 text-xs text-white' +
		(className ? ' ' + className : '')}
>
	{text}
</span>
