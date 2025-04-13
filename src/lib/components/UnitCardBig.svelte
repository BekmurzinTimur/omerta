<script lang="ts">
	import type { IUnit } from '$lib/models/UnitModels';
	import { hireUnit } from '$lib/services/GameController.svelte';
	import Test from './DialogWindows/Test.svelte';
	import { addWindow } from './DialogWindows/windowStore.svelte';

	let { unit }: { unit: IUnit } = $props();

	$effect(() => {
		console.log('big card', unit);
	});
	function handlePromote() {
		hireUnit(unit.id);
	}
</script>

<div
	class="flex h-[300px] min-w-[300px] flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 text-white shadow-lg"
>
	<!-- Card header -->
	<div class="flex-grow border-b border-gray-700 px-4 py-3">
		<div class="flex">
			<div class="mb-1 text-xl font-bold">{unit.name} - {unit.nickname}</div>
		</div>
		<div class="flex items-center justify-between text-sm text-gray-400">
			<span class="rounded bg-red-900 px-2 py-0.5 text-xs">
				{unit.rank}
			</span>
		</div>
	</div>

	<!-- Stats section -->
	<div class="px-4 py-2">
		<div class="mb-3">
			<div class="mb-1 text-sm font-semibold text-gray-400">SKILLS</div>
			<div class="grid grid-cols-2 gap-2">
				{#each Object.entries(unit.skills) as [skill, value]}
					<div class="flex items-center justify-between">
						<span class="text-sm">{skill}</span>
						<div class="flex items-center">
							<span class="mr-1 font-mono text-sm">{value}</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Additional stats -->
		<div class="grid grid-cols-2 gap-1 text-sm">
			<div class="flex justify-between">
				<span class="text-gray-400">EXP</span>
				<span>{unit.experience}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-400">LVL</span>
				<span>{unit.level}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-400">LOYALTY</span>
				<span class="text-green-400">{unit.loyalty}%</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-400">HEAT</span>
				<span class="text-red-400">{unit.heat}%</span>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<div class="flex items-center justify-between bg-gray-900 px-4 py-2 text-xs">
		<span class="text-xs">ID: {unit.id}</span>
	</div>

	<button onclick={handlePromote}>Promote</button>
</div>
