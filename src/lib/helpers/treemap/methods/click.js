const handleClick = function ( event ) {
  const node = this.findNode( event );
  if ( node == null ) {
    console.warn( "Click event had no matching node" );
    return;
  }

  const { subreddit } = node.data;

  if ( subreddit != null ) {
    const url = `https://www.reddit.com/r/${ subreddit }/`
    window.open( url, "_blank", "noopener" );
    window.focus();
  } else {
    this.zoomIn( node );
  }
};

export { handleClick }