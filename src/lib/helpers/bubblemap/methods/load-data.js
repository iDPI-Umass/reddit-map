import * as h from "../helpers.js";

const loadData = function ( data ) {
  this.data = data
  console.log( "bubblemap data", this.data );
  this.indexHierachy();

  this.subroot = this.data;
  this.view = new Set( this.data.descendants() );
  this.subview = this.view;
  this.labels = h.pluckLabels( this.subroot );

  this.neighbors = [];
  if ( this.labels.length === 1 ) {
    for ( const id of this.labels[0].data.nearest_neighbors ) {
      const node = this.hierarchyMap.get( id );
      this.neighbors.push( node );
    }
  }
};

export { loadData }