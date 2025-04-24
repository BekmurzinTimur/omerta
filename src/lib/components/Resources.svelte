<script lang="ts">
	import { getLocalPlayer } from '$lib/services/GameController.svelte';

	// Get the local player
	let player = $derived(getLocalPlayer());
</script>

<!-- Player resources -->
<div class="resources rounded-lg bg-gray-700">
	<div class="flex">
		<div class="resource rounded bg-gray-800 p-2">
			<span class="text-sm text-yellow-400">Money</span>
			<span class="font-semibold text-white">{player?.resources.money || 0}</span>
		</div>
		<div class="resource rounded bg-gray-800 p-2">
			<span class="text-sm text-red-400">Heat</span>
			<span class="font-semibold text-white">{player?.resources.heat || 0}</span>
		</div>
	</div>
</div>
