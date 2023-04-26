import { element } from "svelte/internal";

const handlePointerDown = function ( event ) {
  event.preventDefault();

  this.element.onpointermove = this.dragView.bind( this );
  this.element.setPointerCapture( event.pointerId );
};

const handlePointerUp = function ( event ) {
  event.preventDefault();

  this.element.onpointermove = null;
  this.element.releasePointerCapture( event.pointerId )
};

const dragView = function ( event ) {
  event.preventDefault();

  this.dragCenterX = this.dragCenterX - ( event.movementX * this.resolutionScale );
  this.dragCenterY = this.dragCenterY - ( event.movementY * this.resolutionScale );
};


export {
  handlePointerDown,
  handlePointerUp,
  dragView
}