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

  this.context.fillStyle = "#FFFFFFC0";
  this.context.fillRect( boxX, boxY, boxWidth, this.labelBoxHeight );
  this.context.strokeRect( boxX, boxY, boxWidth, this.labelBoxHeight );
  this.context.fillStyle = "#000000";
  this.context.fillText( text, textX, textY );
};

const drawLabels = function () {
  for ( const label of this.labels ) {
    this.drawLabel( label );
  }
};

export {
  drawLabel,
  drawLabels
}