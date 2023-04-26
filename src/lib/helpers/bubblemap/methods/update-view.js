import * as h from "../helpers.js";

// Updates when we drill down into a treemap category.
const updateView = function ({ subrootID }) {
  this.subroot = this.hierarchyMap.get( subrootID );
  this.subview = new Set( this.subroot.descendants() );
  this.labels = h.pluckLabels( this.subroot );
  this.render();
};

export { updateView }