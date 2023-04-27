const contains = function ( node, x, y ) {
  return ( node.x0 <= x ) && 
  ( node.x1 >= x ) &&
  ( node.y0 <= y ) &&
  ( node.y1 >= y );
}


const _findNode = function ( nodes, x, y ) {
  for ( const node of nodes ) {
    if (contains( node, x, y )) {
      return node;
    }
  }
  return null;
};

const findNode = function ( event ) {
  const x = this.scaleX.invert( event.offsetX * this.resolutionScale );
  const y = this.scaleY.invert( event.offsetY * this.resolutionScale );

  const node = _findNode( this.view, x, y );

  return node;
};

export {
  findNode
}