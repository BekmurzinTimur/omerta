<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import type { WindowConfig, WindowContext, WindowPosition } from './types';
	import Window from './Window.svelte';
	import { getWindows, removeWindow, focusWindow, moveWindow } from './windowStore.svelte';

	let windows = $derived(getWindows());
</script>

<div class="pointer-events-none fixed inset-0">
	{#each windows as window (window.id)}
		<Window
			id={window.id}
			title={window.title}
			position={window.position}
			size={window.size}
			zIndex={window.zIndex || 0}
			isActive={window.isActive || false}
			onClose={() => removeWindow(window.id)}
			onFocus={() => focusWindow(window.id)}
			onDragStart={() => focusWindow(window.id)}
			onDragMove={(delta: WindowPosition) => moveWindow(window.id, delta)}
		>
			<svelte:fragment slot="content">
				{#if typeof window.content === 'string'}
					<div>{window.content}</div>
				{:else}
					{@const Component = window.content.component}
					<Component {...window.content.props} />
				{/if}
			</svelte:fragment>
		</Window>
	{/each}
</div>
