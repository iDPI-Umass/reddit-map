<script>
  import "@shoelace-style/shoelace/dist/components/button/button.js";
  import Spinner from "$lib/components/primitives/Spinner.svelte";
  import { onDestroy, onMount } from "svelte";
  import { sourceStore } from "$lib/stores/source.js";
  import { resizeStore } from "$lib/stores/resize.js";
  import { zoomStore } from "$lib/stores/zoom";
  import { resetStore } from "$lib/stores/reset";
  import BubblemapEngine from "$lib/helpers/bubblemap/index.js";

  let bubblemap, frame, engine;
  let source, unsubscribeSource;
  let unsubscribeResize, unsubscribeZoom, unsubscribeReset;
  let hidden = true;

  const render = function () {
    if ( source == null ) {
        return;
    }
    engine.size( frame );
    engine.loadData( source );
    engine.render();
    hidden = false;
  };
  
  onMount(() => {
    engine = BubblemapEngine.create({ canvas: bubblemap });

    unsubscribeSource = sourceStore.subscribe( function ( _source ) {
      if ( _source != null ) {
        source = _source.data;
      
        if ( engine.data == null ) {
          render(); 
        } else {
          engine.updateData( source );
        }
      }
    });

    unsubscribeResize = resizeStore.subscribe( function ( resize ) {
      if ( resize != null ) {
        render();
      }
    });

    unsubscribeZoom = zoomStore.subscribe( function ( view ) {
      if ( view != null ) {
        engine.updateView( view );
      }
    });

    unsubscribeReset = resetStore.subscribe( function ( reset ) {
      if ( reset != null ) {
        // engine.resetView();
      }
    });
  });

  onDestroy(() => {
    unsubscribeSource();
    unsubscribeResize();
    unsubscribeReset();
  });
</script>




<div 
  bind:this={frame}
  class="spinner-frame">
  
  {#if hidden === true}
    <Spinner></Spinner>
  {/if}

  <canvas 
    bind:this={bubblemap}
    class:hidden="{hidden === true}">
  </canvas>
</div>




<style>
  .spinner-frame {
    width: 100%;
    height: 100%;
  }

  .hidden {
    display: none;
  }
</style>