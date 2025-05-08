<!-- src/lib/components/MissionCard.svelte -->
<script lang="ts">
	import { BASE_CHANCE_TO_CAUGHT } from '$lib/const/globalConstants';
	import { MissionStatus } from '$lib/models/MissionModels';
	import type { IUnit } from '$lib/models/UnitModels';
	import {
		getAllUnitsMap,
		getTick,
		launchMission,
		getMission,
		getLocalPlayer
	} from '$lib/services/GameController.svelte';
	import { calculateMissionSuccessChance, getTeamStats } from '$lib/utils/common';
	import { getHeatLevel } from '$lib/utils/familyUtils';
	import { formatUSD } from '$lib/utils/moneyUtils';
	import { getChanceToBeCaught } from '$lib/utils/statsUtils';
	import { hasHiddenAttribute } from '$lib/utils/unitUtils';
	import ProgressBar from '../Common/ProgressBar.svelte';
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
	let hasUnknownStats: boolean = $derived.by(() => {
		let result = false;
		assignments.forEach((unit) => {
			if (!unit) return;
			if (hasHiddenAttribute(unit.mask)) {
				result = true;
			}
		});
		return result;
	});

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

	let playerHeat = $derived(getLocalPlayer()?.resources.heat || 0);
	let totalCutPct = $derived(assignments.reduce((acc, unit) => acc + (unit?.cut ?? 0), 0) / 100);

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

<div class="relative">
	<!-- Mission backdrop -->
	<img
		src={mission.info.image}
		alt={mission.info.name}
		class="absolute inset-0 h-full w-full object-cover"
	/>
	<!-- Dark gradient overlay for contrast -->

	<!-- Card content -->
	<div class="relative space-y-6 p-6 text-white md:p-8">
		<!-- Header -->
		<div class="flex flex-wrap items-center justify-between gap-4">
			<h3 class="text-2xl leading-tight font-extrabold tracking-tight md:text-4xl">
				{mission.info.name}
			</h3>
			<MissionStatusBadge status={mission.status} />
		</div>

		<!-- Reward -->
		<div class="flex flex-wrap items-center gap-4 text-lg font-semibold md:text-xl">
			<span>{formatUSD(mission.info.reward)}</span>
			{#if mission.results?.money}
				<span class="text-green-400">(+{formatUSD(mission.results.money)})</span>
			{/if}
		</div>

		<!-- Cut % + internal progress bar -->
		<div class="space-y-2 p-4 shadow-inner backdrop-blur-sm">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2 text-sm font-medium md:text-base">
					<span>Your cut</span>
					<span>{(100 - totalCutPct * 100).toFixed(0)}%</span>
					<span>{formatUSD(mission.info.reward * (1 - totalCutPct))}</span>
				</div>
				<div class="flex items-center gap-2 text-sm font-medium md:text-base">
					<span>Team cut</span>
					<span>{(totalCutPct * 100).toFixed(0)}%</span>
				</div>
			</div>
			<ProgressBar progress={(1 - totalCutPct) * 100} />
		</div>

		<!-- Success chance & stats -->
		<div class="space-y-4 rounded-lg bg-white/5 p-4 shadow-inner backdrop-blur-sm">
			<div class="flex items-center gap-2 text-base font-bold md:text-lg">
				<span>Success chance</span>
				<span>{hasUnknownStats ? 'Unknown' : `${successChance.toFixed(0)}%`}</span>
			</div>
			<div class="space-y-4 text-sm">
				<div>
					<h5 class="mb-1 font-semibold">Team Power</h5>
					{#if hasUnknownStats}
						<span>Unknown</span>
					{:else}
						<AttributesList stats={teamStats} />
					{/if}
				</div>
				<div>
					<h5 class="mb-1 font-semibold">Difficulty</h5>
					<AttributesList stats={mission.info.difficulty} />
				</div>
			</div>
		</div>

		<!-- Assignment / Active view -->
		{#if mission.status !== MissionStatus.AVAILABLE}
			<!-- Active / Resolved state -->
			<div class="space-y-4">
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{#each mission.unitIds as unitId}
						{@const unit = getAllUnitsMap().get(unitId)}
						{#if unit}
							<UnitLocked {unit} />
						{/if}
					{/each}
				</div>
				<div
					class="h-3 w-full overflow-hidden rounded-full bg-white/20"
					role="progressbar"
					aria-valuenow={progress}
					aria-valuemin="0"
					aria-valuemax="100"
				>
					<div class="h-full bg-white transition-all duration-500" style="width: {progress}%" />
				</div>
			</div>
		{:else}
			<!-- Available state -->
			<div class="space-y-6">
				<!-- Unit slots -->
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{#each Array(maxSlots) as _, idx}
						<div>
							<AssignUnit
								id={'mission-' + mission.id + '-' + idx}
								onDrop={handleDrop(idx)}
								onClear={handleClear(idx)}
								accepts={['member', 'associate']}
								assignedUnit={assignments[idx]}
								{confirmed}
								onRemove={handleRemove(idx)}
								disableRemove={confirmed}
								disabled={confirmed}
							/>
							{#if assignments[idx]}
								{@const heatLevel = getHeatLevel(playerHeat)}
								{@const unit = assignments[idx]}
								<div class="text-xs font-bold text-red-500">
									Chance to get caught: {getChanceToBeCaught(
										BASE_CHANCE_TO_CAUGHT[heatLevel],
										0,
										unit.heat
									)}%
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Launch button -->
				<div class="flex items-center justify-between">
					<button
						class="rounded-lg bg-blue-600 px-6 py-2 font-semibold transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
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
