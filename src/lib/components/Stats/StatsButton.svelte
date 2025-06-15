<script lang="ts">
	import type { Player } from '$lib/models/GameModels';
	import { CoreAttribute } from '$lib/models/UnitModels';
	import IconTile from '../Common/Icons/IconTile.svelte';
	import { addWindow } from '../DialogWindows/windowStore.svelte';
	import FamilyStatsTable from './FamilyStatsTable.svelte';

	let { player }: { player: Player } = $props();

	const handleClick = () => {
		addWindow({
			id: `family-stats-${player.id}`,
			title: `Game Over`,
			content: { component: FamilyStatsTable, props: { playerId: player.id } },
			position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 },
			size: { width: 600, height: 500 }
		});
	};
</script>

<button
	onclick={handleClick}
	class={`size-6 cursor-pointer rounded-sm`}
	style="background-color: {player.color}"
>
	<IconTile label={CoreAttribute.INFLUENCE} />
</button>
