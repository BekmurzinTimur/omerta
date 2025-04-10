<script>
	import Footer from "$lib/components/Footer.svelte";
	import GameComponent from "$lib/components/GameComponent.svelte";
	import GridMap from "$lib/components/GridMap.svelte";
	import Header from "$lib/components/Header.svelte";

  </script>
  
  <div class="flex flex-col h-screen w-screen overflow-hidden">
    <Header />
    <main class="flex-grow">
      <GameComponent />
    </main>
    <Footer />
  </div>