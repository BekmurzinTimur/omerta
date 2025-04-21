<!--
SimpleAttributeRow.svelte
A single small component that displays attributes in a row with emojis
-->
<script lang="ts">
	import type { CoreAttribute } from '$lib/models/UnitModels';

	let { stats }: { stats: Record<CoreAttribute, number> } = $props();
</script>

<div class="flex w-fit flex-row items-center gap-2 rounded-lg bg-gray-800 p-2">
	<!-- Muscle -->
	<div class="flex items-center">
		<span class="mr-1 text-xl">💪</span>
		<span class="font-medium text-white">{stats.Muscle}</span>
	</div>

	<!-- Brains -->
	<div class="flex items-center">
		<span class="mr-1 text-xl">🧠</span>
		<span class="font-medium text-white">{stats.Brains}</span>
	</div>

	<!-- Cunning -->
	<div class="flex items-center">
		<span class="mr-1 text-xl">🦊</span>
		<span class="font-medium text-white">{stats.Cunning}</span>
	</div>

	<!-- Influence -->
	<div class="flex items-center">
		<span class="mr-1 text-xl">👑</span>
		<span class="font-medium text-white">{stats.Influence}</span>
	</div>
</div>
