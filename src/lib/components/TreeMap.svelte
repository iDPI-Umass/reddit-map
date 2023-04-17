<script>
  import Spinner from "$lib/components/primitives/Spinner.svelte";
  import { onDestroy, onMount } from "svelte";
  import { sourceStore } from "$lib/stores/source.js";
  import { resizeStore } from "$lib/stores/resize.js";
  import { zoomStore } from "$lib/stores/zoom.js";
  import TreemapEngine from "$lib/helpers/treemap/index.js";

  let treemap, frame, engine;
  let source, unsubscribeSource;
  let unsubscribeResize;
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
        zoomStore.push({ subrootLabel: this.parent.data.displayLabel });
      }
    });

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

  <canvas 
    bind:this={treemap}
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