<script>
	import WindowManager from '$lib/components/DialogWindows/WindowManager.svelte';
	import GameComponent from '$lib/components/GameComponent.svelte';
	import { onMount } from 'svelte';

	let lastFrameTime = performance.now();

	function measureFrameTime() {
		const now = performance.now();
		const frameTime = now - lastFrameTime;
		const currentFPS = Math.round(1000 / frameTime);

		console.log(`Frame time: ${frameTime.toFixed(2)}ms (${currentFPS} FPS)`);

		lastFrameTime = now;
		requestAnimationFrame(measureFrameTime);
	}

	onMount(() => {
		// measureFrameTime();
	});
</script>

<div class="flex h-screen w-screen flex-col overflow-hidden">
	<main class="flex-grow">
		<GameComponent />
		<WindowManager />
	</main>
</div>
