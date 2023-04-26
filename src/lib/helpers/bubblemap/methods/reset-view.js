import * as h from "../helpers.js";

const resetView = function () {
  this.stopZoomLoop();

  this.subroot = this.data;
  this.view = new Set( this.data.descendants() );
  this.subview = this.view;
  this.labels = h.pluckLabels( this.subroot );

  this.zoomScale = 1;
  this.dragCenterX = 0;
  this.dragCenterY = 0;
  this.boundaries = this.data.boundaries;
  
  this.scaleToBoundaries();
  this.render();
  this.startZoomLoop();
};

export { resetView }