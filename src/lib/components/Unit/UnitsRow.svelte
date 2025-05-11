<script lang="ts">
	import { UnitStatus } from '$lib/models/UnitModels';
	import { getUsedUnits } from '$lib/services/UiState.svelte';
	import { getMaxFamilySize } from '$lib/utils/familyUtils';
	import { getAssociates, getPlayerUnits, getTick } from '../../services/GameController.svelte';
	import Draggable from '../DragAndDrop/Draggable.svelte';
	import UnitCard from './UnitCard.svelte';
	import { Button } from 'bits-ui';

	let tick: number = $derived(getTick());

	// Get all units in the game
	let usedUnits = $derived(getUsedUnits());
	let units = $derived(getPlayerUnits());
	let associates = $derived(getAssociates());
	let maxFamilySize = $derived(getMaxFamilySize(units));
	let tab = $state<'members' | 'associates'>('members');
	let displayUnits = $derived.by(() => (tab === 'members' ? units : associates));

	$effect(() => {
		tick;
		usedUnits.clear();
	});
	$inspect(displayUnits);
</script>

<footer class="pointer-events-none absolute right-0 bottom-0 left-0 px-4 text-white">
	<div class="flex items-center gap-4">
		<Button.Root
			class="bg-dark shadow-mini hover:bg-dark/95  inline-flex h-12 items-center justify-center rounded-lg bg-white
    px-4 py-2 font-semibold 
    text-black active:scale-[0.98] active:transition-all"
			onclick={() => {
				tab = 'members';
			}}>Members: {units.length} / {maxFamilySize}</Button.Root
		>
		<Button.Root
			class="bg-dark shadow-mini hover:bg-dark/95  inline-flex h-12 items-center justify-center rounded-lg bg-white
    px-4 py-2 font-semibold 
    text-black active:scale-[0.98] active:transition-all"
			onclick={() => {
				tab = 'associates';
			}}>Associates</Button.Root
		>
	</div>
	<!-- Units list -->
	<div class="units w-full flex-grow overflow-x-auto rounded-lg py-2">
		<div class="flex gap-2">
			{#if displayUnits.length > 0}
				{#each displayUnits as unit}
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
				{/each}
			{:else}
				<p class="text-sm text-gray-400">No units available</p>
			{/if}
		</div>
	</div>
</footer>
