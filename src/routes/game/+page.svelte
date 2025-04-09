<script>
	import Footer from "$lib/Footer.svelte";
	import GridMap from "$lib/GridMap.svelte";
	import Header from "$lib/Header.svelte";

  </script>
  
  <div class="flex flex-col h-screen w-screen overflow-hidden">
    <Header />
    <main class="flex-grow">
      <GridMap />
    </main>
    <Footer />
  </div>