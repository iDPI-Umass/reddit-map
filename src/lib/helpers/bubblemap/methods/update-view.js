import * as h from "../helpers.js";
import { labelsStore } from "../../../stores/labels.js";

// Updates when we drill down into a treemap category.
const updateView = function ({ subrootID }) {
  this.subroot = this.hierarchyMap.get( subrootID );
  this.isTopLevel = this.subroot === this.data;
  this.subview = new Set();
  for ( const node of this.subroot.descendants() ) {
    if ( node.data.subreddit != null ) {
      this.subview.add( node );
    }
  }
  this.labels = h.pluckLabels( this.subroot );
  labelsStore.push( this.labels )
  
  this.neighbors = [];
  if ( this.labels.length === 1 ) {
    for ( const [ id ] of this.labels[0].data.nearest_neighbors ) {
      const node = this.hierarchyMap.get( id );
      
      if ( node != null ) {
        this.neighbors.push( node );
      }
      
      if ( this.neighbors.length === 5 ) {
        break;
      }
    }
  }

  this.render();
};

export { updateView }