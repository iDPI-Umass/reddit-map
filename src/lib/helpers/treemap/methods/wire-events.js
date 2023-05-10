const wireEvents = function () {
  this.element.addEventListener( "click", this.handleClick.bind(this) );
  this.element.addEventListener( "mouseenter", this.handleHoverEnter.bind(this) );
  this.element.addEventListener( "mouseleave", this.handleHoverLeave.bind(this) );
  this.element.addEventListener( "mousemove", this.handleHover.bind(this) );
};

export { wireEvents }