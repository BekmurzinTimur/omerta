<script lang="ts">
	/* --------‑‑ Imports & props ‑‑-------- */
	import { type IUnit, CoreAttribute } from '$lib/models/UnitModels';
	import { addWindow } from './DialogWindows/windowStore.svelte';
	import UnitCardBig from './UnitCardBig.svelte';

	let { unit, assigned }: { unit: IUnit; assigned?: boolean } = $props();

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
	class="flex max-w-[150px] min-w-[150px] flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 text-white shadow-lg"
	onclick={openDetails}
>
	<!-- Header with background image -->
	<div
		class="relative flex h-36 flex-col justify-end border-b border-gray-700 px-4 py-3"
		style="background:url('/mobsters/{unit.image}.png') center/cover"
	>
		<div class="mb-2 mb-auto text-sm leading-snug font-bold drop-shadow">
			<div class="mb-1 flex items-center gap-2">
				<div
					class="flex h-6 w-6 flex-col items-center justify-center rounded-full bg-amber-600 text-lg leading-0 font-bold"
				>
					{unit.level}
				</div>
				<div>{unit.name}</div>
			</div>
			<div class="text-gray-400">{unit.nickname}</div>
		</div>
		<div class="flex items-center justify-between text-xs">
			<span class="rounded bg-red-900 px-2 py-[2px] tracking-wide">{unit.rank}</span>
		</div>
	</div>

	<!-- Stats -->
	<div class="space-y-3 px-4 py-2 text-sm">
		<!-- Core skills -->
		<div>
			<div class="grid grid-cols-2 gap-x-4 gap-y-1">
				{#each Object.entries(unit.skills) as [skill, value]}
					<div class="flex items-center justify-between">
						<span
							class="inline-block h-5 w-5 shrink-0 rounded bg-no-repeat"
							style={iconStyle(ICON[skill])}
						/>
						<span class="font-mono">{value}</span>
					</div>
				{/each}
			</div>
		</div>
		<div class="border-1 border-gray-400"></div>

		<!-- Misc stats -->
		<div class="grid grid-cols-2 gap-y-1">
			{#each [['CUT', `${unit.cut}%`], ['LOYALTY', `${unit.loyalty}`], ['HEAT', `${unit.heat}%`]] as [label, val]}
				<div class="flex items-center justify-between">
					<span
						class="inline-block h-5 w-5 shrink-0 rounded bg-no-repeat"
						style={iconStyle(ICON[label])}
					/>
					<!-- <span class="ml-2 grow">{label}</span> -->
					<span
						class:text-green-400={label === 'LOYALTY'}
						class:text-red-400={label === 'HEAT'}
						class:text-yellow-400={label === 'CUT'}
					>
						{val}
					</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Footer -->
	<div class="mt-auto flex items-center justify-between bg-gray-900 px-4 py-2 text-xs">
		{#if assigned}
			<span class="mx-auto font-black uppercase">ASSIGNED</span>
		{:else}
			<span class="mx-auto font-black uppercase">{unit.status}</span>
		{/if}
	</div>
</div>
