<script lang="ts">
	import type { IUnit } from '$lib/models/UnitModels';

	let { unit }: { unit: IUnit } = $props();
</script>

<div
	class="pointer-events-none relative flex h-[150px] w-[150px] flex-col items-center
		justify-center overflow-hidden rounded-md border-2
		border-dashed border-gray-600 bg-gray-800 text-white"
	style={unit ? `background:url('/mobsters/${unit.image}.png') center/cover` : ''}
>
	<!-- Unit is assigned - show info with semitransparent background -->
	<div class="absolute inset-0 flex flex-col justify-end p-3">
		<div class="truncate text-sm font-bold">{unit.name}</div>
		<div class="mt-1 flex items-center justify-between text-xs">
			<span class="rounded bg-red-900 px-2 py-[2px] text-white">{unit.rank}</span>
			<span class="rounded bg-amber-600 px-2 py-[2px] text-white">
				LVL {unit.level || 1}
			</span>
		</div>
	</div>
</div>
