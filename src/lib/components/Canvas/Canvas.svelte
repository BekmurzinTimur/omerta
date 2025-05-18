<script lang="ts">
	import { Canvas } from '@threlte/core';
	import City from './City.svelte';
	let {
		selectedCellId,
		onSelect
	}: { selectedCellId: string | null; onSelect: (cellid: string | null) => void } = $props();
</script>

<div class="h-screen w-screen">
	<Canvas shadows>
		<City {selectedCellId} {onSelect} />
	</Canvas>
</div>
