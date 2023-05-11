const wireEvents = function () {
  this.element.addEventListener( "mousedown", this.handleMouseDown.bind(this) );
  this.element.addEventListener( "mouseenter", this.handleHoverEnter.bind(this) );
  this.element.addEventListener( "mouseleave", this.handleHoverLeave.bind(this) );
  this.element.addEventListener( "mousemove", this.handleHover.bind(this) );
  this.element.addEventListener( "touchstart", this.handleTouchStart.bind(this) );
};

export { wireEvents }