const getNearestLabel = function ( node ) {
  const parent = node.parent;
  if ( parent == null )  {
    return null;
  }
  
  for ( const label of this.labels ) {
    if ( parent === label ) {
      return parent;
    }
  }

  return this.getNearestLabel( parent );
};

const drawLabel = function ( label ) {
  const x = this.scaleX( label.data.tsne_x );
  const y = this.scaleY( label.data.tsne_y );
  const text = label.data.displayLabel;

  const metrics = this.context.measureText( text );
  const textX = x - metrics.width / 2;
  const textY = y + this.labelBoxPadding;
  const boxX = textX - this.labelBoxPadding;
  const boxY = y - this.labelBoxHeightHalf;
  const boxWidth = metrics.width + this.labelBoxPaddingDouble;

  this.context.fillStyle = "#FFFFFF";
  this.context.fillRect( boxX, boxY, boxWidth, this.labelBoxHeight );
  this.context.strokeRect( boxX, boxY, boxWidth, this.labelBoxHeight );
  this.context.fillStyle = "#000000";
  this.context.fillText( text, textX, textY );
};

const drawSubviewLabels = function () {
  for ( const label of this.labels ) {
    this.drawLabel( label );
  }
};

const drawNeighborLabel = function ( end ) {
  const x1 = this.scaleX( end.data.tsne_x );
  const y1 = this.scaleY( end.data.tsne_y );
  const text = end.data.displayLabel;

  const metrics = this.context.measureText( text );
  const textX = x1 - metrics.width / 2;
  const textY = y1 + this.labelBoxPadding;
  const boxX = textX - this.labelBoxPadding;
  const boxY = y1 - this.labelBoxHeightHalf;
  const boxWidth = metrics.width + this.labelBoxPaddingDouble;

  this.context.fillStyle = end.data.color;
  this.context.fillRect( boxX, boxY, boxWidth, this.labelBoxHeight );
  this.context.strokeRect( boxX, boxY, boxWidth, this.labelBoxHeight );
  this.context.fillStyle = "#000";
  this.context.fillText( text, textX, textY );
};

const drawNeighborLabels = function () {
  for ( const node of this.neighbors ) {
    this.drawNeighborLabel( node );
  }
};

export {
  getNearestLabel,
  drawLabel,
  drawSubviewLabels,
  drawNeighborLabel,
  drawNeighborLabels
}