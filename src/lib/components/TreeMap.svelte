<script>
  import Spinner from "$lib/components/primitives/Spinner.svelte";
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
  
  let totalCommentCount = 1;
  let currentDisplay = "none";
  let currentTop = 0;
  let currentLeft = 0;
  let currentBottom = "unset";
  let currentName = "";
  let currentComments = 0;
  let currentCommentPercent = 0;
  let currentSubreddits = [];
  let currentSubreddit = null;
  let currentAbout = null;

  let currentType = null;

  
  const positionTooltip = function ({ currentX, currentY })  {
    currentLeft = `${ currentX + 32 }px`;
    
    if ( currentY < canvas.clientHeight / 2 ) {
      currentTop = `${ currentY + 32  }px`;
      currentBottom = "unset";
    } else {
      currentTop = "unset";
      currentBottom = `${ canvas.clientHeight - currentY + 32 }px`;
    }
  };

  const renderTooltipHeading = function ({ node }) {
    currentName = node.data.displayLabel;
    
    if ( node.data.subreddit == null ) {
      currentType = "cluster";
    } else {
      currentType = "subreddit";
    }
  };

  const renderTooltipMetadata = function ({ node }) {
    let ratio, pretty;
    const { data } = node;
    const count = data.comment_count;

    pretty = new Intl.NumberFormat( "en-US" );
    currentComments = pretty.format( count );

    if ( data.subreddit == null ) {
      ratio = count / totalCommentCount;
    } else {
      ratio = count / node.parent.data.comment_count;
    }

    pretty = new Intl.NumberFormat( "en-US", { 
      style: "percent",
      minimumFractionDigits: 3
    });
    currentCommentPercent = pretty.format( ratio );
  };

  const renderTooltipSubreddits = function ({ node }) {
    if ( currentType === "cluster" ) {
      const ax = node.data.top_subreddits_by_comment.split(",");
      for ( let i = 0; i < ax.length; i++ ) {
        ax[i] = `${ i + 1 }. ${ ax[i] }`;
      }
      currentSubreddits = ax;
    }
  }

  const fetchAbout = async function ( node ) {
    const metadata = await Metadata.get( node.data.subreddit );
    currentAbout = metadata.about.description;
    currentSubreddit = node.data.subreddit;
  };

  const renderAbout = function ({ node }) {
    if ( currentType === "subreddit" ) {
      if ( currentSubreddit === node.data.subreddit ) {
        return;
      } else {
        currentAbout = null;
        fetchAbout( node );
      }
    }
  };

  const renderTooltipNode = function ( detail ) {
    positionTooltip( detail );
    renderTooltipHeading( detail );
    renderTooltipMetadata( detail );
    renderTooltipSubreddits( detail );
    renderAbout( detail );

    currentDisplay = "block";
  }

  onMount(() => {
    engine = TreemapEngine.create({ 
      canvas: canvas
    });

    canvas.addEventListener( "updateview", function ( event ) {
      zoomStore.push({
        type: "new selection", 
        subrootID: event.detail.node.data.node_id 
      });
    });

    canvas.addEventListener( "hovernode", function ( event ) {
      if ( event?.detail?.node != null ) {
        renderTooltipNode( event.detail );      
      }
    });

    canvas.addEventListener( "hoverenter", function ( event ) {
      if ( event?.detail?.node != null ) {
        renderTooltipNode( event.detail );      
      }
    });

    canvas.addEventListener( "hoverleave", function ( event ) {
      currentDisplay = "none";
    });

    canvas.addEventListener( "hovermove", function ( event ) {
      if ( event?.detail?.node != null ) {
        renderTooltipNode( event.detail );      
      }
    });

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
      }
    });

    unsubscribeResize = resizeStore.subscribe( function ( resize ) {
      if ( resize?.width != null ) {
        const width = resize.width;
        const height = resize.height;
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

  <section
    class="tooltip"
    style:display={currentDisplay}
    style:top={currentTop}
    style:bottom={currentBottom}
    style:left={currentLeft}
    >
    
    <section>
      <h2>{currentName}</h2>
      <h3>Size Metadata</h3>
      <p>Number of Comments: {currentComments}</p>
      {#if currentType === "cluster"}
        <p>Percentage of Reddit Comments: {currentCommentPercent}</p>
      {:else}
        <p>Percentage of Cluster: {currentCommentPercent}</p>
      {/if}
    </section>
    

    {#if currentType === "cluster"}
      <section class="top-subreddits">
        <h3>Top Subreddits By Number of Comments</h3>
        <div>
          {#each currentSubreddits as subreddit}
            <p>{subreddit}</p>
          {/each}
        </div>
      </section>
    {/if}

    {#if currentType === "subreddit"}
      <section class="about">
        <h3>About Subreddit</h3>
        {#if currentAbout == null}
          <Spinner></Spinner>
        {:else}
          <p>{currentAbout}</p>
        {/if}
      </section>
    {/if}
  
  </section>

  <canvas 
    bind:this={canvas}
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
    z-index: 2;
  }

  .tooltip {
    position: absolute;
    background: #FFFFFF;
    padding: var(--gobo-height-spacer) var(--gobo-width-spacer);
    border-radius: 1rem;
    max-width: 36rem;
  }

  .tooltip section:not(:last-child) {
    margin-bottom: var(--gobo-height-spacer);
  }

  .tooltip h2 {
    font-size: 1.125rem;
    font-weight: var(--gobo-font-weight-black);
    margin-bottom: 2rem;
  }

  .tooltip h3 {
    font-size: var(--gobo-font-weight-large);
    font-weight: var(--gobo-font-weight-bold);
    margin-bottom: 0.5rem;
  }

  .tooltip p {
    font-size: var(--gobo-font-weight-copy);
    font-weight: var(--gobo-font-weight-regular);
    margin-bottom: 0;
  }

  .tooltip .top-subreddits div {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: flex-start;
    max-height: 7rem;
    padding: 0;
  }

  .tooltip .top-subreddits p {
    margin-right: 1rem;
  }


</style>