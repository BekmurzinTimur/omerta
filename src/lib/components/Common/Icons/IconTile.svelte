<script lang="ts">
	import { ICON_LABELS } from '$lib/const/icons';

	let { label }: { label: string } = $props();
	/* --------‑‑ Spritesheet helpers ‑‑-------- */
	const ICON_SHEET = '/icons/IconPack.png';
	const TILE = 80 / 4; // 230 px

	const iconStyle = (tile?: [number, number]) => {
		if (!tile) return ''; // <- graceful fallback
		const [r, c] = tile;
		return `
			background-image: url('${ICON_SHEET}');
			background-size: 80px 80px;
			background-position: -${c * TILE}px -${r * TILE}px;
		`;
	};
</script>

<span
	class="inline-block h-5 w-5 shrink-0 rounded bg-no-repeat"
	style={iconStyle(ICON_LABELS[label])}
/>
