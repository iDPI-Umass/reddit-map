let touchX = 0;
let touchY = 0;


const handlePointerDown = function ( event ) {
  event.preventDefault();

  this.element.onpointermove = this.dragView.bind( this );
  this.element.ontouchstart = setTouch;
  this.element.ontouchmove = this.dragView.bind( this );
  this.element.setPointerCapture( event.pointerId );
};

const handlePointerUp = function ( event ) {
  event.preventDefault();

  this.element.onpointermove = null;
  this.element.ontouchmove = null;
  this.element.releasePointerCapture( event.pointerId )
};

const setTouch = function ( event ) {
  const touch = event.touches[0];
  touchX = touch.clientX;
  touchY = touch.clientY;
};

const dragView = function ( event ) {
  if ( event.type === "pointermove" ) {
    event.preventDefault();
    this.dragCenterX = this.dragCenterX - ( event.movementX * this.resolutionScale );
    this.dragCenterY = this.dragCenterY - ( event.movementY * this.resolutionScale );

  } else if ( event.type === "touchmove" ) {
    const touch = event.touches[0];
    const dx = touch.clientX - touchX;
    const dy = touch.clientY - touchY;
    touchX = touch.clientX;
    touchY = touch.clientY;

    this.dragCenterX = this.dragCenterX - ( dx * this.resolutionScale );
    this.dragCenterY = this.dragCenterY - ( dy * this.resolutionScale );
  }
};


export {
  handlePointerDown,
  handlePointerUp,
  dragView
}