<!-- PlayerDataTable.svelte -->
<script lang="ts">
	import { getPlayer, getPlayerUnits } from '$lib/services/GameController.svelte';
	import gameState from '$lib/services/GameState.svelte';
	import type { Player, GameState } from '../../models/GameModels';
	import { type IUnit, UnitRank, UnitStatus, CoreAttribute } from '../../models/UnitModels';

	interface Props {
		playerId: string;
	}

	let { playerId }: Props = $props();

	let player = $derived(getPlayer(playerId)!);

	const playerUnits = $derived(getPlayerUnits(player!.id));

	// Derived stats for the player
	const playerStats = $derived.by(() => {
		const playerTerritories = player.territories;

		// Territory stats
		const totalTerritories = playerTerritories.length;
		const totalIncome = playerTerritories.reduce(
			(sum, territory) => sum + territory.resources.income,
			0
		);
		const territoriesBeingCaptured = playerTerritories.filter((t) => t.isBeingCaptured).length;

		// Unit stats
		const totalUnits = playerUnits.length;
		const unitsByRank = playerUnits.reduce(
			(acc, unit) => {
				acc[unit.rank] = (acc[unit.rank] || 0) + 1;
				return acc;
			},
			{} as Record<UnitRank, number>
		);

		const unitsByStatus = playerUnits.reduce(
			(acc, unit) => {
				acc[unit.status] = (acc[unit.status] || 0) + 1;
				return acc;
			},
			{} as Record<UnitStatus, number>
		);

		// Average unit stats
		const avgLoyalty =
			totalUnits > 0
				? Math.round(playerUnits.reduce((sum, unit) => sum + unit.loyalty, 0) / totalUnits)
				: 0;
		const avgLevel =
			totalUnits > 0
				? Math.round(playerUnits.reduce((sum, unit) => sum + unit.level, 0) / totalUnits)
				: 0;
		const totalHeat = playerUnits.reduce((sum, unit) => sum + unit.heat, 0);

		// Top units
		const topUnits = playerUnits.sort((a, b) => b.level - a.level).slice(0, 3);

		return {
			territories: {
				total: totalTerritories,
				income: totalIncome,
				underThreat: territoriesBeingCaptured
			},
			units: {
				total: totalUnits,
				byRank: unitsByRank,
				byStatus: unitsByStatus,
				avgLoyalty,
				avgLevel,
				totalHeat,
				topUnits
			}
		};
	});

	// Format currency
	const formatMoney = (amount: number) => {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	};

	// Get rank color
	const getRankColor = (rank: UnitRank) => {
		const colors = {
			[UnitRank.ASSOCIATE]: 'text-gray-400',
			[UnitRank.SOLDIER]: 'text-blue-400',
			[UnitRank.CAPO]: 'text-purple-400',
			[UnitRank.CONSIGLIERE]: 'text-yellow-400',
			[UnitRank.UNDERBOSS]: 'text-red-400'
		};
		return colors[rank] || 'text-gray-400';
	};

	// Get status color
	const getStatusColor = (status: UnitStatus) => {
		const colors = {
			[UnitStatus.IDLE]: 'text-gray-400',
			[UnitStatus.ASSIGNED]: 'text-green-400',
			[UnitStatus.MISSION]: 'text-blue-400',
			[UnitStatus.TERRITORY]: 'text-purple-400',
			[UnitStatus.EXPAND]: 'text-orange-400',
			[UnitStatus.BUSINESS]: 'text-emerald-400',
			[UnitStatus.PRISON]: 'text-red-400'
		};
		return colors[status] || 'text-gray-400';
	};
</script>

<div class="overflow-hidden rounded-lg border border-gray-700 bg-gray-900 shadow-2xl">
	<!-- Header -->
	<div class="border-b border-gray-600 bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4">
		<div class="flex items-center gap-4">
			<div
				class="h-4 w-4 rounded-full border-2 border-white shadow-lg"
				style="background-color: {player.color}"
			></div>
			<h2 class="text-2xl font-bold text-white">{player.name}</h2>
			<div class="text-sm text-gray-300">Player ID: {player.id}</div>
		</div>
	</div>

	<div class="space-y-6 p-6">
		<!-- Resources Section -->
		<div class="grid grid-cols-4 gap-4">
			<div
				class="rounded-lg border border-green-700/50 bg-gradient-to-br from-green-900/50 to-green-800/30 p-4"
			>
				<div class="text-sm font-semibold tracking-wide text-green-400 uppercase">Money</div>
				<div class="text-2xl font-bold text-white">{formatMoney(player.resources.money)}</div>
				<div class="text-xs text-green-300">
					Last Income: {formatMoney(player.resources.lastIncome)}
				</div>
			</div>

			<div
				class="rounded-lg border border-red-700/50 bg-gradient-to-br from-red-900/50 to-red-800/30 p-4"
			>
				<div class="text-sm font-semibold tracking-wide text-red-400 uppercase">Heat</div>
				<div class="text-2xl font-bold text-white">{player.resources.heat}</div>
				<div class="text-xs text-red-300">Unit Heat: {playerStats.units.totalHeat}</div>
			</div>

			<div
				class="rounded-lg border border-yellow-700/50 bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 p-4"
			>
				<div class="text-sm font-semibold tracking-wide text-yellow-400 uppercase">Awareness</div>
				<div class="text-2xl font-bold text-white">{player.resources.awareness}</div>
			</div>

			<div
				class="rounded-lg border border-purple-700/50 bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-4"
			>
				<div class="text-sm font-semibold tracking-wide text-purple-400 uppercase">Net Worth</div>
				<div class="text-2xl font-bold text-white">
					{formatMoney(player.resources.money + playerStats.territories.income * 10)}
				</div>
				<div class="text-xs text-purple-300">Est. Value</div>
			</div>
		</div>

		<!-- Territory & Unit Overview -->
		<div class="grid grid-cols-4 gap-6">
			<!-- Territory Stats -->
			<div class="rounded-lg border border-gray-600 bg-gray-800/50 p-5">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
					<svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z"
							clip-rule="evenodd"
						></path>
					</svg>
					Territories
				</h3>
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-gray-300">Total Controlled</span>
						<span class="font-semibold text-white">{playerStats.territories.total}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-gray-300">Total Income</span>
						<span class="font-semibold text-green-400"
							>{formatMoney(playerStats.territories.income)}</span
						>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-gray-300">Under Threat</span>
						<span class="font-semibold text-red-400">{playerStats.territories.underThreat}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-gray-300">Avg per Territory</span>
						<span class="font-semibold text-blue-400">
							{playerStats.territories.total > 0
								? formatMoney(playerStats.territories.income / playerStats.territories.total)
								: '$0'}
						</span>
					</div>
				</div>
			</div>

			<!-- Unit Stats -->
			<div class="rounded-lg border border-gray-600 bg-gray-800/50 p-5">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
					<svg class="h-5 w-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
						<path
							d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"
						></path>
					</svg>
					Units
				</h3>
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-gray-300">Total Units</span>
						<span class="font-semibold text-white">{playerStats.units.total}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-gray-300">Avg Loyalty</span>
						<span class="font-semibold text-blue-400">{playerStats.units.avgLoyalty}%</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-gray-300">Avg Level</span>
						<span class="font-semibold text-purple-400">{playerStats.units.avgLevel}</span>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-gray-300">Active Units</span>
						<span class="font-semibold text-green-400">
							{(playerStats.units.byStatus[UnitStatus.ASSIGNED] || 0) +
								(playerStats.units.byStatus[UnitStatus.MISSION] || 0) +
								(playerStats.units.byStatus[UnitStatus.TERRITORY] || 0)}
						</span>
					</div>
				</div>
			</div>

			<!-- Units by Rank -->
			<div class="rounded-lg border border-gray-600 bg-gray-800/50 p-5">
				<h3 class="mb-4 text-lg font-semibold text-white">Units by Rank</h3>
				<div class="space-y-2">
					{#each Object.values(UnitRank) as rank}
						{@const count = playerStats.units.byRank[rank] || 0}
						<div class="flex items-center justify-between">
							<span class="{getRankColor(rank)} font-medium">{rank}</span>
							<span class="font-semibold text-white">{count}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Units by Status -->
			<div class="rounded-lg border border-gray-600 bg-gray-800/50 p-5">
				<h3 class="mb-4 text-lg font-semibold text-white">Units by Status</h3>
				<div class="space-y-2">
					{#each Object.values(UnitStatus) as status}
						{@const count = playerStats.units.byStatus[status] || 0}
						{#if count > 0}
							<div class="flex items-center justify-between">
								<span class="{getStatusColor(status)} font-medium">{status}</span>
								<span class="font-semibold text-white">{count}</span>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</div>

		<!-- Top Units -->
		{#if playerStats.units.topUnits.length > 0}
			<div class="rounded-lg border border-gray-600 bg-gray-800/50 p-5">
				<h3 class="mb-4 text-lg font-semibold text-white">Top Units</h3>
				<div class="space-y-3">
					{#each playerStats.units.topUnits as unit}
						<div class="flex items-center justify-between rounded-lg bg-gray-700/50 p-3">
							<div class="flex items-center gap-3">
								<div class="h-2 w-2 rounded-full bg-blue-400"></div>
								<div>
									<div class="font-medium text-white">{unit.name}</div>
									<div class="text-sm text-gray-400">{unit.nickname || 'No nickname'}</div>
								</div>
							</div>
							<div class="text-right">
								<div class="font-semibold text-white">Level {unit.level}</div>
								<div class="{getRankColor(unit.rank)} text-sm">{unit.rank}</div>
							</div>
							<div class="text-right">
								<div class="text-sm text-blue-400">Loyalty: {unit.loyalty}%</div>
								<div class="{getStatusColor(unit.status)} text-sm">{unit.status}</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
