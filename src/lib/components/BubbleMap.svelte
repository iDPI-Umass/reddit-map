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
        const height = resize.height - ( 16 * 5 );
        canvasWidth = `${width}px`;
        canvasHeight = `${height}px`;

        const pWidth = ((width * engine.resolutionScale) - engine.width) / engine.width;
        const pHeight = ((height * engine.resolutionScale) - engine.height) / engine.height;
        const [ x0, x1, y0, y1 ] = engine.boundaries;
        
        const domainWidth = x1 - x0;
        const dWidth = domainWidth * pWidth * 0.5;
        const domainHeight = y1 - y0;
        const dHeight = domainHeight * pHeight * 0.5;

        engine.size({ width, height });
        engine.boundaries = [
          x0 - dWidth,
          x1 + dWidth,
          y0 - dHeight,
          y1 + dHeight
        ];
          
        engine.scaleToBoundaries();
        engine.render();
      }
    });

    unsubscribeZoom = zoomStore.subscribe( function ( zoom ) {
      if ( zoom.type === "reset" ) {
        engine.resetView();
      } else if ( zoom.type === "new selection" ) {
        engine.updateView( zoom );
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
    bind:this={bubblemap}
    style:width="{canvasWidth ? canvasWidth : 'auto'}"
    style:height="{canvasHeight ? canvasHeight : 'auto'}"
    class:hidden="{hidden === true}">
  </canvas>
</div>

<section class="control">
  <Slider></Slider>
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
    background: #eee;
  }

  .control {
    flex: 0 0 5rem;
    min-height: 5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    padding-left: 10%;
    padding-right: 10%;
  }
</style>