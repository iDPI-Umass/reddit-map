const zoom = function ( event ) {
  const match = this.findNode( event );
  
  if ( match.isParent ) {
    return this.zoomOut( event, match.node );
  }

  if ( match.node != null ) {
    return this.zoomIn( event, match.node );
  }
};

export { zoom }