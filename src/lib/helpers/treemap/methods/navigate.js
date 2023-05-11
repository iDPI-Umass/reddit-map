const openTab = function ( subreddit ) {
  if ( subreddit == null ) {
    console.warn( "tried opening tab, but node lacks subreddit destination" );
    return;
  }

  const url = `https://www.reddit.com/r/${ subreddit }/`
  window.open( url, "_blank", "noopener" );
  window.focus();
}

export { openTab }