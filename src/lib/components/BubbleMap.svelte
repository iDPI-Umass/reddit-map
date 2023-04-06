<script>
  import Spinner from "$lib/components/primitives/Spinner.svelte";
  import { onDestroy, onMount } from "svelte";
  import { sourceStore } from "$lib/stores/source.js";
  import { resizeStore } from "$lib/stores/resize.js";
  import * as Bubblemap from "$lib/helpers/bubblemap/index.js";

  let bubblemap, frame;
  let source, unsubscribeSource;
  let unsubscribeResize;
  let hidden = true;

  const render = function () {
    if ( source == null ) {
        return;
    }
    Bubblemap.prepare( bubblemap, frame );
    Bubblemap.render( source );
    hidden = false;
  };
  
  onMount(() => {
    unsubscribeSource = sourceStore.subscribe( function ( _source ) {
      source = _source;
      render();
    });

    unsubscribeResize = resizeStore.subscribe( function () {
      render();
    });
  });

  onDestroy(() => {
    unsubscribeSource();
    unsubscribeResize();
  });
</script>




<div 
  bind:this={frame}
  class="spinner-frame">
  
  {#if hidden === true}
    <Spinner></Spinner>
  {/if}

  <svg 
    bind:this={bubblemap}
    class:hidden="{hidden === true}">
  </svg>
</div>




<style>
  .spinner-frame {
    width: 100%;
    height: 90%;
    max-height: 100%;
  }

  svg {
    width: 100%;
    height: 100%;
    max-height: 100%;
  }

  .hidden {
    display: none;
  }
</style>