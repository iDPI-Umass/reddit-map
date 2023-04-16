<script>
  import Treemap from "$lib/components/Treemap.svelte";
  import TreemapSVG from "$lib/components/TreemapSVG.svelte";
  import Bubblemap from "$lib/components/Bubblemap.svelte";
  import { sourceStore } from "$lib/stores/source";
    import TreemapSvg from "$lib/components/TreemapSVG.svelte";

  sourceStore.push( "2021-04" );

</script>

<header>
  <h1>RedditMap</h1>
</header>

<main>
  <section class="left">
    <TreemapSvg></TreemapSvg>
  </section>

  <section class="right">
    <Treemap></Treemap>
  </section>
  
</main>


<style>
  header {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 1rem;
    background: var(--gobo-color-panel);
    border-bottom: var(--gobo-border-panel);
    height: 4rem;
  }

  main {
    flex: 1 0 auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;
    padding: 1rem;
    max-height: calc( 100vh - 4rem );
  }

  main .left, main .right {
    flex: 1 1 50%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
    max-height: 100%;
  }
</style>