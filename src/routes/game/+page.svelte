<script>
	import WindowManager from '$lib/components/DialogWindows/WindowManager.svelte';
	import DragAndDropProvider from '$lib/components/DragAndDrop/DragAndDropProvider.svelte';
	import GameComponent from '$lib/components/GameComponent.svelte';
</script>

<div class="flex h-screen w-screen flex-col overflow-hidden">
	<main class="flex-grow">
		<DragAndDropProvider>
			<GameComponent />
			<WindowManager />
		</DragAndDropProvider>
	</main>
</div>
