<script >
  import Spinner from "$lib/components/primitives/Spinner.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";
  import Search from "./search/Search.svelte";
  import { onDestroy, onMount } from "svelte";
  import { sourceStore } from "$lib/stores/source.js";
  import { resizeStore } from "$lib/stores/resize.js";
  import { zoomStore } from "$lib/stores/zoom.js";
  import { filterStore } from "$lib/stores/filter.js";
  import { searchStore } from "$lib/stores/search.js";
  import { openResultsStore } from "$lib/stores/open-results.js";
  import { labelsStore } from "../stores/labels";
  import { get } from "svelte/store";
  import TreemapEngine from "$lib/helpers/treemap/index.js";
  import "@shoelace-style/shoelace/dist/components/switch/switch.js";
  import '@shoelace-style/shoelace/dist/components/breadcrumb/breadcrumb.js';
  import '@shoelace-style/shoelace/dist/components/icon/icon.js';


  let canvas, frame, engine;
  let unsubscribeSource;
  let unsubscribeResize, unsubscribeZoom, unsubscribeFilter;
  let unsubscribeSearch;
  let unsubscribeOpenResults;
  let canvasWidth, canvasHeight;
  let hidden = true;
  let backDisabled = true;
  let totalCommentCount = 1;
  let tooltipEvent = null;
  let protestToggle;
  let isProtestVisible = false;
  let data;
  let searchBar;
  let unsubscribeLabels;
  let parents = [];



  const handleBack = function ( event ) {
    if ( !get( openResultsStore )) {
      event.preventDefault();
      resetTouchNode();
      if ( (event.type === "keypress") && (event.key !== "Enter") ) {
        return;
      }
      zoomStore.push({ type: "back parent" });
    }
  };

  const handleReset = function ( event ) {
    if ( !get( openResultsStore ) ) {
      event.preventDefault();
      resetTouchNode();
      if ( (event.type === "keypress") && (event.key !== "Enter") ) {
        return;
      }
      zoomStore.push({ type: "reset" });
      parents = [];
      console.log("parent after reset: ", parents)
    }
  };

  const handleHover = function ( event ) {
    if ( !get( openResultsStore ) ) {
      resetTouchNode();
      tooltipEvent = {
        type: "mouse",
        ...event?.detail
      };
    }
  };

  const handleTouchSelect = function ( event ) {
    tooltipEvent = {
      type: "touch",
      ...event?.detail
    };

    // TODO: This should probably go somewhere else.
    if ( event?.detail == null ) {
      engine.touchCurrentNode = null;
    }
  }

  const resetTouchNode = function () {
    if ( tooltipEvent?.type === "touch" ) {
      handleTouchSelect( null );
    }
  };


  const handleResize = function ( resize ) {
    let width, height;
    if ( resize == null ) {
      width = frame.clientWidth;
      height = frame.clientHeight;
    } else {
      width = resize.width;
      height = resize.height;

      if ( window.innerWidth > 750 ) {
        //       button panel
        height -= ( 16 * 7 );
      } else {
        //       button panel
        height -= ( 16 * 6 );
      }
    }

    resetTouchNode();
    canvasWidth = `${ width }px`;
    canvasHeight = `${ height }px`;
    
    return { width, height };
  };

  const handleProtest = function ( event ) {
    if ( !get( openResultsStore ) ) {
      event.preventDefault();
      isProtestVisible = !isProtestVisible
      if ( isProtestVisible ) {
        filterStore.push( { key: "type" , value: "protest" } )
      }
      else {
        filterStore.push( null )
      }
    }
  }


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
      let labels = get( labelsStore );
      if ( labels != undefined && !(labels[0].parent.parent === null) ) {
        console.log("before 1: ", parent.length === 0)
        if ( parents.length === 0 ) {
          console.log(1)
          parents.push( labels[0].parent )
        }
        else {
          if ( parents[ parent.length - 1 ] !== labels[0].parent ) {
            console.log(2)
            parents.push( labels[0].parent )
          }
        }
      }
      console.log("parent after push: ", parents)
    });

    canvas.addEventListener( "hovernode", handleHover );
    canvas.addEventListener( "hoverenter", handleHover );
    canvas.addEventListener( "hoverleave", handleHover );
    canvas.addEventListener( "hovermove", handleHover );
    canvas.addEventListener( "touchSelect", handleTouchSelect );

    protestToggle.addEventListener('sl-change', handleProtest);

    unsubscribeSource = sourceStore.subscribe( function ( source ) {
      if ( source != null ) {
        const { width, height } = handleResize();

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
        const { width, height } = handleResize( resize );

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
        let labels = get( labelsStore );
        if ( labels.length != undefined && labels.length > 0 ) {
          parents.pop()
        }
        console.log("parent after pop: ", parents)
      }
    });

    unsubscribeFilter = filterStore.subscribe( function ( filter ) {
      if ( filter !== undefined ) {
        engine.render();
      }
    });

    unsubscribeSearch = searchStore.subscribe( function ( search ) {
      if (search != null) {
        engine.search( search )
        backDisabled = false
      }
    });

    console.log("TREEMAP DATA: ", engine)
    unsubscribeLabels = labelsStore.subscribe( function ( labels ) {
      console.log("label: ", labels, parents)
    });

  });

  onDestroy(() => {
    unsubscribeSource();
    unsubscribeResize();
    unsubscribeZoom();
    unsubscribeFilter();
    unsubscribeSearch();
    unsubscribeLabels();
  });
</script>



<div class="search-bar" 
  style:--accordion-width="{canvasWidth ? canvasWidth : 'auto'}">
  <Search></Search>
</div>

<div class="breadcrumbs">
  {#each parents as parent}
    <sl-button variant="text" size="small">{ parent.taxonomy_label }</sl-button>              
  {/each}
</div>

<div 
  bind:this={frame}
  class="spinner-frame">
  

  <div>
    {#if hidden === true}
      <Spinner></Spinner>
    {/if}

    <Tooltip 
      event={tooltipEvent}
      totalCommentCount={totalCommentCount}
      canvas={canvas} 
      on:dismiss={resetTouchNode}
      >
    </Tooltip>


    <canvas 
      bind:this={canvas}
      style:width="{canvasWidth ? canvasWidth : 'auto'}"
      style:height="{canvasHeight ? canvasHeight : 'auto'}"
      class:hidden="{hidden === true}">
    </canvas>
    
  </div>
  
</div>

<section class="control">
  <div>
    <sl-button
      on:click={handleBack}
      on:keypress={handleBack}
      class="action"
      disabled="{backDisabled}"
      pill>
      Up
    </sl-button>

    <sl-button
      on:click={handleReset}
      on:keypress={handleReset}
      class="action"
      pill>
      Top Level
    </sl-button>
  </div>
  <sl-switch 
    bind:this={protestToggle}
    size="large">Protest View</sl-switch>

</section>

<style>

  :root {
      --accordion-width: var(canvasWidth);
  }

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
    max-height: 3rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .control sl-button {
    width: 7rem;
    margin-right: 1rem;
  }

  .control sl-switch {
    width: 7rem;
    margin-right: 1rem;
  }


  @media( min-width: 750px ) {
    .control {
      max-height: 5rem;
    }
  }

</style>