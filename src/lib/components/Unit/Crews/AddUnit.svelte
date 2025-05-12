<script lang="ts">
	import { addWindow } from '$lib/components/DialogWindows/windowStore.svelte';
	import CrewModal from './CrewModal.svelte';

	let { capoId, crewIndex }: { capoId: string; crewIndex: number } = $props();

	function handleClick() {
		addWindow({
			id: `crew-manage-${capoId}`,
			title: `Manage crew`,
			content: { component: CrewModal, props: { capoId, crewIndex } },
			position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
			size: { width: 600, height: 500 }
		});
	}
</script>

<div
	onclick={() => handleClick()}
	class="flex h-full w-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dotted bg-gray-500/50"
>
	<div class="text-lg">Manage crew</div>
</div>
