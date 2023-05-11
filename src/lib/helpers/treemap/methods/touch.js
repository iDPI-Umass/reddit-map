let currentX, currentY;

const handleTouchStart = function ( event ) {
  event.preventDefault();
  const touch = event.touches[0];

  const rect = this.element.getBoundingClientRect()
  currentX = touch.clientX - rect.left;
  currentY = touch.clientY - rect.top;

  const _event = {
    offsetX: currentX,
    offsetY: currentY
  };

  const node = this.findNode( _event );
  if ( node == null ) {
    console.warn( "Touch event had no matching node" );
    return;
  }


  if ( this.touchCurrentNode !== node ) {
    this.touchCurrentNode = node;
    const detail = { currentX, currentY, node };
    const custom = new CustomEvent( "touchSelect", { detail });
    this.element.dispatchEvent( custom );
  } else if ( this.touchCurrentNode === node ) {
    if ( node.data.subreddit != null ) {
      this.openTab( node.data.subreddit );
    } else {
      this.zoomIn( node );
      const custom = new CustomEvent( "touchSelect", {});
      this.element.dispatchEvent( custom );
    }
  }

}

export { handleTouchStart }