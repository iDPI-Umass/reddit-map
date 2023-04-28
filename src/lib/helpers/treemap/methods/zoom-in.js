import * as h from "../helpers";

const zoomIn = function ( node ) {
  console.log( "Zoom In", node );
  if ( node.children == null ) {
    console.log( "no children" );
    return;
  }
  
  const start = {
    x0: this.scaleX( node.x0 ),
    x1: this.scaleX( node.x1 ),
    y0: this.scaleY( node.y0 ),
    y1: this.scaleY( node.y1 )
  };

  const end = {
    x0: 0,
    x1: this.width,
    y0: 0,
    y1: this.height
  };

  // d as in delta
  const dx0 = end.x0 - start.x0;
  const dx1 = end.x1 - start.x1;
  const dy0 = end.y0 - start.y0;
  const dy1 = end.y1 - start.y1;

  this.stopHoverLoop();

  h.animate({
    from: 0,
    to: 1,
    duration: 650,
    ease: h.ease,
    onUpdate: ratio => {
      const x0 = start.x0 + ( ratio * dx0 );
      const x1 = start.x1 + ( ratio * dx1 );
      const y0 = start.y0 + ( ratio * dy0 );
      const y1 = start.y1 + ( ratio * dy1 );

      const width = x1 - x0;
      const height = y1 - y0;

      this.clearCanvas();
      this.setScale( node, { x0, x1, y0, y1 } );

      if ( this.view.length < 100 ) {
        for ( const leaf of this.view ) {
          this.drawLeaf( leaf );
          this.labelLeaf( leaf );
        }
      } else {
        for ( const leaf of this.view ) {
          this.drawLeaf( leaf );
        }
      }

      this.context.clearRect( x0, y0, width, height )
      this.context.strokeRect( x0, y0, width, height );

      if ( node.children.length < 100 ) {
        // Clip the growing child so internal labels don't overflow and look sloppy.
        h.setupClip.call( this, x0, x1, y0, y1 );
        for ( const leaf of node.children ) {
          this.drawLeaf( leaf );
          this.labelLeaf( leaf );
        }
        h.teardownClip.call( this );
      } else {
        for ( const leaf of node.children ) {
          this.drawLeaf( leaf );
        }
      }
      
    },
    onComplete: () => {
      this.parent = node;
      this.view = node.children;
      this.resetScale( node );
      this.render();

      const detail = { node: this.parent };
      const event = new CustomEvent( "updateview", { detail } );
      this.element.dispatchEvent( event );
      
      this.startHoverLoop();
    }
  });

};

export { zoomIn }