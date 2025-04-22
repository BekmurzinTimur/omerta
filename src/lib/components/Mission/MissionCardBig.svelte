<!-- src/lib/components/MissionCard.svelte -->
<script lang="ts">
	import { MissionStatus } from '$lib/models/MissionModels';
	import type { IUnit } from '$lib/models/UnitModels';
	import {
		getAllUnitsMap,
		getTick,
		launchMission,
		getMission
	} from '$lib/services/GameController.svelte';
	import { calculateMissionSuccessChance, getTeamStats } from '$lib/utils/common';
	import type { DraggableItem } from '../DragAndDrop/DragAndDropTypes';
	import AssignUnit from '../Unit/AssignUnit.svelte';
	import UnitLocked from '../Unit/UnitLocked.svelte';
	import AttributesList from './AttributesList.svelte';
	import MissionStatusBadge from './MissionStatusBadge.svelte';

	/** The mission you want to display & launch */
	let { missionId }: { missionId: string } = $props();

	function onLaunch(missionId: string, unitIds: string[]) {
		launchMission(missionId, unitIds);
	}

	const maxSlots = 4;

	// local state of dropped units
	let assignments: (IUnit | undefined)[] = $state(Array(maxSlots).fill(undefined));

	let confirmed = $state(false);
	let teamStats = $derived.by(() => {
		return getTeamStats(assignments);
	});

	let mission = $derived(getMission(missionId)!);
	let successChance = $derived(calculateMissionSuccessChance(mission.info.difficulty, teamStats));
	let tick = $derived(getTick());
	let progress = $derived.by<number>(() => {
		if (!mission) return 0;
		if (mission.status === MissionStatus.AVAILABLE) return 0;
		if (mission.status !== MissionStatus.ACTIVE) return 100;
		let length = mission.endTick! - mission.startTick!;
		let tickPassed = tick - mission.startTick!;
		return Math.min(Math.round((tickPassed / length) * 100), 100);
	});

	// called by each slot when a unit is dropped
	function handleDrop(slotIndex: number) {
		return (result: { item: DraggableItem }) => {
			if (confirmed) return;
			assignments[slotIndex] = result.item.data as IUnit;
		};
	}

	// called by each slot when a unit is dropped
	function handleClear(slotIndex: number) {
		return () => {
			assignments[slotIndex] = undefined;
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
		src={mission.info.image}
		alt={mission.info.name}
		class="absolute inset-0 h-full w-full object-cover opacity-20"
	/>

	<div class="relative space-y-4 p-6">
		<!-- Mission title -->
		<div class="flex items-center justify-between">
			<h3 class="text-3xl font-bold">{mission.info.name}</h3>
			=
			<MissionStatusBadge status={mission.status} />=
		</div>
		<h4 class="text-xl font-bold">Success chance: {successChance}</h4>

		<div>
			<span class="font-semibold">Team Power:</span>
			<AttributesList stats={teamStats} />
			<span class="font-semibold">Difficulty:</span>
			<AttributesList stats={mission.info.difficulty} />
		</div>

		{#if mission.status !== MissionStatus.AVAILABLE}
			<div class="grid grid-cols-4 gap-4">
				{#each mission.unitIds as unitId}
					{@const unit = getAllUnitsMap().get(unitId)}
					{#if unit}
						<UnitLocked {unit} />
					{/if}
				{/each}
			</div>
			<div class="h-2 w-full overflow-hidden rounded-full bg-white/20">
				<div class="h-full bg-white transition-all" style="width: {progress}%" />
			</div>
		{:else}
			<div>
				<!-- Four drop‑zones for units -->
				<div class="grid grid-cols-4 gap-4">
					{#each Array(maxSlots) as _, idx}
						<AssignUnit
							id={'slot-' + idx}
							onDrop={handleDrop(idx)}
							onClear={handleClear(idx)}
							accepts={['member', 'associate']}
							assignedUnit={assignments[idx]}
							{confirmed}
							onRemove={handleRemove(idx)}
							disableRemove={confirmed}
							disabled={confirmed}
						/>
					{/each}
				</div>

				<!-- Power vs. Difficulty + Launch button -->
				<div class="flex items-center justify-between border-t border-gray-700 pt-4">
					<button
						class="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
						onclick={launch}
						disabled={confirmed || assignments.every((u) => !u)}
					>
						{#if confirmed}Launched{:else}Launch Mission{/if}
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
