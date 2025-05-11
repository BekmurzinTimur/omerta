<script lang="ts">
	import { Canvas } from '@threlte/core';
	import City from './City.svelte';
	let {
		selectedCellId,
		onSelect
	}: { selectedCellId: string | null; onSelect: (cellid: string | null) => void } = $props();
</script>

<Canvas shadows>
	<City {selectedCellId} {onSelect} />
</Canvas>
