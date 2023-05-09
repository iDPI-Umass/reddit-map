<script>
  import { scrollStore } from "$lib/stores/scroll.js";
  export let melting = "false";
  export let heading;

  const handleWheel = function ( event ) {
    if ( window.screen.width > 750 ) {
      scrollStore.push({
        deltaY: event.deltaY
      });
    }
  };
  
</script>

<div class="panels">
  <div 
    class="left-panel {melting === "true" ? "melting" : ""}" 
    on:wheel={handleWheel}>
    <slot name="left"></slot>
  </div>
  
  <main class="right-panel" on:wheel={handleWheel}>
    {#if heading != null}
      <h1>{heading}</h1>
    {/if}
    <slot name="right"></slot>
  </main>
</div>

<style>
  .panels {
    flex: 1 1 0%;
    min-height: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
  }

  .left-panel {
    flex: 0 0 auto;
    overflow-y: scroll;
    margin: 1rem;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: stretch;
    max-width: 20rem;
  }

  .left-panel.melting {
    display: none;
  }

  .right-panel {
    flex: 0 0 auto;
    margin: 2rem 1rem 1rem 1rem;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    align-items: stretch;
  }

  @media ( min-width: 750px ) {
    .panels {
      flex-direction: row;
    }

    .left-panel {
      flex: 1 2 33%;
      margin: 1rem;
    }

    .left-panel.melting {
      display: unset;
    }

    .right-panel {
      flex: 2 1 67%;
      margin: 1rem;
      padding-left: 3rem;
    }
  }  
</style>