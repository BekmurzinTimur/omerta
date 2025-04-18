<script lang="ts">
	/* --------‑‑ Imports & props ‑‑-------- */
	import { type IUnit, CoreAttribute } from '$lib/models/UnitModels';
	import { addWindow } from './DialogWindows/windowStore.svelte';
	import UnitCardBig from './UnitCardBig.svelte';

	let { unit }: { unit: IUnit } = $props();

	/* --------‑‑ Spritesheet helpers ‑‑-------- */
	const ICON_SHEET = '/icons/IconPack.png'; // ✔️  adjust if you store it elsewhere
	const TILE = 80 / 4; // 230 px

	/** Row/col lookup inside the 4×4 sheet                      */
	const ICON: Record<string, [number, number]> = {
		/* 4 core attributes */
		[CoreAttribute.MUSCLE]: [0, 0], // revolver
		[CoreAttribute.BRAINS]: [2, 0], // bank
		[CoreAttribute.CUNNING]: [2, 2], // knuckles
		[CoreAttribute.INFLUENCE]: [0, 3], // skyscraper

		/* extra stats */
		EXP: [1, 3], // checklist
		LVL: [1, 2], // playing cards
		LOYALTY: [3, 2], // hand w/ cash
		HEAT: [0, 2] // cigar
	};

	/** CSS background‑image style for a given sprite tile */
	const iconStyle = (tile?: [number, number]) => {
		console.log({ tile });
		if (!tile) return ''; // <- graceful fallback
		const [r, c] = tile;
		return `
			background-image: url('${ICON_SHEET}');
			background-size: 80px 80px;
			background-position: -${c * TILE}px -${r * TILE}px;
		`;
	};

	/* --------‑‑ Window launcher ‑‑-------- */
	function openDetails() {
		addWindow({
			id: `window-${Date.now()}`,
			title: `Unit: ${unit.name}`,
			content: { component: UnitCardBig, props: { unit } },
			position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
			size: { width: 600, height: 500 }
		});
	}
</script>

<!-- ------------‑‑ Card root ‑‑------------ -->
<div
	class="flex h-[340px] w-[360px] flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 text-white shadow-lg"
>
	<!-- Header with background image -->
	<div
		class="relative flex h-36 flex-col justify-end border-b border-gray-700 px-4 pb-3"
		style="background:url('/mobsters/{unit.image}.png') center/cover"
	>
		<div class="text-lg leading-snug font-bold drop-shadow">
			{unit.name}{unit.nickname ? ` – ${unit.nickname}` : ''}
		</div>
		<div class="flex items-center justify-between text-xs">
			<span class="rounded bg-red-900 px-2 py-[2px] tracking-wide">{unit.rank}</span>
			<button
				type="button"
				class="rounded bg-gray-900/70 px-3 py-1 text-xs hover:bg-gray-900"
				on:click={openDetails}
				aria-label="Show unit details"
			>
				Details
			</button>
		</div>
	</div>

	<!-- Stats -->
	<div class="space-y-3 px-4 py-2 text-sm">
		<!-- Core skills -->
		<div>
			<div class="mb-1 font-semibold text-gray-400">SKILLS</div>
			<div class="grid grid-cols-2 gap-x-4 gap-y-1">
				{#each Object.entries(unit.skills) as [skill, value]}
					<div class="flex items-center justify-between">
						<span
							class="inline-block h-5 w-5 shrink-0 rounded bg-no-repeat"
							style={iconStyle(ICON[skill])}
						/>
						<span class="ml-2 grow truncate capitalize">{skill}</span>
						<span class="font-mono">{value}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Misc stats -->
		<div class="grid grid-cols-2 gap-y-1">
			{#each [['EXP', unit.experience], ['LVL', unit.level], ['LOYALTY', `${unit.loyalty}%`], ['HEAT', `${unit.heat}%`]] as [label, val]}
				<div class="flex items-center justify-between">
					<span
						class="inline-block h-5 w-5 shrink-0 rounded bg-no-repeat"
						style={iconStyle(ICON[label])}
					/>
					<span class="ml-2 grow">{label}</span>
					<span class:text-green-400={label === 'LOYALTY'} class:text-red-400={label === 'HEAT'}>
						{val}
					</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Footer -->
	<div class="mt-auto flex items-center justify-between bg-gray-900 px-4 py-2 text-xs">
		<span>ID: {unit.id}</span>
		<span class="font-mono">Cut {unit.cut}%</span>
	</div>
</div>
