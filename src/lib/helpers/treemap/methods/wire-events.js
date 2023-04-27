const wireEvents = function () {
  this.element.addEventListener( "click", this.zoom.bind(this, "select child" ) );
};

export { wireEvents }