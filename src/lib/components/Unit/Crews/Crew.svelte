<script lang="ts">
	import { UnitRank, type IUnit } from '$lib/models/UnitModels';
	import AddUnit from './AddUnit.svelte';
	let { capo }: { capo: IUnit } = $props();
	let crewSize = $derived(capo.crew?.length || 0);
</script>

<div class="pointer-events-auto flex flex-col">
	<h4 class="mb-2 rounded-lg bg-gray-700 px-2 py-1">
		{capo.name} crew <span>{crewSize} / 6</span>
	</h4>
	<div class="flex flex-1 gap-2">
		<AddUnit capoId={capo.id} crewIndex={0} />
	</div>
</div>
