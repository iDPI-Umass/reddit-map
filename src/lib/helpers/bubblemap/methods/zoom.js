const MAX_ZOOM = 1.95;
const MIN_ZOOM = 0.6;

const scrollZoom = function ( event ) {
  event.preventDefault();

  this.applyZoom({
    dy: event.deltaY,
    x: event.offsetX,
    y: event.offsetY
  });
};

const applyZoom = function ({ dy, x, y }) {
  this.zoomScale += dy * -0.0015;
  if ( this.zoomScale < MIN_ZOOM ) {
    this.zoomScale = MIN_ZOOM;
  }
  if ( this.zoomScale > MAX_ZOOM ) {
    this.zoomScale = MAX_ZOOM;
  }

  this.zoomRatioX = (x * this.resolutionScale) / this.width;
  this.zoomRatioY = (y * this.resolutionScale) / this.height;
}


const startZoomLoop = function () {
  let currentScale = this.zoomScale;
  let currentX = this.dragCenterX;
  let currentY = this.dragCenterY;

  const changeDetected = () => {
    return (this.zoomScale !== currentScale) ||
      (this.dragCenterX !== currentX) || 
      (this.dragCenterY !== currentY);
  };

  const update = function () {
    if ( changeDetected() ) {
      currentScale = this.zoomScale;
      const [ x0, x1, y0, y1 ] = this.data.boundaries;
      const width = ( x1 - x0 ) * currentScale;
      const height = ( y1 - y0 ) * currentScale;
    
      const dWidth = width - this.zoomWidth;
      const dHeight = height - this.zoomHeight;
    
      this.zoomWidth = width;
      this.zoomHeight = height;

      const dx = this.scaleX.invert(this.dragCenterX) - this.scaleX.invert(currentX);
      const dy = this.scaleY.invert(this.dragCenterY) - this.scaleY.invert(currentY);

      currentX = this.dragCenterX;
      currentY = this.dragCenterY;
    
      this.boundaries = [
        this.boundaries[0] + ( dWidth * this.zoomRatioX ) + dx,
        this.boundaries[1] - ( dWidth * (1 - this.zoomRatioX) ) + dx,
        this.boundaries[2] + ( dHeight * this.zoomRatioY ) + dy,
        this.boundaries[3] - ( dHeight * (1 - this.zoomRatioY) ) + dy
      ];
        
      this.scaleToBoundaries();
      this.render();
    }
    
    this.zoomLoopID = window.requestAnimationFrame( update.bind(this) );
  };
  
  this.zoomLoopID = window.requestAnimationFrame( update.bind(this) );
};

const stopZoomLoop = function () {
  window.cancelAnimationFrame( this.zoomLoopID );
};

export {
  scrollZoom,
  applyZoom,
  startZoomLoop,
  stopZoomLoop
}