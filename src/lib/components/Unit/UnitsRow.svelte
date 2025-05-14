<script lang="ts">
	import { UnitRank, UnitStatus } from '$lib/models/UnitModels';
	import { getUsedUnits } from '$lib/services/UiState.svelte';
	import { getMaxFamilySize } from '$lib/utils/familyUtils';
	import { getAssociates, getPlayerUnits, getTick } from '../../services/GameController.svelte';
	import Draggable from '../DragAndDrop/Draggable.svelte';
	import Crew from './Crews/Crew.svelte';
	import UnitCard from './UnitCard.svelte';
	import { Button } from 'bits-ui';
	import UnitCardSmall from './UnitCardSmall.svelte';

	let tick: number = $derived(getTick());

	// Get all units in the game
	let usedUnits = $derived(getUsedUnits());
	let units = $derived(getPlayerUnits());
	let capos = $derived(getPlayerUnits().filter((unit) => unit.rank === UnitRank.CAPO));
	let soldiers = $derived(getPlayerUnits().filter((unit) => unit.rank === UnitRank.SOLDIER));
	let associates = $derived(getAssociates());
	let maxFamilySize = $derived(getMaxFamilySize(units));
	let tab = $state<'crews' | 'soldiers' | 'associates'>('crews');
	// let displayUnits = $derived.by(() => (tab === 'members' ? capos : associates));

	$effect(() => {
		tick;
		usedUnits.clear();
	});
</script>

<footer class="pointer-events-none absolute right-0 bottom-0 left-0 flex items-end p-2 text-white">
	<div class="mr-2 flex flex-col items-stretch gap-2">
		<Button.Root
			class="bg-dark shadow-mini hover:bg-dark/95 pointer-events-auto inline-flex  h-12 items-center justify-center rounded-lg bg-white px-2
    py-1 text-sm font-semibold 
    text-black active:scale-[0.98] active:transition-all"
			onclick={() => {
				tab = 'crews';
			}}>Crews <br /> {units.length} / {maxFamilySize}</Button.Root
		>
		<Button.Root
			class="bg-dark shadow-mini hover:bg-dark/95 pointer-events-auto inline-flex  h-12 items-center justify-center rounded-lg bg-white px-4
    py-2 text-sm font-semibold 
    text-black active:scale-[0.98] active:transition-all"
			onclick={() => {
				tab = 'soldiers';
			}}>Soldiers</Button.Root
		>
		<Button.Root
			class="bg-dark shadow-mini hover:bg-dark/95 pointer-events-auto inline-flex  h-12 items-center justify-center rounded-lg bg-white px-4
    py-2 text-sm font-semibold 
    text-black active:scale-[0.98] active:transition-all"
			onclick={() => {
				tab = 'associates';
			}}>Associates</Button.Root
		>
	</div>
	<!-- Units list -->
	<div class="units w-full flex-grow overflow-x-auto rounded-lg">
		{#if tab === 'crews'}
			<div class="flex gap-8">
				{#each capos as unit}
					<div class="flex gap-2">
						<Draggable
							disabled={unit.status !== UnitStatus.IDLE || usedUnits.has(unit.id)}
							item={{
								id: unit.id,
								type: 'member',
								data: unit
							}}
							zoneId="source"
						>
							<UnitCard {unit} assigned={usedUnits.has(unit.id)} />
						</Draggable>
						{#if unit.rank === UnitRank.CAPO}<Crew capo={unit} />{/if}
					</div>
				{/each}
			</div>
		{:else if tab === 'soldiers'}
			<div class="grid grid-flow-col grid-cols-[100px_auto] grid-rows-2 gap-2">
				{#each soldiers as unit}
					<Draggable
						disabled={unit.status !== UnitStatus.IDLE || usedUnits.has(unit.id)}
						item={{
							id: unit.id,
							type: 'member',
							data: unit
						}}
						zoneId="source"
					>
						<UnitCardSmall {unit} assigned={usedUnits.has(unit.id)} />
					</Draggable>
				{/each}
			</div>
		{:else if tab === 'associates'}
			<div class="grid auto-cols-[100px] grid-flow-col grid-rows-2 gap-2">
				{#each associates as unit}
					<div class="h-[100px] w-[100px]">
						<Draggable
							disabled={unit.status !== UnitStatus.IDLE || usedUnits.has(unit.id)}
							item={{
								id: unit.id,
								type: 'member',
								data: unit
							}}
							zoneId="source"
						>
							<UnitCardSmall {unit} assigned={usedUnits.has(unit.id)} />
						</Draggable>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</footer>
