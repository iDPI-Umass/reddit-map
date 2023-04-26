const setStyleDefaults = function () {
  this.context.strokeStyle = "#000";
  this.context.font = "24px Roboto";
  this.context.fontKerning = "normal";
}

const clearCanvas = function () {
  this.context.clearRect( 0, 0, this.width, this.height );
}

const render = function () {
  this.setStyleDefaults();
  this.clearCanvas();
  this.drawInertView();
  this.drawBranches();
  this.drawSubview();
  this.drawLabels();
}

export {
  setStyleDefaults,
  clearCanvas,
  render
}