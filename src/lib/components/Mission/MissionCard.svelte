<script lang="ts">
	import type { MissionTemplate } from '$lib/models/MissionModels';

	export let mission: MissionTemplate;
	export let isActive: boolean = false;
	/** 0 – 100 */
	export let progress: number = 0;
	/** formatted ETA string – e.g. "02:15" */
	export let eta: string = '';
	/** array of avatar URLs for units */
	export let unitImages: string[] = [];
</script>

<div
	class="relative cursor-pointer overflow-hidden rounded-lg shadow-md transition hover:shadow-lg"
>
	<img
		src={mission.image}
		alt={mission.name}
		class="absolute inset-0 h-full w-full object-cover opacity-30"
	/>

	<!-- overlay -->
	<div class="relative flex flex-col gap-2 p-3 backdrop-blur-sm">
		<h3 class="font-semibold text-white drop-shadow">{mission.name}</h3>

		{#if !isActive}
			<div class="text-sm text-white/80">Reward: ${mission.reward.toLocaleString()}</div>

			<div class="flex flex-wrap gap-2 text-xs text-white/80">
				{#each Object.entries(mission.difficulty) as [key, val]}
					<span>{key}: {val}</span>
				{/each}
			</div>
		{:else}
			<!-- progress bar -->
			<div class="h-2 w-full overflow-hidden rounded-full bg-white/20">
				<div class="h-full bg-green-400 transition-all" style="width: {progress}%" />
			</div>

			<div class="text-xs text-white/90">ETA: {eta}</div>

			<div class="mt-1 flex -space-x-2">
				{#each unitImages as img}
					<img
						src={img}
						alt="unit"
						class="h-6 w-6 rounded-full border-2 border-white object-cover"
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>
