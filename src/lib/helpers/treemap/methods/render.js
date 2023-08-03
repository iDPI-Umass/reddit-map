import * as h from "../helpers.js";
import { get } from 'svelte/store'
import { filterStore } from "$lib/stores/filter.js";
import { searchStore } from "../../../stores/search.js";

const setStyleDefaults = function () {
  this.context.lineWidth = this.lineWidth;
  this.context.strokeStyle = "#FFFFFF";
  this.context.font = `${ this.fontSize }px Roboto`;
  this.context.fontKerning = "normal";
};

const clearCanvas = function () {
  this.context.clearRect( 0, 0, this.width, this.height );
};

const drawLeaf = function ( leaf ) {
  const x0 = this.scaleX( leaf.x0 );
  const x1 = this.scaleX( leaf.x1 );
  const y0 = this.scaleY( leaf.y0 );
  const y1 = this.scaleY( leaf.y1 );

  const width = x1 - x0;
  const height = y1 - y0;

  this.context.clearRect( x0, y0, width, height );
  if ( leaf.data.subreddit != undefined && get( searchStore ) != undefined && leaf.data.subreddit === get( searchStore ).searchTerm) {
    this.context.fillStyle = leaf.data.color;
  }
  else {
    this.context.fillStyle = leaf.data.colorHalf;
  }
  this.context.fillRect( x0, y0, width, height );
  
  this.context.strokeRect( x0, y0, width, height );
};

const labelLeaf = function ( leaf ) {
  const filter = get( filterStore )
  if ( leaf.data.type === "private" ) {
    return;
  }
  const x0 = this.scaleX( leaf.x0 );
  const x1 = this.scaleX( leaf.x1 );
  const y0 = this.scaleY( leaf.y0 );

  const width = x1 - x0 - this.leafPaddingDouble;
  const tx = x0 + this.leafPadding;
  const ty = y0 + this.lineHeight;

  this.context.fillStyle = "#000000"

  if ( !filter || !( filter.key in leaf.data ) || leaf.data[filter.key] != filter.value ) {
    h.drawWrappedText.call( this, leaf.data.displayLabel, tx, ty, width );
  }
  

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
  this.drawLeaves();
};


export {
  setStyleDefaults,
  clearCanvas,
  drawLeaf,
  labelLeaf,
  drawLeaves,
  render
}