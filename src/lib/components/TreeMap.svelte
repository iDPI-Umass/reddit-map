<script>
  import Spinner from "$lib/components/primitives/Spinner.svelte";
  import { onDestroy, onMount } from "svelte";
  import { sourceStore } from "$lib/stores/source.js";
  import { resizeStore } from "$lib/stores/resize.js";
  import { zoomStore } from "$lib/stores/zoom.js";
  import TreemapEngine from "$lib/helpers/treemap/index.js";

  let treemap, frame, engine;
  let unsubscribeSource;
  let unsubscribeResize, unsubscribeZoom;
  let canvasWidth, canvasHeight;
  let hidden = true;

  const handleBack = function ( event ) {
    event.preventDefault();
    if ( (event.type === "keypress") && (event.key !== "Enter") ) {
      return;
    }
    zoomStore.push({ type: "back parent" });
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

    unsubscribeSource = sourceStore.subscribe( function ( source ) {
      if ( source != null ) {
        const width = frame.clientWidth;
        const height = frame.clientHeight;

        engine.loadData( source.data );
        engine.size({ width, height });
        engine.initialize();
        engine.render();
        hidden = false;
      }
    });

    unsubscribeResize = resizeStore.subscribe( function ( resize ) {
      if ( resize?.width != null ) {
        const width = resize.width;
        const height = resize.height - ( 16 * 5 );
        canvasWidth = `${width}px`;
        canvasHeight = `${height}px`;

        engine.size({ width, height });
        engine.setScaleRange({
          x0: 0,
          x1: engine.width,
          y0: 0,
          y1: engine.height
        });
        engine.render();
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
    style:width="{canvasWidth ? canvasWidth : 'auto'}"
    style:height="{canvasHeight ? canvasHeight : 'auto'}"
    class:hidden="{hidden === true}">
  </canvas>
</div>

<section class="control">
  <sl-button
    on:click={handleBack}
    on:keypress={handleBack}
    class="action"
    pill>
    Back
  </sl-button>
</section>




<style>
  .hidden {
    display: none;
  }

  .spinner-frame {
    flex: 1 1 0;
    max-height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .control {
    flex: 0 0 5rem;
    min-height: 5rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 var(--gobo-width-spacer) 0 var(--gobo-width-spacer);
  }

  .control sl-button {
    width: 8rem;
  }
</style>