<script>
  import MainHeader from "$lib/components/MainHeader.svelte";
  import Center from "$lib/components/layouts/Center.svelte";
</script>

<MainHeader></MainHeader>

<main>
  <section class="gobo-copy">
    <h1> About Reddit Map </h1>

    <h2>Introduction</h2>

      <p>Reddit is home to thousands of self-moderated communities with millions of accounts. These communities contain a wealth of information that researchers, sociologists, and journalists can access and study. The combination of user anonymity, community moderation, and the freedom for a subreddit to be about any interest make Reddit an exciting area of study. Reddit Map is an open-source tool that makes navigating Reddit data easier by displaying clusters of communities with overlapping community members. 
      </p>
      
    <h2>Feedback</h2>

    <ul>
      <li>
        <a href="https://github.com/iDPI-Umass/reddit-map/issues" target="_blank" rel="noopener noreferrer">
          Report issues and bugs
        </a>
      </li>
      <li>
        <a href="https://www.reddit.com/r/RedditMapDotSocial/" target="_blank" rel="noopener noreferrer">
          Join our subreddit
        </a>
      </li>
      <li>
        <a href="https://github.com/iDPI-Umass/reddit-map" target="_blank" rel="noopener noreferrer">
          Contribute to the map
        </a>
      </li>
      <li>
        Email:
        <a href="mailto:redditmap@gmail.com" target="_blank" rel="noopener noreferrer">
          redditmap@gmail.com
        </a>
      </li>
    </ul>
      

    <h2>Acknowledgments</h2>
      <p>Reddit Map is a collaboration between the <a href="https://publicinfrastructure.org">Initiative for Digital Public Infrastructure</a> (iDPI), <a href="https://www.mediacloud.org">Media Cloud</a>, and the UMass Amherst <a href="https://ds.cs.umass.edu">Center for Data Science</a>.</p>
      <p>David Harper, from our development partner <a href="https://pandastrike.com/">Panda Strike</a>, for helping us take this project from an academic demo to a production website. <a href="https://usefathom.com/">Fathom</a>’s privacy preserving analytics, for making it possible to monitor our site in a way that is consistent with our values.
      </p>
      <p>This work was made possible by support from:</p>

      <div class="wrapper">
        <div><img src="/images/ford.png"></div>
        <div><img src="/images/knight.png"></div>
        <div><img src="/images/macarthur.jpg"></div>
      </div>
      



    <h2>Background</h2>
    <h3>Community Embedding</h3>
      <p>Reddit Map uses a model to predict what subreddits a user would comment on based on the subreddits they currently comment on. With enough data, it can more accurately predict which subreddits have overlapping users. A month’s worth of data seems to do this well. Reddit Map takes the top 10,000 most commented on subreddits each month and groups them into 100 clusters based on these predictions.</p>
      <p>Consider the following user and the subreddits they comment on:</p>
      <p>Dataset 1:</p>
      <ul>
        <li>User 1: r/NBA, r/knitting, r/cooking</li>
      </ul>
      <p>Now consider the introduction of two more users into the dataset:</p>
      <p>Dataset 2:</p>
      <ul>
        <li>User 1: r/NBA, r/knitting, r/cooking</li>
        <li>User 2: r/basketball, r/baseball, r/frisbee</li>
        <li>User 3: r/basketball, r/football, r/baseball</li>
      </ul>
      <p>If the model analyzed dataset 1, it would determine that r/knitting and r/basketball should be clustered together because they have an overlapping commenter. However, when the model is introduced to an additional two users, it will see that r/basketball has more overlapping commenters with r/baseball than r/knitting and will therefore cluster r/basketball with r/baseball. </p>
      <p>Note: Subreddits are not clustered by their content. Subreddits with vastly different content may show up in the same cluster due to overlapping commenters. </p>
    <h3>Data Visualization Tool</h3>
      <p>The subreddit clusters are displayed in two formats: a treemap and a bubble map. Using the treemap’s topic labels developed by iDPI’s Digital Collections Curator, users can navigate the interest-based subreddit clusters of the bubble map. </p>
    <h3>Treemap</h3>
      <p>The treemap displays colored boxes, with topic labels, that are sized in proportion to the number of comments in their cluster groupings.</p>
      
      <a href="/images/treemap.png">
        <img src="/images/treemap.png">
      </a>
      
      <a href="/images/tree.png">
        <img src="/images/tree.png">
      </a>
      
      <p>The tree diagram represents the “Hobbies and Media Interests” branch of the treemap from April 2021. Each level represents a topic label, with the final level representing the interest-based subreddit clusters. </p>
      <p>Every month, iDPI’s Digital Collections Curator will review how well the previous month’s topic labels fit with this month’s clusters. For the most part, these subjective labels will be the same from month to month. However, as interests change over time, the labels will change to account for this. </p>
    <h3>Bubble Map</h3>
      <p>The bubble map displays the relative structures of each cluster, and is complemented by the treemap. Each colored bubble represents a subreddit and each group of colored bubbles represents the labels in the treemap. The bubble map only highlights the labels currently displayed in the treemap. </p>
      
      <a href="/images/bubble_map_labels.png">
        <img src="/images/bubble_map_labels.png">
      </a>
      
      <p>The bubble map is a 100 dimensional graph flattened into a 2 dimensional map, so the distance between clusters is distorted and does not provide an accurate representation of the data. For example, two clusters on opposite sides of the map could share a large number of overlapping commenters, just as a 2 dimensional map of the world does not show the accurate distance between Russia and Alaska. The bubble map displays the 5 closest clusters to the selected cluster to remedy the distortion.</p>
      
      <a href="/images/bubble_map_nearest_neighbors.png">
        <img src="/images/bubble_map_nearest_neighbors.png">
      </a>
      
      <p>In the example above, the Online Multiplayer Action Games cluster is open. The bubble map displays the clusters that have the highest number of overlapping user comments with Online Multiplayer Action Games: Rap and Youtube Promotion and Casual Teen Video Games/Interests, for example.</p>

    <h3>Data Slider</h3>
      <a href="/images/data-slider.png">
        <img src="/images/data-slider.png">
      </a>
      
      <p>You can use the data slider to select which month’s data to use for the treemap and bubble map.</p>
  </section>
</main>

<style>
  main {
    flex: 1 1 0;
    min-height: 0;
    max-width: 100vw;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    overflow-y: scroll;
    background-color: var(--gobo-color-null);
  }
  .wrapper {
    display: grid;
    grid-template-columns: repeat(3, 175px);
    gap: 30px;
    grid-auto-rows: minmax(100px, auto);
  }
  
</style>
