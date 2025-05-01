<script lang="ts">
	import Toaster from '$lib/components/Common/Toaster/Toaster.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<Toaster />

{@render children()}
