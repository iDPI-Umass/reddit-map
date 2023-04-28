import * as h from "../helpers.js";

// Updates when we drill down into a treemap category.
const updateView = function ({ subrootID }) {
  this.subroot = this.hierarchyMap.get( subrootID );
  this.isTopLevel = this.subroot === this.data;
  this.subview = new Set( this.subroot.descendants() );
  this.labels = h.pluckLabels( this.subroot );
  
  this.neighbors = [];
  if ( this.labels.length === 1 ) {
    for ( const id of this.labels[0].data.nearest_neighbors ) {
      const node = this.hierarchyMap.get( id );
      this.neighbors.push( node );
    }
  }

  this.render();
};

export { updateView }