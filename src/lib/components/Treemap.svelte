<script>
  import Spinner from "$lib/components/primitives/Spinner.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";
  import { onDestroy, onMount } from "svelte";
  import { sourceStore } from "$lib/stores/source.js";
  import { resizeStore } from "$lib/stores/resize.js";
  import { zoomStore } from "$lib/stores/zoom.js";
  import * as Metadata from "$lib/resources/metadata.js";
  import TreemapEngine from "$lib/helpers/treemap/index.js";

  let canvas, frame, engine;
  let unsubscribeSource;
  let unsubscribeResize, unsubscribeZoom;
  let canvasWidth, canvasHeight;
  let hidden = true;
  let backDisabled = true;
  let totalCommentCount = 1;
  let currentHover = null;  


  const handleBack = function ( event ) {
    event.preventDefault();
    if ( (event.type === "keypress") && (event.key !== "Enter") ) {
      return;
    }
    zoomStore.push({ type: "back parent" });
  };

  const handleReset = function ( event ) {
    event.preventDefault();
    if ( (event.type === "keypress") && (event.key !== "Enter") ) {
      return;
    }
    zoomStore.push({ type: "reset" });
  };

  const handleHover = function ( event ) {
    currentHover = event?.detail;
  };


  onMount(() => {
    engine = TreemapEngine.create({ 
      canvas: canvas
    });

    canvas.addEventListener( "updateview", function ( event ) {
      backDisabled = engine.isTopLevel;

      zoomStore.push({
        type: "new selection", 
        subrootID: event.detail.node.data.node_id 
      });
    });

    canvas.addEventListener( "hovernode", handleHover );
    canvas.addEventListener( "hoverenter", handleHover );
    canvas.addEventListener( "hoverleave", handleHover );
    canvas.addEventListener( "hovermove", handleHover );

    unsubscribeSource = sourceStore.subscribe( function ( source ) {
      if ( source != null ) {
        const width = frame.clientWidth;
        const height = frame.clientHeight;

        engine.loadData( source.data );
        totalCommentCount = engine.data.data.comment_count;
        engine.size({ width, height });
        engine.initialize();
        engine.render();
        hidden = false;
        backDisabled = true;
      }
    });

    unsubscribeResize = resizeStore.subscribe( function ( resize ) {
      if ( resize?.width != null ) {
        const width = resize.width;
        const height = resize.height - 80;
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
        backDisabled = true;
      } else if ( zoom.type === "back parent" ) {
        engine.zoom( zoom.type );
        backDisabled = engine.isTopLevel;
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

  <Tooltip 
    event={currentHover} 
    totalCommentCount={totalCommentCount}
    canvas={canvas}
    >
  </Tooltip>

  <canvas 
    bind:this={canvas}
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
    disabled="{backDisabled}"
    pill>
    Back
  </sl-button>

  <sl-button
    on:click={handleReset}
    on:keypress={handleReset}
    class="action"
    pill>
    Top-Level
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
    z-index: 2;
  }

  .control {
    flex: 0 0 5rem;
    min-height: 5rem;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }

  .control sl-button {
    width: 7rem;
    margin-right: 1rem;
  }


</style>