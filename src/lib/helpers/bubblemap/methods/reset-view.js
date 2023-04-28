import * as h from "../helpers.js";

const resetView = function () {
  this.stopZoomLoop();

  this.subroot = this.data;
  this.isTopLevel = true;
  this.view = new Set( this.data.descendants() );
  this.subview = this.view;
  this.labels = h.pluckLabels( this.subroot );
  this.neighbors = [];

  this.zoomScale = 1;
  this.dragCenterX = 0;
  this.dragCenterY = 0;
  this.boundaries = this.data.boundaries;
  const [ x0, x1, y0, y1 ] = this.boundaries
  this.zoomWidth = x1 - x0;
  this.zoomHeight = y1 - y0;
  
  this.scaleToBoundaries();
  this.render();
  this.startZoomLoop();
};

export { resetView }