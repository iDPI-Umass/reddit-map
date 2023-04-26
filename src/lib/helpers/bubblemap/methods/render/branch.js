const getNearestLabel = function ( node ) {
  let parent = this.hierarchyMap.get( node.parent.data.node_id );
  for ( const label of this.labels ) {
    if ( parent === label ) {
      return parent;
    }
  }
  return this.getNearestLabel( parent );
};

const drawBranch = function ( node ) {
  const x = this.scaleX( node.data.tsne_x );
  const y = this.scaleY( node.data.tsne_y );
  
  this.context.beginPath();
  this.context.moveTo( x, y );
  
  const parent = this.getNearestLabel( node );
  const px = this.scaleX( parent.data.tsne_x );
  const py = this.scaleY( parent.data.tsne_y );
  
  this.context.lineTo( px, py );
  this.context.lineWidth = 1;
  this.context.stroke();
};

const drawBranches = function () {
  if ( this.subroot !== this.data ) {
    for ( const node of this.subview ) {
      if ( node.data.subreddit != null ) {
        this.drawBranch( node );
      }
    }
  }
};

export {
  getNearestLabel,
  drawBranch,
  drawBranches
}