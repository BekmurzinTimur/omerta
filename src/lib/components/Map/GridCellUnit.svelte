<script lang="ts">
	import type { IUnit } from '$lib/models/UnitModels';

	let { unit }: { unit: IUnit } = $props();
</script>

<div class="h-10 w-10 overflow-hidden rounded-full border-2">
	<img src="/mobsters/{unit.image}.png" />
</div>
