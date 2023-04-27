<script>
  import "@shoelace-style/shoelace/dist/components/alert/alert.js";
  import "@shoelace-style/shoelace/dist/components/icon/icon.js";
  import "@shoelace-style/shoelace/dist/components/button/button.js";
  import Treemap from "$lib/components/Treemap.svelte";
  import Bubblemap from "$lib/components/Bubblemap.svelte";
  import { sourceStore } from "$lib/stores/source.js";
  import { zoomStore } from "$lib/stores/zoom.js";
  import { resizeStore } from "$lib/stores/resize.js";
  import { onDestroy, onMount } from "svelte";

  let unsubscribeResize;

  sourceStore.push( "2021-04" );

  let left, alert;

  const handleReset = function ( event ) {
    event.preventDefault();
    if ( (event.type === "keypress") && (event.key !== "Enter") ) {
      return;
    }
    zoomStore.push({ type: "reset" });
  };

  onMount( function () {
    if ( window.innerWidth < 750 ) {
      alert.toast();
    }

    unsubscribeResize = resizeStore.subscribe( function ( event ) {
      if ( event != null && event.width == null ) {
        console.log({
          id: event.id,
          width: left.clientWidth,
          height: left.clientHeight
        })
        resizeStore.push({
          id: event.id,
          width: left.clientWidth,
          height: left.clientHeight
        });
      }
    });
  });

  onDestroy( function () {
    unsubscribeResize();
  });

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
    on:keypress={handleReset}
    >
    <h1>RedditMap</h1>
    </a>
</header>

<main>

  <section bind:this={left} class="left">
    <Treemap></Treemap>
  </section>

  <section class="right">
    <Bubblemap></Bubblemap>
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
    padding: 4rem 1rem 4rem 1rem;
    max-height: calc( 100vh - 4rem );
  }

  main .left {
    flex: 1 1 50%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
  }

  main .right {
    display: none;
  }

  @media( min-width: 750px ) {
    main .left {
      padding-right: 1rem;
      max-height: 100%;
    }

    main .right {
      flex: 1 1 50%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      padding-right: 1rem;
      max-height: 100%;
    }
  }
 
</style>