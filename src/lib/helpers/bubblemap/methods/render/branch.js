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

const drawNeighborBranch = function ( start, end ) {
  const x0 = this.scaleX( start.data.tsne_x );
  const y0 = this.scaleY( start.data.tsne_y );
  const x1 = this.scaleX( end.data.tsne_x );
  const y1 = this.scaleY( end.data.tsne_y );

  this.context.beginPath();
  this.context.moveTo( x0, y0 );  
  this.context.lineTo( x1, y1 );
  this.context.lineWidth = 1;
  this.context.stroke();
};

const drawNeighborBranches = function () {
  for ( const node of this.neighbors ) {
    this.drawNeighborBranch( this.labels[0], node );
  }
};

export {
  drawBranch,
  drawBranches,
  drawNeighborBranch,
  drawNeighborBranches
}