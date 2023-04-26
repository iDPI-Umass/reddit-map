const indexHierachy = function ( children ) {
  if ( children == null ) {
    this.hierarchyMap = new Map();
    this.hierarchyMap.set( this.data.data.node_id, this.data );
    this.indexHierachy( this.data.children );
    return;
  }
  
  if ( children[0]?.data?.subreddit != null ) {
    for ( const child of children ) {
      this.hierarchyMap.set( child.data.subreddit, child );
    }
  } else {
    for ( const child of children ) {
      this.hierarchyMap.set( child.data.node_id, child );
      if ( child.children != null ) {
        this.indexHierachy( child.children );
      }
    }
  }
};

export { indexHierachy }