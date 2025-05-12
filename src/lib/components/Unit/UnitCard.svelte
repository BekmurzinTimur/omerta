<script lang="ts">
	/* --------‑‑ Imports & props ‑‑-------- */
	import { type IUnit, CoreAttribute, UnitStatus } from '$lib/models/UnitModels';
	import IconTile from '../Common/Icons/IconTile.svelte';
	import ProgressBar from '../Common/ProgressBar.svelte';
	import { addToast } from '../Common/Toaster/Toaster.svelte';
	import { addWindow } from '../DialogWindows/windowStore.svelte';
	import UnitCardBig from './UnitCardBig.svelte';

	let { unit, assigned }: { unit: IUnit; assigned?: boolean } = $props();

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
					<div class="flex items-center gap-4">
						<IconTile label={skill} />
						<span class="text-sm font-bold">{unit.mask[skill as CoreAttribute] ? '?' : value}</span>
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
