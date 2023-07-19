<script>
  import "@shoelace-style/shoelace/dist/components/button/button.js";
  import Spinner from "$lib/components/primitives/Spinner.svelte";
  import DataSelector from "$lib/components/DataSelector.svelte";
  import { onDestroy, onMount } from "svelte";
  import { sourceStore } from "$lib/stores/source.js";
  import { resizeStore } from "$lib/stores/resize.js";
  import { zoomStore } from "$lib/stores/zoom";
  import { searchStore } from "$lib/stores/search.js";
  import { filterStore } from "$lib/stores/filter.js";
  import BubblemapEngine from "$lib/helpers/bubblemap/index.js";

  let bubblemap, frame, engine;
  let unsubscribeSource;
  let unsubscribeSearch;
  let unsubscribeResize, unsubscribeZoom, unsubscribeFilter;
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
        const height = resize.height - 80;
        canvasWidth = `${width}px`;
        canvasHeight = `${height}px`;

        engine.size({ width, height });        
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

    unsubscribeSearch = searchStore.subscribe( function ( search ) {
      if (search.term != null) {
        const subreddit = engine.hierarchyMap.get( search.term )
        const parent_cluster = subreddit.parent
        const parent_node_id = parent_cluster.data.node_id
        engine.updateView( {subrootID: parent_node_id} );
      }
    });
      
    unsubscribeFilter = filterStore.subscribe( function ( filter ) {
      if ( filter !== undefined ) {
        engine.render();
      }
    });
  });

  onDestroy(() => {
    unsubscribeSource();
    unsubscribeResize();
    unsubscribeZoom();
    unsubscribeFilter();
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
  <DataSelector></DataSelector>
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
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }
</style>