<script lang="ts">
	import type { RegionData } from '$lib/const/regionsData';
	import type { IRegion } from '$lib/models/TerritoryModel';
	import Icon from '../Common/Icons/Icon.svelte';

	let {
		region,
		regionInfo,
		regionControl
	}: { region: IRegion; regionInfo: RegionData; regionControl: number } = $props();
</script>

<div class="region-info-container overflow-hidden rounded-lg bg-gray-800">
	<div class="relative h-24 w-full overflow-hidden">
		<img
			src={regionInfo.image || `/regions/${region.type + 1}.png`}
			alt={regionInfo.name}
			class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
		/>
		<div
			class="absolute top-0 right-0 bottom-0 left-0 flex flex-col justify-between bg-gradient-to-t from-black/40 to-transparent p-2"
		>
			<div class="mb-auto flex justify-between">
				<div class="">
					<Icon text="RB" className="mr-2 bg-yellow-500" />
					<span class="text-md font-bold text-green-400">+{regionInfo.bonus}%</span>
				</div>
				<div class="">
					<Icon text="RC" className="mr-2" />
					<span class="text-md font-bold">{regionControl.toFixed()}/100</span>
				</div>
			</div>
			<h3 class="text-sm font-bold text-white">{regionInfo.name}</h3>
		</div>
	</div>
</div>
