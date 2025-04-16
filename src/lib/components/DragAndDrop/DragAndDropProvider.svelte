<script lang="ts">
	import { setDragContext } from './DragStore.svelte';

	// Create and set the drag context for child components
	const dragStore = setDragContext();
</script>

<div class="drag-drop-provider h-full">
	<slot />
</div>
