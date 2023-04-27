const initialize = function () {
  this.boundaries = this.data.boundaries;
  const [ x0, x1, y0, y1 ] = this.boundaries
  this.zoomWidth = x1 - x0;
  this.zoomHeight = y1 - y0;
  this.zoomRatioX = 0.5;
  this.zoomRatioY = 0.5;

  this.scaleToBoundaries();
}

export { initialize }