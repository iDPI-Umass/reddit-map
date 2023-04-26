const wireEvents = function () {
  this.element.addEventListener( "click", this.zoom.bind(this) );
};

export { wireEvents }