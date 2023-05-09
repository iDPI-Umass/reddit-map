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
  let currentName = "";
  let currentComments = 0;
  let currentCommentPercent = 0;
  let currentSubredditsOne = [];
  let currentSubredditsTwo = [];
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
      currentSubredditsOne = ax.slice( 0, 5 );
      currentSubredditsTwo = ax.slice( 5, 10 );
    }
  }

  const fetchMetadata = async function ( node ) {
    const metadata = await Metadata.get( node.data.subreddit );
    currentAbout = metadata?.about?.description;
    currentBadge = metadata?.type ?? "public";
    // console.log( node.data.subreddit, currentBadge );
  };

  const renderMetadata = function ({ node }) {
    if ( currentType === "subreddit" ) {
      if ( currentSubreddit === node.data.subreddit ) {
        return;
      } else {
        currentSubreddit = node.data.subreddit;
        currentAbout = null;
        currentBadge = null;
        fetchMetadata( node );
      }
    } else {
      currentAbout = null;
      currentBadge = null;
    }
  };

  const renderImage = function ({ node }) {
    currentImage = `https://data.redditmap.social/images/${ node.data.displayLabel }.png`;
  };

  const renderTooltipNode = function ( detail ) {
    if ( detail?.node == null ) {
      currentDisplay = "none";
    } else {
      positionTooltip( detail );
      renderTooltipHeading( detail );
      renderTooltipMetadata( detail );
      renderTooltipSubreddits( detail );
      renderMetadata( detail );
      renderImage( detail );

      currentDisplay = "block";
    }
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
    <section>
      <h2>
        {#if currentBadge === "public"}
          <sl-badge variant="primary" pill>
            Public
          </sl-badge>
        {:else if currentBadge === "nsfw"}
          <sl-badge variant="warning" pill>
            NSFW
          </sl-badge>
        {:else if currentBadge ===  "banned"}
          <sl-badge variant="danger" pill>
            Banned
          </sl-badge>
        {:else if currentBadge === "private"}
          <sl-badge variant="neutral" pill>
            Private
          </sl-badge>
        {/if}

        {currentName}
      </h2>
    
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

</style>
