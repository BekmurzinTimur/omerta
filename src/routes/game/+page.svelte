<script>
	import WindowManager from '$lib/components/DialogWindows/WindowManager.svelte';
	import DragAndDropProvider from '$lib/components/DragAndDrop/DragAndDropProvider.svelte';
	import GameComponent from '$lib/components/GameComponent.svelte';
</script>

<div class="font-family: flex h-screen w-screen flex-col overflow-hidden font-serif">
	<main class="h-full flex-grow">
		<DragAndDropProvider>
			<GameComponent />
			<WindowManager />
		</DragAndDropProvider>
	</main>
</div>
