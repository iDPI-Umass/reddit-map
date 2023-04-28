<script>
  import "@shoelace-style/shoelace/dist/components/button/button.js";
  import Spinner from "$lib/components/primitives/Spinner.svelte";
  import Slider from "$lib/components/Slider.svelte";
  import { onDestroy, onMount } from "svelte";
  import { sourceStore } from "$lib/stores/source.js";
  import { resizeStore } from "$lib/stores/resize.js";
  import { zoomStore } from "$lib/stores/zoom";
  import BubblemapEngine from "$lib/helpers/bubblemap/index.js";

  let bubblemap, frame, engine;
  let unsubscribeSource;
  let unsubscribeResize, unsubscribeZoom;
  let canvasWidth, canvasHeight;
  let hidden = true;
  let backDisabled = true;

  const handleBack = function ( event ) {
    event.preventDefault();
    if ( (event.type === "keypress") && (event.key !== "Enter") ) {
      return;
    }
    zoomStore.push({ type: "back parent" });
  };

  onMount(() => {
    engine = BubblemapEngine.create({ canvas: bubblemap });

    unsubscribeSource = sourceStore.subscribe( function ( source ) {
      if ( source != null ) {
        if ( engine.data == null ) {
          const width = frame.clientWidth;
          const height = frame.clientHeight;

          engine.loadData( source.data );
          engine.size({ width, height });
          engine.initialize();
          engine.render();
          hidden = false;
        } else {
          engine.updateData( source.data );
        }
      }
    });

    unsubscribeResize = resizeStore.subscribe( function ( resize ) {
      if ( resize?.width != null ) {
        const width = resize.width;
        const height = resize.height - 160;
        canvasWidth = `${width}px`;
        canvasHeight = `${height}px`;

        engine.size({ width, height });        
        engine.render();
      }
    });

    unsubscribeZoom = zoomStore.subscribe( function ( zoom ) {
      if ( zoom.type === "reset" ) {
        engine.resetView();
        backDisabled = engine.isTopLevel;
      } else if ( zoom.type === "new selection" ) {
        engine.updateView( zoom );
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

<section class="control">
  <Slider></Slider>
</section>

<section class="control">
  <sl-button
    on:click={handleBack}
    on:keypress={handleBack}
    class="action"
    disabled="{backDisabled}"
    pill>
    Back
  </sl-button>
</section>


<div 
  bind:this={frame}
  class="spinner-frame">
  
  {#if hidden === true}
    <Spinner></Spinner>
  {/if}

  <canvas 
    bind:this={bubblemap}
    style:width="{canvasWidth ? canvasWidth : 'auto'}"
    style:height="{canvasHeight ? canvasHeight : 'auto'}"
    class:hidden="{hidden === true}">
  </canvas>
</div>



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
    background: #eee;
  }

  .control {
    flex: 0 0 5rem;
    min-height: 5rem;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding-left: 10%;
    padding: 0 var(--gobo-width-spacer) 0 var(--gobo-width-spacer);
  }

  .control sl-button {
    width: 8rem;
  }
</style>