<script lang="ts">
	import { MissionStatus } from '$lib/models/MissionModels';

	let { status }: { status?: MissionStatus } = $props();
</script>

<div
	class="h-6 rounded-sm px-2"
	class:bg-red-500={status === MissionStatus.FAILED}
	class:bg-green-500={status === MissionStatus.SUCCEEDED}
	class:bg-gray-500={status === MissionStatus.ACTIVE}
>
	{status}
</div>
