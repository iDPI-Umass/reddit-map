<script>
  import Treemap from "$lib/components/Treemap.svelte";
  import Bubblemap from "$lib/components/Bubblemap.svelte";
  import Slider from "$lib/components/Slider.svelte";
  import { sourceStore } from "../lib/stores/source";

  sourceStore.push( "2021-04" );

</script>

<header>
  <h1>RedditMap</h1>
</header>

<main>
  <section class="left">
    <Treemap></Treemap>
  </section>

  <section class="right">
    <div class="bubble">
      <Bubblemap></Bubblemap>
    </div>
    
    <section class="control">
      <Slider></Slider>
    </section>
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

  main .right .bubble {
    height: 90%;
  }

  main .right .control {
    height: 10%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    padding-left: 10%;
    padding-right: 10%;
  }
</style>