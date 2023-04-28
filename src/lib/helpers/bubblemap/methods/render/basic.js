const setStyleDefaults = function () {
  this.context.strokeStyle = "#000";
  this.context.font = `${ this.fontSize }px Roboto`;
  this.context.fontKerning = "normal";
}

const clearCanvas = function () {
  this.context.clearRect( 0, 0, this.width, this.height );
}

const render = function () {
  this.setStyleDefaults();
  this.clearCanvas();
  this.drawInertNodes();
  this.drawNeighborNodes();
  this.drawSubviewNodes();
  this.drawNeighborBranches();
  this.drawNeighborLabels();
  this.drawSubviewLabels();
}

export {
  setStyleDefaults,
  clearCanvas,
  render
}