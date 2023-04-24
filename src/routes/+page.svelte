<script>
  import "@shoelace-style/shoelace/dist/components/alert/alert.js";
  import "@shoelace-style/shoelace/dist/components/icon/icon.js";
  import Treemap from "$lib/components/Treemap.svelte";
  import Bubblemap from "$lib/components/Bubblemap.svelte";
  import Slider from "$lib/components/Slider.svelte";
  import { sourceStore } from "$lib/stores/source";
  import { resetStore } from "$lib/stores/reset";
  import { onMount } from "svelte";

  sourceStore.push( "2021-04" );

  let alert;

  const handleReset = function ( event ) {
    event.preventDefault();
    resetStore.push( new Date().toISOString() );
  };

  const handleKeypress = function ( event ) {
    if ( event.key === "Enter" ) {
      handleReset( event );
    }
  };

  onMount( function () {
    if ( window.innerWidth < 750 ) {
      alert.toast();
    }
  })

</script>

<sl-alert
  bind:this={alert}
  variant="primary"
  duration="10000"
  closable>
  <sl-icon slot="icon" src="/icons/info-circle.svg"></sl-icon>
  For the best experience, we recommend viewing RedditMap on a large screen.
</sl-alert>

<header>
  <a
    href="/"
    aria-label="reset view"
    on:click={handleReset}
    on:keypress={handleKeypress}
    >
    <h1>RedditMap</h1>
    </a>
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

  header a {
    color: inherit;
    text-decoration: none;
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

  main .left {
    flex: 1 1 50%;
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    align-items: stretch;
    max-height: 100%;
  }  

  main .right {
    display: none;
  }

  @media( min-width: 750px ) {
    main .right {
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
  }
 
</style>