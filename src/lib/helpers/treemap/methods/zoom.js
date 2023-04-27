const zoom = function ( type, event ) {
  if ( type === "select child" ) {
    const node = this.findNode( event );
    if ( node != null ) {
      return this.zoomIn( node );
    }

  } else if ( type === "back parent" ) {
    return this.zoomOut( this.parent );
  
  } else {
    throw new Error( `unknown zoom event ${type}` );
  
  }
};

export { zoom }