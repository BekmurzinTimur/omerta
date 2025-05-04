<script lang="ts">
	import type { ITerritory } from '$lib/models/TerritoryModel';
	import { UnitRank, type IUnit } from '$lib/models/UnitModels';
	import {
		assignUnitToTerritory,
		getAllUnitsMap,
		getLocalPlayer,
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
	let player = $derived(getLocalPlayer());

	let managerUnit = $derived(getAllUnitsMap().get(territory?.managerId || ''));
	let capturerUnit = $derived(getAllUnitsMap().get(territory?.capturingUnitId || ''));

	let isNeighbouringMyTerritory = $derived(
		territory && player ? isNeighboringPlayerTerritory(territory, allTerritories, player.id) : false
	);
	let region = $derived(getRegion(territory?.regionId || ''));
	let regionInfo = $derived(REGIONS_DATA[region?.type || 0]);
	let regionControl = $derived(getRegionControl(region?.id));

	// Handle drop events
	function handleDrop(result: DropResult) {
		if (!territory?.id) return;
		const { item } = result;
		const unitId = (item.data as IUnit).id;
		if (item.data.rank === UnitRank.ASSOCIATE) return;
		droppedItemsMap.set(territory.id, item);
		if (!unitId) return;
		if (territory.managerId === unitId) return console.log('Same unit', item);

		if (territory.ownerId === player?.id) assignUnitToTerritory(unitId, territory.id);
		else startCapturingTerritory(unitId, territory.id);
	}
	function handleRemove(unitId: string) {
		if (!territory?.id) return;
		removeUnitFromTerritory(unitId, territory.id);
		droppedItemsMap.delete(territory.id);
	}
	const handleClear = () => {
		droppedUnit = null;
	};
</script>

{#if territory}
	<div class="control-panel absolute top-18 left-4 flex w-80 flex-col">
		<div class="territory-panel overflow-y-auto">
			<!-- Region Information Section -->
			{#if region && regionInfo}
				<Region {region} {regionControl} {regionInfo} />
			{/if}

			<!-- Territory Actions Section -->
			<div class="actions-container rounded-lg bg-gray-700 p-4 shadow-md">
				<div class="mb-4 border-b border-gray-600 pb-3">
					{#if territory}
						<div class="flex items-center justify-between">
							<h4 class="text-xl font-bold text-gray-200">{territory.name}</h4>
							<span class="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300">
								{territory.ownerId ? `${territory.ownerId}` : 'Unclaimed'}
							</span>
						</div>

						<div class="mt-3">
							<div class="rounded-md bg-gray-800 p-3">
								<Icon text="I" className="bg-yellow-400 mr-2" />
								<span class="text-lg font-bold text-green-400">
									{formatUSD(territory.resources.income)}
								</span>
							</div>

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
					{#if territory.ownerId === player?.id}
						<div class="management-section mb-4">
							<h5 class="mb-2 text-lg font-bold text-gray-200">Territory Management</h5>
							<div class="flex justify-center rounded-md bg-gray-800 p-3">
								<AssignUnit
									id="territory{territory.id}"
									onDrop={handleDrop}
									onClear={handleClear}
									accepts={['member']}
									assignedUnit={managerUnit}
									droppedUnit={droppedItem?.data}
									{confirmed}
									onRemove={handleRemove}
								/>
							</div>
						</div>
					{:else if isNeighbouringMyTerritory}
						<div class="capture-section">
							<h5 class="mb-2 text-lg font-bold text-gray-200">Capture Territory</h5>
							<div class="flex justify-center rounded-md bg-gray-800 p-3">
								{#if territory.captureProgress}
									<div class="mb-3">
										<span class="mb-1 block text-sm text-gray-400">Capture Progress</span>
										<ProgressBar progress={territory.captureProgress} />
										<span class="mt-1 block text-right text-sm text-gray-400"
											>{Math.round(territory.captureProgress)}</span
										>
									</div>
								{/if}

								<AssignUnit
									id="territory{territory.id}"
									onDrop={handleDrop}
									onClear={handleClear}
									accepts={['member']}
									assignedUnit={capturerUnit}
									droppedUnit={droppedItem?.data}
									confirmed={capturerConfirmed}
									disableRemove
								/>
							</div>
						</div>
					{:else}
						<div class="p-3 text-center text-gray-400">
							<p>You must control a neighboring territory to capture this area.</p>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.territory-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		color: #e2e8f0;
	}

	.management-section,
	.capture-section {
		transition: all 0.3s ease;
	}

	/* Subtle hover effects */
	.actions-container:hover,
	.region-info-container:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}
</style>
