const wireEvents = function () {
  if ( this.isWired !== true ) {
    // this.element.addEventListener( "click", this.zoom.bind(this) );
    this.isWired = true;
  }
};

export { wireEvents }