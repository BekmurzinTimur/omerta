<script>
	import { onMount } from "svelte";


	import { gameState, startTime, stopTime } from "./stores/gameStore.svelte";
    onMount(() => {
        startTime()
        return () => {
            stopTime()
        }
    })
</script>
<!-- Header.svelte - Slim header component -->
<header class="bg-blue-600 text-white p-2 shadow-md">
    <div class="container mx-auto">
      <h1 class="text-xl font-bold"> {gameState.date.toLocaleDateString('ru-RU')} {gameState.date.toLocaleTimeString('ru-RU')}</h1>
      <button onclick={stopTime}>Pause</button>
      <button onclick={startTime}>Play</button>
    </div>
  </header>