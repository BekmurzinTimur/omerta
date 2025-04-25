<script lang="ts">
	let { progress }: { progress: number } = $props();
</script>

<div class="h-2 w-full overflow-hidden rounded-full bg-white/20">
	<div class="h-full bg-white transition-all" style="width: {progress}%" />
</div>
