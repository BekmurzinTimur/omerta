<script lang="ts">
	import Toaster from '$lib/components/Common/Toaster/Toaster.svelte';
	import { Tooltip } from 'bits-ui';
	import '../app.css';

	let { children } = $props();
</script>

<Toaster />

<Tooltip.Provider>
	{@render children()}
</Tooltip.Provider>
