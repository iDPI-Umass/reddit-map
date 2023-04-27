<script>
  import Spinner from "$lib/components/primitives/Spinner.svelte";
  import { onDestroy, onMount } from "svelte";
  import { sourceStore } from "$lib/stores/source.js";
  import { resizeStore } from "$lib/stores/resize.js";
  import { zoomStore } from "$lib/stores/zoom.js";
  import TreemapEngine from "$lib/helpers/treemap/index.js";

  let treemap, frame, engine;
  let source, unsubscribeSource;
  let unsubscribeResize, unsubscribeZoom;
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
    engine = TreemapEngine.create({ 
      canvas: treemap,
      // This gets bound to the engine's context.
      onViewUpdate: function () {
        zoomStore.push({
          type: "new selection", 
          subrootID: this.parent.data.node_id 
        });
      }
    });

    unsubscribeSource = sourceStore.subscribe( function ( _source ) {
      if ( _source != null ) {
        source = _source.data;
        render();
      }
    });

    unsubscribeResize = resizeStore.subscribe( function ( resize ) {
      if ( resize != null ) {
        render();
      }
    });

    unsubscribeZoom = zoomStore.subscribe( function ( zoom ) {
      if ( zoom.type === "reset" ) {
        engine.resetView();
      } else if ( zoom.type === "back parent" ) {
        engine.zoom( zoom.type );
      }
    });
  });

  onDestroy(() => {
    unsubscribeSource();
    unsubscribeResize();
    unsubscribeZoom();
  });
</script>




<div 
  bind:this={frame}
  class="spinner-frame">
  
  {#if hidden === true}
    <Spinner></Spinner>
  {/if}

  <canvas 
    bind:this={treemap}
    class:hidden="{hidden === true}">
  </canvas>
</div>




<style>
  .spinner-frame {
    width: 100%;
    height:100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .hidden {
    display: none;
  }
</style>