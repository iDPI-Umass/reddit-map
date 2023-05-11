<script>
  import "@shoelace-style/shoelace/dist/components/badge/badge.js";
  import Spinner from "$lib/components/primitives/Spinner.svelte";
  import * as Metadata from "$lib/resources/metadata.js";

  export let event = null;
  export let totalCommentCount = 1;
  export let canvas;
  
  let currentDisplay = "none";
  let currentTop = 0;
  let currentLeft = 0;
  let currentBottom = "unset";

  let tooltipReady = false;
  let currentNode = null;
  let currentName = "";
  let currentComments = 0;
  let currentCommentPercent = 0;
  let currentSubredditsOne = [];
  let currentSubredditsTwo = [];
  let currentClustersOne = [];
  let currentClustersTwo = [];
  let currentNearestNeighborsOne = [];
  let currentNearestNeighborsTwo = [];
  let currentNearestNeighborsStr = "";
  let currentSubreddit = null;
  let currentAbout = null;
  let currentBadge = null;
  let currentImage = null;

  let currentType = null;


  // We want the tooltip to position itself either above or below the cursor
  // where it's mostly likely to have the space it needs. It's absolutely positioned
  // against the layout column grandparent, so we need to account for parent siblings.
  // This is very brittle, but tooltips are a weird layout case.
  const positionTooltip = function ({ currentX, currentY })  {
    currentLeft = `${ currentX + 32 }px`;
    
    if ( currentY < canvas.clientHeight / 2 ) {
      currentTop = `${ currentY + 32  }px`;
      currentBottom = "unset";
    } else {
      currentTop = "unset";
      currentBottom = `${ canvas.clientHeight - currentY + 98 }px`;
    }
  };

  const renderTooltipHeading = function ({ node }) {
    currentName = node.data.displayLabel;
  };

  const renderTooltipMetadata = function ({ node }) {
    let ratio, pretty;
    const { data } = node;
    const count = data.comment_count;

    pretty = new Intl.NumberFormat( "en-US" );
    currentComments = pretty.format( count );

    if ( currentType === "cluster" ) {
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
      currentSubredditsOne = ax.slice( 0, 5 );
      currentSubredditsTwo = ax.slice( 5, 10 );
    }
  }

  const renderTooltipClusters = function ({ node }) {
    currentClustersOne = []
    currentClustersTwo = []
    if ( currentType === "subreddit cluster" ) {
      let length = 0;
      let listLength = 5;
      if ( node.data.children.length <= listLength ) {
        length = node.data.children.length;
      }
      else {
        length = node.data.children.length / 2
      }
      for ( let i = 0; i < length; i++ ) {
        currentClustersOne.push(`- ${ node.data.children[i].taxonomy_label }`)
        
      }
      if ( length > listLength / 2 ) {
        for ( let i = listLength + 1; i < node.data.children.length; i++ ) {
          currentClustersTwo.push(`- ${ node.data.children[i].taxonomy_label }`)
        }
      }
    }
  }

  const renderTooltipNearestNeighbors = function ({ node }) {
    currentNearestNeighborsOne = []
    currentNearestNeighborsTwo = []
    if ( currentType === "subreddit" ) {
      const ax = node.data.nearest_neighbors;
      let subredditBadgePairs = []
      for ( let i = 0; i < ax.length; i++ ) {
        const subreddit = ax[i][0]
        const taxonomy_label = ax[i][1];
        if (node.data.taxonomy_label != taxonomy_label) {
          subredditBadgePairs.push([`${ subreddit } (${ taxonomy_label })`, "public"]);
        }
        else {
          subredditBadgePairs.push([`${ subreddit }`, "public"]);
        }
    

        
      }
      currentNearestNeighborsOne = subredditBadgePairs.slice( 0, 5 );
      currentNearestNeighborsTwo = subredditBadgePairs.slice( 5, 10 );
      console.log("currentNearestNeighborsOne: ", currentNearestNeighborsOne)
      console.log("currentNearestNeighborsTwo: ", currentNearestNeighborsTwo)
    }
  }

  const fetchMetadata = async function ( node ) {
    // We don't want to update the tooltip values until we have the metadata
    // because it affects how some subreddits are displayed.
    try {
      const metadata = await Metadata.get( node.data.subreddit );
      currentAbout = metadata?.about?.description;
      currentBadge = metadata?.type ?? "public";
    } catch (error) {
      // If we get a 404 or other error for metadata, make a best effort.
      currentAbout = null;
      currentBadge = null;
    }
  };

  const fetchNearestNeighborBadge = async function ( node ) {
    // We don't want to update the tooltip values until we have the metadata
    // because it affects how some subreddits are displayed.
    
    for ( let i = 0; i < node.data.nearest_neighbors.length; i++ ) {
      try {
        const metadata = await Metadata.get( node.data.subreddit );
        if (i < 5) {
          
          currentNearestNeighborsOne[i][1] = metadata?.type ?? "public";
          if (metadata?.type == "private") {
            currentNearestNeighborsOne[i][0] = ""
          }
          
        }
        else {
          currentNearestNeighborsTwo[i][1] = metadata?.type ?? "public";
          if (metadata?.type == "private") {
            currentNearestNeighborsOne[i][1] = ""
          }
        }
      } catch (error) {
        // If we get a 404 or other error for metadata, make a best effort.
        
      } 
    } 
  };

  const renderMetadata = async function ({ node }) {
    if ( currentType === "subreddit" ) {
      currentSubreddit = node.data.subreddit;
      await fetchMetadata( node );
      await fetchNearestNeighborBadge( node );
    } else {
      currentAbout = null;
      currentBadge = null;
    }
  };

  const renderImage = function ({ node }) {
    currentImage = `https://data.redditmap.social/images/${ node.data.displayLabel }.png`;
  };

  const renderFlow = async function ( detail ) {
    renderTooltipHeading( detail );
    renderTooltipMetadata( detail );
    renderTooltipSubreddits( detail );
    renderTooltipClusters ( detail );
    renderTooltipNearestNeighbors ( detail );
    await renderMetadata( detail );
    renderImage( detail );
  };

  const renderTooltipNode = async function ( detail ) {
    if ( detail?.node == null ) {
      currentDisplay = "none";
      return;
    } else {
      currentDisplay = "block";
    }

    if ( currentNode === detail.node ) {
      positionTooltip( detail );
      return;
    } else {
      tooltipReady = false;
      currentNode = detail.node;
    }
      
    if ( detail.node.data.subreddit == null ) {
      let isSubredditCluster = false;
      for ( let i = 0; i < detail.node.data.children.length; i++ ) {
        if (detail.node.data.children[i].subreddit != null) {
          isSubredditCluster = true;
          break;
        }
      }
      if ( isSubredditCluster === false ) {
        currentType = "subreddit cluster";
      }
      else {
        currentType = "cluster";
      }
    } else {
      currentType = "subreddit";
    }
      
    await renderFlow( detail );
    tooltipReady = true;
  };

  $: renderTooltipNode( event );

</script>





<section
  class="tooltip"
  style:display={currentDisplay}
  style:top={currentTop}
  style:bottom={currentBottom}
  style:left={currentLeft}
  >
    {#if tooltipReady !== true}
      <Spinner></Spinner>
    
    {:else}

      <section>
        <h2>
          {#if currentBadge === "nsfw"}
            <sl-badge variant="warning" pill>
              NSFW
            </sl-badge>
            {currentName}
          {:else if currentBadge ===  "banned"}
            <sl-badge variant="danger" pill>
              Banned
            </sl-badge>
            {currentName}
          {:else if currentBadge === "private"}
            <sl-badge variant="neutral" pill>
              Private
            </sl-badge>
          {:else}
            {currentName}
          {/if}
        </h2>
      
        <h3>Size Metadata</h3>
        <p>Number of Comments: {currentComments}</p>
        {#if currentType === "cluster"}
          <p>Percentage of Reddit Comments: {currentCommentPercent}</p>
        {:else}
          <p>Percentage of Cluster: {currentCommentPercent}</p>
        {/if}
      </section>
      
      {#if currentType === "subreddit cluster"}
        <section class="child-clusters">
          <h3>Topics</h3>
          <div class="child-clusters-wrapper">
            <div class="group">
              {#each currentClustersOne as cluster}
                <p>{cluster}</p>
              {/each}
            </div>
            <div class="group">
              {#each currentClustersTwo as cluster}
                <p>{cluster}</p>
              {/each}
            </div>
          </div>
        </section>
      {/if}

      {#if currentType === "cluster"}
        <section class="top-subreddits">
          <h3>Top Subreddits By Number of Comments</h3>
          <div class="top-10-wrapper">
            <div class="group">
              {#each currentSubredditsOne as subreddit}
                <p>{subreddit}</p>
              {/each}
            </div>

            <div class="group">
              {#each currentSubredditsTwo as subreddit}
                <p>{subreddit}</p>
              {/each}
            </div>
          </div>
        </section>
      {/if}

      {#if currentType === "subreddit"}
        <section class="nearest-neighbors">
          <h3>Closest Subreddits: </h3>
          <div class="nearest-neighbors-wrapper">
            <div class="group">
              {#each currentNearestNeighborsOne as subreddit}
                <p>
                    {subreddit[0]}
                </p>
              {/each}
              
            </div>
      
          </div>
          
        </section>
      {/if}

      {#if currentType === "subreddit" && currentAbout != null}
        <section class="about">
          <h3>About Subreddit</h3>
          <p>{currentAbout}</p>
        </section>
      {/if}

      

      <!-- {#if (currentType === "subreddit") && (currentImage != null)}
        <div class="image-frame">
          <img 
            src={currentImage}
            alt="screen capture for subreddit {currentName}"
          >
        </div>
      {/if} -->
    {/if}


  </section>
<style>
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
    display: flex;
    align-items: center;
  }

  .tooltip h2 sl-badge {
    margin-right: 0.5rem;
  }

  .tooltip h2 sl-badge::part(base) {
    font-size: 1rem;
    font-weight: var(--gobo-font-weight-black);
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

  .tooltip .top-subreddits .top-10-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    max-height: 7rem;
    padding: 0;
  }

  .tooltip .top-subreddits .top-10-wrapper .group {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 0;
  }

  .tooltip .top-subreddits p {
    margin-right: 1rem;
  }

  .tooltip .child-clusters .child-clusters-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    max-height: 7rem;
    padding: 0;
  }

  .tooltip .child-clusters .child-clusters-wrapper .group {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 0;
  }

  .tooltip .child-clusters p {
    margin-right: 1rem;
  }

  .tooltip .nearest-neighbors .nearest-neighbors-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    max-height: 15rem;
    padding: 0;
  }

  .tooltip .nearest-neighbors .nearest-neighbors-wrapper .group {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: flex-start;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 0;
  }

  .tooltip .nearest-neighbors p {
    margin-right: 1rem;
  }

</style>
