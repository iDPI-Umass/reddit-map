import * as h from "../helpers.js";

const loadData = function ( data ) {
  this.data = data
  console.log( "bubblemap data", this.data );
  this.indexHierachy();

  this.boundaries = this.data.boundaries;
  this.subroot = this.data;
  this.view = new Set( this.data.descendants() );
  this.subview = this.view;
  this.labels = h.pluckLabels( this.subroot );
};

export { loadData }