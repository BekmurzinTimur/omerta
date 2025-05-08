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
	class="flex w-[200px] flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 text-white shadow-lg"
	onclick={openDetails}
>
	<!-- Header with background image -->
	<div
		class="relative flex h-36 flex-col justify-end border-b border-gray-700 px-2 py-2"
		style="background:url('/mobsters/{unit.image}.png') center/cover"
	>
		<div class="mb-auto flex items-center justify-between text-xs">
			<span class="rounded bg-red-900 px-2 py-[2px] tracking-wide">{unit.rank}</span>
		</div>
		<div class="mb-1 flex items-end gap-2">
			<div
				class="flex h-6 w-6 min-w-6 flex-col items-center justify-center rounded-full bg-amber-600 text-lg leading-0 font-bold"
			>
				{unit.level}
			</div>

			<ProgressBar progress={unit.experience} />
		</div>
	</div>

	<!-- Stats -->
	<div class="space-y-4 px-4 py-4 text-sm">
		<!-- Core skills -->
		<div>
			<div class="grid grid-cols-2 gap-x-2 gap-y-4">
				{#each Object.entries(unit.skills) as [skill, value]}
					<div class="flex items-center gap-4">
						<IconTile label={skill} />
						<span class="text-xl font-bold">{unit.mask[skill as CoreAttribute] ? '?' : value}</span>
					</div>
				{/each}
			</div>
		</div>
		<div class="border-1 border-gray-400"></div>

		<!-- Misc stats -->
		<div class="grid grid-cols-2 gap-x-2 gap-y-4">
			{#each [['LOYALTY', `${unit.loyalty}`], ['HEAT', `${unit.heat}%`]] as [label, val]}
				<div class="flex items-center gap-4">
					<IconTile {label} />
					<span
						class="text-lg font-bold"
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
