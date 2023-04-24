import * as h from "../helpers.js";

const setStyleDefaults = function () {
  this.fontSize = Math.round( 12 * this.resolutionScale );
  this.lineHeight = Math.round( this.fontSize * 1.33 );
  this.context.lineWidth = this.lineWidth;
  this.context.strokeStyle = "#FFFFFF";
  this.context.font = `${ this.fontSize }px Roboto`;
  this.context.fontKerning = "normal";
};

const clearCanvas = function () {
  this.context.clearRect( 0, 0, this.width, this.height );
};

const drawParent = function () {
  const fill = `${ this.parent?.data.color ?? "#FFFFFF" }80`;
  const label = this.parent?.data.taxonomy_label ?? "All of Reddit";

  const x0 = 0;
  const x1 = this.scaleX( 1 );
  const y0 = 0;
  const y1 = this.parentHeight;
  const tx = 4;   // 2 * this.resolutionScale
  const ty = 28;  // 14 * this.resolutionScale

  this.context.fillStyle = fill;
  this.context.fillRect( x0, y0, x1, y1 );
  this.context.strokeRect( x0, y0, x1, y1 );

  this.context.fillStyle = "#000"
  this.context.fillText( label, tx, ty, this.width );
};

const drawLeaf = function ( leaf ) {
  const x0 = this.scaleX( leaf.x0 );
  const x1 = this.scaleX( leaf.x1 );
  const y0 = this.scaleY( leaf.y0 );
  const y1 = this.scaleY( leaf.y1 );

  const width = x1 - x0;
  const height = y1 - y0;

  this.context.clearRect( x0, y0, width, height );
  
  this.context.fillStyle = leaf.data.colorHalf;
  this.context.fillRect( x0, y0, width, height );
  
  this.context.strokeRect( x0, y0, width, height );
};

const labelLeaf = function ( leaf ) {
  const x0 = this.scaleX( leaf.x0 );
  const x1 = this.scaleX( leaf.x1 );
  const y0 = this.scaleY( leaf.y0 );

  const width = x1 - x0;
  const tx = x0 + 4;  // 2 * this.resolutionScale
  const ty = y0 + 28; // 14 * this.resolutionScale

  this.context.fillStyle = "#000000"
  h.drawWrappedText.call( this, leaf.data.displayLabel, tx, ty, width );
};

const drawLeaves = function () {
  for ( const leaf of this.view ) {
    this.drawLeaf( leaf );
    this.labelLeaf( leaf );
  }
};

const render = function () {
  this.setStyleDefaults();
  this.clearCanvas();
  this.drawParent();
  this.drawLeaves();
};


export {
  setStyleDefaults,
  clearCanvas,
  drawParent,
  drawLeaf,
  labelLeaf,
  drawLeaves,
  render
}