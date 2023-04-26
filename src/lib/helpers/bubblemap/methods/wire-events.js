const wireEvents = function () {
  this.zoomScale = 1;
  this.dragCenterX = 0;
  this.dragCenterY = 0;
  
  this.startZoomLoop();
  
  this.element.addEventListener( "wheel", this.scrollZoom.bind(this) );
  this.element.addEventListener( "pointerdown", this.handlePointerDown.bind(this) );
  this.element.addEventListener( "pointerup", this.handlePointerUp.bind(this) );
};

export { wireEvents }