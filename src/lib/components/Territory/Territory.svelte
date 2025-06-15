<script lang="ts">
	import type { ITerritory } from '$lib/models/TerritoryModel';
	import { UnitRank, type IUnit } from '$lib/models/UnitModels';
	import {
		assignUnitToTerritory,
		getAllUnitsMap,
		getViewingPlayer,
		getRegion,
		getRegionControl,
		removeUnitFromTerritory,
		startCapturingTerritory
	} from '$lib/services/GameController.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { type DraggableItem, type DropResult } from '../DragAndDrop/DragAndDropTypes';
	import AssignUnit from '../Unit/AssignUnit.svelte';
	import { isNeighboringPlayerTerritory } from '$lib/utils/mapUtils';
	import ProgressBar from '../Common/ProgressBar.svelte';
	import { formatUSD } from '$lib/utils/moneyUtils';
	import { REGIONS_DATA } from '$lib/const/regionsData';
	import Icon from '../Common/Icons/Icon.svelte';
	import Region from './Region.svelte';
	import BasicUnit from '../Unit/BasicUnit.svelte';

	let {
		territory,
		allTerritories
	}: { territory?: ITerritory; allTerritories: Map<string, ITerritory> } = $props();
	let droppedItemsMap = $state(new SvelteMap<string, DraggableItem>());
	let droppedItem = $derived<DraggableItem | null>(
		droppedItemsMap.get(territory?.id || '') || null
	);
	let droppedUnit = $derived<IUnit | null>(droppedItem?.data);
	let confirmed = $derived(droppedUnit?.id === territory?.managerId);
	let capturerConfirmed = $derived(droppedUnit?.id === territory?.capturingUnitId);
	let player = $derived(getViewingPlayer());

	let managerUnit = $derived(getAllUnitsMap().get(territory?.managerId || ''));
	let capturerUnit = $derived(getAllUnitsMap().get(territory?.capturingUnitId || ''));

	let isNeighbouringMyTerritory = $derived(
		territory && player ? isNeighboringPlayerTerritory(territory, allTerritories, player.id) : false
	);
	let region = $derived(getRegion(territory?.regionId || ''));
	let regionInfo = $derived(REGIONS_DATA[region?.type || 0]);
	let regionControl = $derived(getRegionControl(player?.id || '', region?.id));

	// Handle drop events
	function handleDrop(result: DropResult) {
		if (!territory?.id) return;
		const { item } = result;
		const unitId = (item.data as IUnit).id;
		if (item.data.rank === UnitRank.ASSOCIATE) return;
		droppedItemsMap.set(territory.id, item);
		if (!unitId) return;
		if (territory.managerId === unitId) return console.log('Same unit', item);
		if (!player) return;

		if (territory.ownerId === player.id) assignUnitToTerritory(player.id, unitId, territory.id);
		else startCapturingTerritory(player.id, unitId, territory.id);
	}
	function handleRemove(unitId: string) {
		if (!territory?.id) return;
		if (!player) return;
		removeUnitFromTerritory(player.id, unitId, territory.id);
		droppedItemsMap.delete(territory.id);
	}
</script>

{#if territory}
	<div class="absolute top-16 left-2 w-[13rem] flex-col">
		<div class="flex flex-col gap-2 overflow-y-auto text-white">
			<!-- Region Information Section -->
			{#if region && regionInfo}
				<Region {region} {regionControl} {regionInfo} />
			{/if}

			<!-- Territory Actions Section -->
			<div class="rounded-lg bg-gray-700 p-2 shadow-md">
				<div class="mb-1 border-b border-gray-600 pb-1">
					{#if territory}
						<div class="flex items-center justify-between rounded-lg bg-gray-800 p-3">
							<div class="rounded-md">
								<Icon text="I" className="bg-yellow-400 mr-2" />
								<span class="text-sm font-bold text-green-400">
									+{formatUSD(territory.resources.income)}
								</span>
							</div>
							<span class="h-full text-sm text-gray-300">
								{territory.ownerId ? `${territory.ownerId}` : 'Unclaimed'}
							</span>

							{#if territory.isBeingCaptured}{/if}
						</div>
					{:else}
						<div class="flex items-center justify-center p-6">
							<h4 class="text-lg font-semibold text-gray-400">
								Select a territory to view details
							</h4>
						</div>
					{/if}
				</div>

				<!-- Territory Management Section -->
				{#if territory}
					{#if !!managerUnit}
						<div>
							{#if !!territory.managerId}
								<div class="mb-2 text-sm">Overseer: {managerUnit.name}</div>
								<BasicUnit unit={managerUnit} />
							{/if}
						</div>
					{/if}
					{#if territory.ownerId === player?.id}
						<div>
							<div class="flex justify-center rounded-md bg-gray-800 p-3">
								<AssignUnit
									id="territory{territory.id}"
									onDrop={handleDrop}
									accepts={['member']}
									assignedUnit={managerUnit}
									droppedUnit={droppedItem?.data}
									{confirmed}
									onRemove={handleRemove}
									label={'Manage territory'}
								/>
							</div>
						</div>
					{:else if isNeighbouringMyTerritory}
						<div>
							{#if territory.isBeingCaptured}
								<div class="mb-3">
									<ProgressBar progress={territory.captureProgress} />
									<div class="mt-1 text-sm">
										<span>Capture progress:</span>

										<span class="text-sm">{Math.round(territory.captureProgress)}%</span>
									</div>
								</div>
							{/if}
							<div class="flex justify-center rounded-md bg-gray-800 p-3">
								<AssignUnit
									id="territory{territory.id}"
									onDrop={handleDrop}
									accepts={['member']}
									assignedUnit={capturerUnit}
									droppedUnit={droppedItem?.data}
									confirmed={capturerConfirmed}
									disableRemove
									label={'Capture territory'}
								/>
							</div>
						</div>
					{:else}
						<div class="p-3 text-center text-gray-400">
							{#if territory.isBeingCaptured}
								<div class="mb-3">
									<ProgressBar progress={territory.captureProgress} />
									<div class="mt-1 text-sm">
										<span>Capture progress:</span>

										<span class="text-sm">{Math.round(territory.captureProgress)}%</span>
									</div>
								</div>
							{:else}
								<p>You must control a neighboring territory to capture this area.</p>
							{/if}
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}
