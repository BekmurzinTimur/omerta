<script lang="ts">
	/* --------‑‑ Imports & props ‑‑-------- */
	import { type IUnit, CoreAttribute, UnitStatus } from '$lib/models/UnitModels';
	import { getAllUnitsMap } from '$lib/services/GameController.svelte';
	import IconTile from '../Common/Icons/IconTile.svelte';
	import { onMount } from 'svelte';
	import ProgressBar from '../Common/ProgressBar.svelte';
	import { addToast } from '../Common/Toaster/Toaster.svelte';
	import { addWindow } from '../DialogWindows/windowStore.svelte';
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

	let allUnitsMap = $derived(getAllUnitsMap());
	let capo = $derived(allUnitsMap.get(unit.captainId || ''));

	$effect(() => {
		if (unit.status === UnitStatus.PRISON) {
			addToast({
				data: {
					title: unit.name,
					description: `Unit ${unit.name} have been imprisoned`
				}
			});
		}
	});
	$effect(() => {
		if (unit.loyalty === 0) {
			addToast({
				data: {
					title: unit.name,
					description: `Unit ${unit.name} became disloyal and quit family`
				}
			});
		}
	});
	/* --------‑‑ Window launcher ‑‑-------- */
	function openDetails() {
		console.log(unit, unit.id);
		addWindow({
			id: `window-${unit.id}`,
			title: `${unit.name}`,
			content: { component: UnitCardBig, props: { unitId: unit.id } },
			position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
			size: { width: 600, height: 500 }
		});
	}
</script>

<!-- ------------‑‑ Card root ‑‑------------ -->
<div
	class="flex w-[150px] flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 text-white shadow-lg"
	onclick={openDetails}
>
	<!-- Header with background image -->
	<div
		class="relative flex h-24 flex-col justify-end border-b border-gray-700 px-2 py-2"
		style="background:url('/mobsters/{unit.image}.png') center/cover"
	>
		<div class="mb-auto flex items-center justify-between text-xs">
			<span class="rounded bg-red-900 px-2 py-[2px] tracking-wide">{unit.rank}</span>
		</div>
		<div class="mb-1 flex items-end gap-2">
			<div
				class="flex h-4 w-4 min-w-4 flex-col items-center justify-center rounded-full bg-amber-600 text-sm font-bold"
			>
				{unit.level}
			</div>

			<ProgressBar progress={unit.experience} />
		</div>
	</div>

	<!-- Stats -->
	<div class="space-y-2 p-2 text-sm">
		<!-- Core skills -->
		<div>
			<div class="grid grid-cols-2 gap-x-2 gap-y-2">
				{#each Object.entries(unit.skills) as [skill, value]}
					{@const bonusValue = Math.floor((capo?.skills[skill as CoreAttribute] || 0) / 5)}
					<div class="flex items-center gap-2 whitespace-nowrap">
						<IconTile label={skill} />
						<span class="text-right text-sm"
							>{unit.mask[skill as CoreAttribute] ? '?' : value}
							{#if bonusValue}<span class="text-sm text-green-400">+ {bonusValue}</span>{/if}</span
						>
					</div>
				{/each}
			</div>
		</div>
		<div class="border-1 border-gray-400"></div>

		<!-- Misc stats -->
		<div class="grid grid-cols-2 gap-x-2 gap-y-2">
			{#each [['LOYALTY', `${unit.loyalty}`], ['HEAT', `${unit.heat}%`]] as [label, val]}
				<div class="flex items-center gap-2">
					<IconTile {label} />
					<span
						class="text-sm font-bold"
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
