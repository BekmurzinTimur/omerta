<!-- src/lib/components/MissionCard.svelte -->
<script lang="ts">
	import type { IMission } from '$lib/models/MissionModels';
	import type { IUnit } from '$lib/models/UnitModels';
	import { CoreAttribute } from '$lib/models/UnitModels';
	import type { DraggableItem } from '../DragAndDrop/DragAndDropTypes';
	import AssignUnit from '../Unit/AssignUnit.svelte';

	/** The mission you want to display & launch */
	export let mission: IMission;

	function onLaunch(missionId: string, unitIds: string[]) {}

	const maxSlots = 4;

	// local state of dropped units
	let assignments: (IUnit | undefined)[] = Array(maxSlots).fill(undefined);
	let confirmed = false;

	// reactive total of all skills across all assigned units
	$: teamPower = assignments
		.filter((u): u is IUnit => !!u)
		.reduce(
			(sum, unit) => sum + Object.values(unit.skills).reduce((attrSum, v) => attrSum + v, 0),
			0
		);

	// sum of all difficulty values
	$: missionDifficulty = Object.values(mission.difficulty).reduce((a, b) => a + b, 0);

	// called by each slot when a unit is dropped
	function handleDrop(slotIndex: number) {
		return (result: { item: DraggableItem }) => {
			if (confirmed) return;
			assignments[slotIndex] = result.item.data as IUnit;
		};
	}

	// called by each slot when the little “×” remove button is clicked
	function handleRemove(slotIndex: number) {
		return (unitId: string) => {
			if (confirmed) return;
			assignments[slotIndex] = undefined;
		};
	}

	function launch() {
		const unitIds = assignments.filter((u) => u).map((u) => u!.id);
		onLaunch(mission.id, unitIds);
		confirmed = true;
	}
</script>

<div class="relative overflow-hidden rounded-xl bg-gray-900 text-white shadow-lg">
	<!-- Background image, toned down -->
	<img
		src={mission.image}
		alt={mission.name}
		class="absolute inset-0 h-full w-full object-cover opacity-20"
	/>

	<div class="relative space-y-4 p-6">
		<!-- Mission title -->
		<h3 class="text-3xl font-bold">{mission.name}</h3>

		<!-- Difficulty by attribute -->
		<div class="flex space-x-6">
			{#each Object.entries(mission.difficulty) as [attr, value]}
				<div class="flex flex-col items-center">
					<span class="text-sm font-medium uppercase">{attr}</span>
					<span class="text-lg">{value}</span>
				</div>
			{/each}
		</div>

		<!-- Four drop‑zones for units -->
		<div class="grid grid-cols-4 gap-4">
			{#each Array(maxSlots) as _, idx}
				<AssignUnit
					id={'slot-' + idx}
					onDrop={handleDrop(idx)}
					accepts={['unit']}
					assignedUnit={assignments[idx]}
					{confirmed}
					onRemove={handleRemove(idx)}
					disableRemove={confirmed}
				/>
			{/each}
		</div>

		<!-- Power vs. Difficulty + Launch button -->
		<div class="flex items-center justify-between border-t border-gray-700 pt-4">
			<div>
				<span class="font-semibold">Team Power:</span>
				{teamPower}
				<span class="ml-6 font-semibold">Difficulty:</span>
				{missionDifficulty}
			</div>

			<button
				class="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
				onclick={launch}
				disabled={confirmed || assignments.every((u) => !u)}
			>
				{#if confirmed}Launched{:else}Launch Mission{/if}
			</button>
		</div>
	</div>
</div>
