<script lang="ts">
	/* --------‑‑ Imports & props ‑‑-------- */
	import { type IUnit, CoreAttribute } from '$lib/models/UnitModels';
	import { hireUnit } from '$lib/services/GameController.svelte';

	let { unit }: { unit: IUnit } = $props();

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
	class="flex h-[550px] w-[900px] overflow-hidden rounded-lg border border-gray-700 bg-gray-800 text-white shadow-lg"
>
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

			<div class="mt-auto flex items-center justify-between">
				<span class="text-sm text-gray-400">ID: {unit.id}</span>
				<button
					type="button"
					class="rounded bg-gray-700 px-4 py-2 text-sm hover:bg-gray-600"
					onclick={handlePromote}
				>
					Promote
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
			<div class="space-y-3">
				{#each Object.entries(unit.skills) as [skill, value]}
					<div class="flex items-center">
						<span
							class="inline-block h-6 w-6 rounded bg-no-repeat"
							style={iconStyle(ICON[skill])}
						/>
						<span class="ml-3 w-24 capitalize">{skill.toLowerCase()}</span>
						<span class="font-mono text-lg">{value}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Secondary stats -->
		<div>
			<h4 class="mb-2 text-sm text-gray-400 uppercase">Secondary Stats</h4>
			<div class="space-y-3">
				<div class="flex items-center">
					<span class="inline-block h-6 w-6 rounded bg-no-repeat" style={iconStyle(ICON['CUT'])} />
					<span class="ml-3 w-24">Cut</span>
					<span class="font-mono text-lg text-yellow-400">{unit.cut}%</span>
				</div>

				<div class="flex items-center">
					<span
						class="inline-block h-6 w-6 rounded bg-no-repeat"
						style={iconStyle(ICON['LOYALTY'])}
					/>
					<span class="ml-3 w-24">Loyalty</span>
					<span class="font-mono text-lg text-green-400">{unit.loyalty}</span>
				</div>

				<div class="flex items-center">
					<span class="inline-block h-6 w-6 rounded bg-no-repeat" style={iconStyle(ICON['HEAT'])} />
					<span class="ml-3 w-24">Heat</span>
					<span class="font-mono text-lg text-red-400">{unit.heat}%</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Right section: Current assignment and history -->
	<div class="flex w-1/3 flex-col p-6">
		<h3 class="mb-4 border-b border-gray-700 pb-2 text-lg font-bold">Assignments</h3>

		<!-- Current assignment -->
		<div class="mb-6">
			<h4 class="mb-2 text-sm text-gray-400 uppercase">Current Assignment</h4>
			<div class="rounded bg-gray-700 p-3">
				<div class="font-bold text-yellow-300">{currentAssignment.title}</div>
				<div class="mt-2 grid grid-cols-2 gap-1 text-sm">
					<span class="text-gray-400">Role:</span>
					<span>{currentAssignment.role}</span>

					<span class="text-gray-400">Duration:</span>
					<span>{currentAssignment.duration}</span>

					<span class="text-gray-400">Reward:</span>
					<span class="text-green-400">{currentAssignment.reward}</span>

					<span class="text-gray-400">Risk:</span>
					<span class="text-orange-400">{currentAssignment.risk}</span>
				</div>
			</div>
		</div>

		<!-- Assignment history -->
		<div>
			<h4 class="mb-2 text-sm text-gray-400 uppercase">Assignment History</h4>
			<div class="max-h-[280px] space-y-2 overflow-y-auto pr-2">
				{#each assignmentHistory as assignment}
					<div class="rounded bg-gray-700 p-2 text-sm">
						<div class="font-bold">{assignment.title}</div>
						<div class="mt-1 flex justify-between text-xs">
							<span>{assignment.role}</span>
							<span>{assignment.completed}</span>
						</div>
						<div class="flex justify-between text-xs">
							<span>{assignment.duration}</span>
							<span
								class:text-green-400={assignment.outcome === 'Success'}
								class:text-yellow-400={assignment.outcome === 'Partial Success'}
								class:text-red-400={assignment.outcome === 'Failure'}
							>
								{assignment.outcome}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
