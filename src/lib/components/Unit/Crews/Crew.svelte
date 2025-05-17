<script lang="ts">
	import MyTooltip from '$lib/components/Common/Tooltip/MyTooltip.svelte';
	import { addWindow } from '$lib/components/DialogWindows/windowStore.svelte';
	import Draggable from '$lib/components/DragAndDrop/Draggable.svelte';
	import { UnitStatus, type IUnit } from '$lib/models/UnitModels';
	import { getAllUnitsMap } from '$lib/services/GameController.svelte';
	import { getUsedUnits } from '$lib/services/UiState.svelte';
	import UnitCard from '../UnitCard.svelte';
	import UnitCardSmall from '../UnitCardSmall.svelte';

	import CrewModal from './CrewModal.svelte';
	let usedUnits = $derived(getUsedUnits());
	let { capo }: { capo: IUnit } = $props();
	let allUnitsMap = $derived(getAllUnitsMap());
	let units: IUnit[] = $derived(
		capo.crew?.filter((_) => !!_).map((unitId) => allUnitsMap.get(unitId!)) as IUnit[]
	);
	let crewLength = $derived(capo.crew!.filter((_) => !!_).length || 0);

	function handleClick() {
		addWindow({
			id: `crew-manage-${capo.id}`,
			title: `${capo.name} crew ${crewLength} / 6`,
			content: { component: CrewModal, props: { capoId: capo.id } },
			position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
			size: { width: 600, height: 500 }
		});
	}
</script>

<div class="pointer-events-auto flex flex-col">
	<div
		onclick={() => handleClick()}
		class="mb-1 flex w-[100px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dotted bg-gray-500/50 hover:bg-gray-500"
	>
		<div class="text-sm">Manage crew</div>
	</div>
	<div
		class="grid grid-flow-col grid-cols-1 grid-rows-2 gap-1"
		class:grid-cols-2={units.length > 2}
		class:grid-cols-3={units.length > 4}
	>
		{#each units as unit, index}
			<MyTooltip>
				{#snippet trigger()}
					<Draggable
						disabled={unit.status !== UnitStatus.IDLE || usedUnits.has(unit.id)}
						item={{
							id: unit.id,
							type: 'member',
							data: unit
						}}
						zoneId="source"
					>
						<UnitCardSmall {unit} />
					</Draggable>
				{/snippet}
				<UnitCard {unit} />
			</MyTooltip>
		{/each}
	</div>
</div>
