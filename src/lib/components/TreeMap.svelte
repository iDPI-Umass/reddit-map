<script>
  import Spinner from "$lib/components/primitives/Spinner.svelte";
  import { onDestroy, onMount } from "svelte";
  import { sourceStore } from "$lib/stores/source.js";
  import { resizeStore } from "$lib/stores/resize.js";
  import * as Treemap from "$lib/helpers/treemap/index.js";

  let treemap, frame;
  let source, unsubscribeSource;
  let unsubscribeResize;
  let hidden = true;

  const render = function () {
    if ( source == null ) {
        return;
    }
    Treemap.prepare( treemap, frame );
    Treemap.render( source );
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
    bind:this={treemap}
    class:hidden="{hidden === true}">
  </svg>
</div>




<style>
  .spinner-frame {
    width: 100%;
    height: 100%;
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