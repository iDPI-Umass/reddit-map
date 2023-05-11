let currentX, currentY, offsetX, offsetY;
const pointers = new Map();

const handlePointerDown = function ( event ) {  
  if ( pointers.size === 0) {
    pointers.set( event.pointerId, {
      id: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY
    });
    this.element.setPointerCapture( event.pointerId );

    currentX = event.clientX;
    currentY = event.clientY;
    const rect = this.element.getBoundingClientRect()
    offsetX = rect.left;
    offsetY = rect.top;
    this.element.onmousemove = this.dragMouse.bind( this );
    this.element.ontouchmove = this.dragTouch.bind( this );
  
  } else {
    pointers.set( event.pointerId, {
      id: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY
    });
    this.element.setPointerCapture( event.pointerId );
  }
};

const handlePointerUp = function ( event ) {
  if ( pointers.size === 1 ) {
    pointers.delete( event.pointerId );
    this.element.releasePointerCapture( event.pointerId );
    this.element.onmousemove = null;
    this.element.ontouchmove = null;
  
  } else {
    pointers.delete( event.pointerId );
    this.element.releasePointerCapture( event.pointerId );
  }
};

const dragMouse = function ( event ) {
  const dx = event.clientX - currentX;
  const dy = event.clientY - currentY;
  currentX = event.clientX;
  currentY = event.clientY;
  this.dragCenterX = this.dragCenterX - ( dx * this.resolutionScale );
  this.dragCenterY = this.dragCenterY - ( dy * this.resolutionScale );
};

const matchPointers = function ( touches ) {
  const matches = [];
  for ( const touch of touches ) {
    const pointer = pointers.get( touch.identifier );
    if ( pointer != null ) {
      matches.push({ 
        touch,
        pointer,
        dx: touch.clientX - pointer.clientX,
        dy: touch.clientY - pointer.clientY
      });
    }
  }

  return matches;
}

const oneTouch = function ( match ) {
  this.dragCenterX = this.dragCenterX - ( match.dx * this.resolutionScale );
  this.dragCenterY = this.dragCenterY - ( match.dy * this.resolutionScale );
}

const getDistance = function ( a, b ) {
  const x = ( a.clientX - b.clientX )**2;
  const y = ( a.clientY - b.clientY )**2;
  return Math.sqrt( x + y );
}

const bisect = function ( a, b ) {
  const startX = Math.min( a.clientX, b.clientX );
  const startY = Math.min( a.clientY, b.clientY );
  const dx = Math.abs(a.clientX - b.clientX) / 2;
  const dy = Math.abs(a.clientY - b.clientY) / 2;
  return {
    x: startX + dx,
    y: startY + dy
  };
}

const twoTouch = function ( matches ) {
  const [ A, B ] = matches
  const final = getDistance( A.touch, B.touch );
  const start = getDistance( A.pointer, B.pointer );
  const center = bisect( A.touch, B.touch );
  
  const change = Math.abs( final - start );
  
  if ( change > 1 ) {
    this.applyZoom({
      dy: start - final, // this is reversed on purpose
      x: center.x - offsetX,
      y: center.y - offsetY
    });
  } else {
    this.oneTouch( matches[0] );
  }
}

const dragTouch = function ( event ) {
  const touches = Array.from( event.touches );
  const matches = matchPointers( touches );

  if ( matches.length === 1 ) {
    this.oneTouch( matches[0] );
  } else {
    this.twoTouch( matches );
  }
  
  for ( const { pointer, touch } of matches ) {
    pointer.clientX = touch.clientX;
    pointer.clientY = touch.clientY;
  }
};


export {
  handlePointerDown,
  handlePointerUp,
  dragMouse,
  dragTouch,
  oneTouch,
  twoTouch
}