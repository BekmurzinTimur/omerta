<script lang="ts">
	/* --------‑‑ Imports & props ‑‑-------- */
	import { type IUnit } from '$lib/models/UnitModels';

	// Unit is optional, this slot can be empty
	let {
		unit,
		confirmed,
		onRemove,
		disableRemove
	}: {
		unit?: IUnit;
		confirmed?: boolean;
		onRemove?: (unitId: string) => void;
		disableRemove?: boolean;
	} = $props();
</script>

<!-- Unit assignment slot - 150x150 square for unit assignment -->
<div
	class="pointer-events-none relative flex h-[150px] w-[150px] flex-col items-center
		justify-center overflow-hidden rounded-md border-2
		border-dashed border-gray-600 bg-gray-800 text-white"
	class:opacity-60={unit && !confirmed}
	style={unit ? `background:url('/mobsters/${unit.image}.png') center/cover` : ''}
>
	{#if unit}
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

		<!-- Indicator for unofficial assignment -->
		{#if !confirmed}
			<div
				class="absolute top-2 right-2 rounded-full bg-yellow-500 px-1 py-0.5 text-xs font-bold text-black"
			>
				Pending
			</div>
		{:else if !disableRemove}
			<button
				class="pointer-events-auto absolute top-2 right-2 cursor-pointer rounded-full bg-red-500/50 px-1 py-0.5 text-xs font-bold text-black hover:bg-red-500"
				onclick={() => onRemove?.(unit.id)}
			>
				Remove
			</button>
		{/if}
	{:else}
		<!-- No unit assigned - show placeholder text -->
		<span class="text-sm font-medium text-gray-400">Assign Unit</span>
	{/if}
</div>
