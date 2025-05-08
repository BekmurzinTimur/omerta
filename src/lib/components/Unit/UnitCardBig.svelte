<script lang="ts">
	/* --------‑‑ Imports & props ‑‑-------- */
	import { CoreAttribute } from '$lib/models/UnitModels';
	import {
		getLocalPlayer,
		getMissions,
		getUnit,
		hireUnit,
		isFamilyFull,
		promoteUnit
	} from '$lib/services/GameController.svelte';
	import { formatUSD } from '$lib/utils/moneyUtils';
	import { getSalary } from '$lib/utils/unitUtils';
	import IconTile from '../Common/Icons/IconTile.svelte';
	import MissionCard from '../Mission/MissionCard.svelte';

	let { unitId }: { unitId: string } = $props();

	let unit = $derived(getUnit(unitId));
	let player = $derived(getLocalPlayer());
	let isPlayerUnit = $derived(player && unit && unit.ownerId === player.id);
	let familyFull = $derived(isFamilyFull());
	let salary = $derived(getSalary(unit));
	let assignments = $derived(getMissions(unit?.missions || []));

	$effect(() => {
		console.log({ unit }, unit?.loyalty);
	});
	$inspect(unit);
	$inspect(unitId);
	/* --------‑‑ Spritesheet helpers ‑‑-------- */
	const ICON_SHEET = '/icons/IconPack.png'; // ✔️  adjust if you store it elsewhere
	const TILE = 80 / 4; // 20px

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

	function handlePromote() {
		if (!unit) return;
		console.log(unit, isPlayerUnit, player);
		if (isPlayerUnit) return promoteUnit(unit.id);
		hireUnit(unit.id);
	}

	// Mock data for assignments
	const currentAssignment = {
		title: 'Bank Heist: First National',
		role: 'Muscle',
		duration: '3 days',
		reward: '$5,000',
		risk: 'Medium'
	};

	const assignmentHistory = [
		{
			title: 'Protection Racket: Little Italy',
			role: 'Enforcer',
			duration: '2 weeks',
			completed: '03/15/2025',
			outcome: 'Success'
		},
		{
			title: 'Casino Infiltration',
			role: 'Inside Man',
			duration: '5 days',
			completed: '02/28/2025',
			outcome: 'Partial Success'
		},
		{
			title: 'Rival Intimidation',
			role: 'Muscle',
			duration: '1 day',
			completed: '02/10/2025',
			outcome: 'Failure'
		}
	];
</script>

<!-- ------------‑‑ Card root (larger and horizontal) ‑‑------------ -->
<div
	class="flex h-[550px] w-[900px] overflow-hidden border border-gray-700 bg-gray-800 text-white shadow-lg"
>
	{#if unit}
		<!-- Left section: Image and main info -->
		<div class="flex w-1/3 flex-col border-r border-gray-700">
			<!-- Character image -->
			<div
				class="relative h-[320px] border-b border-gray-700"
				style="background:url('/mobsters/{unit.image}.png') center/cover"
			>
				<span
					class="absolute top-3 left-3 flex h-10 w-10 flex-col items-center justify-center rounded-full bg-amber-600 text-lg leading-0 font-bold"
				>
					{unit.level}
				</span>
				<!-- Rank badge, positioned in top-right corner -->
				<span class="absolute top-3 right-3 rounded bg-red-900 px-3 py-1 font-bold tracking-wide">
					{unit.rank}
				</span>
			</div>

			<!-- Character info -->
			<div class="flex flex-grow flex-col space-y-2 p-4">
				<h2 class="text-xl font-bold">
					{unit.name}
				</h2>
				{#if unit.nickname}
					<h3 class="text-lg text-gray-300">"{unit.nickname}"</h3>
				{/if}
				{#if salary}
					<h4 class="text-lg text-red-300">Salary: {formatUSD(salary)}</h4>
				{/if}
				<div class="mt-auto flex items-center justify-between">
					<span class="text-sm text-gray-400">ID: {unit.id}</span>
					<button
						type="button"
						class="rounded bg-gray-700 px-4 py-2 text-sm hover:bg-gray-600 disabled:cursor-not-allowed disabled:bg-gray-600"
						onclick={handlePromote}
						disabled={familyFull && !isPlayerUnit}
					>
						{isPlayerUnit ? 'Promote' : 'Recruit'}
					</button>
				</div>
			</div>
		</div>

		<!-- Center section: Stats with labels -->
		<div class="flex w-1/3 flex-col border-r border-gray-700 p-6">
			<h3 class="mb-4 border-b border-gray-700 pb-2 text-lg font-bold">Attributes & Stats</h3>

			<!-- Core attributes -->
			<div class="mb-6">
				<h4 class="mb-2 text-sm text-gray-400 uppercase">Core Attributes</h4>
				<div class="space-y-6">
					{#each Object.entries(unit.skills) as [skill, value]}
						<div class="flex items-center gap-8">
							<IconTile label={skill} />
							<span class="ml-3 w-24 text-lg font-bold capitalize">{skill.toLowerCase()}</span>
							<span class="font-mono text-lg"
								>{unit.mask[skill as CoreAttribute] ? '?' : value}</span
							>
						</div>
					{/each}
				</div>
			</div>

			<!-- Secondary stats -->
			<div>
				<h4 class="mb-2 text-sm text-gray-400 uppercase">Secondary Stats</h4>
				<div class="space-y-6">
					<div class="flex items-center gap-8">
						<IconTile label={'CUT'} />
						<span class="ml-3 w-24 text-lg font-bold capitalize">Cut</span>
						<span class="font-mono text-lg text-yellow-400">{unit.cut}%</span>
					</div>

					<div class="flex items-center gap-8">
						<IconTile label={'LOYALTY'} />
						<span class="ml-3 w-24 text-lg font-bold capitalize">Loyalty</span>
						<span class="font-mono text-lg text-green-400">{unit.loyalty}</span>
					</div>

					<div class="flex items-center gap-8">
						<IconTile label={'HEAT'} />
						<span class="ml-3 w-24 text-lg font-bold capitalize">Heat</span>
						<span class="font-mono text-lg text-red-400">{unit.heat}%</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Right section: Current assignment and history -->
		<div class="flex h-full w-1/3 flex-col overflow-auto p-6">
			<h3 class="mb-4 border-b border-gray-700 pb-2 text-lg font-bold">Assignments</h3>

			{#each assignments as assignment}
				<MissionCard mission={assignment} />
			{/each}
		</div>
	{:else}
		Unit {unitId} not found
	{/if}
</div>
