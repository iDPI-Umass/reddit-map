import * as h from "../helpers";

const zoomOut = function ( node ) {
  console.log( "Zoom Out", node );
  if ( node.parent == null ) {
    console.log( "no parent (top level)" );
    return;
  }

  const setParentScale = () => {
    this.setScale( node.parent, {
      x0: 0, 
      x1: this.width, 
      y0: 0,
      y1: this.height
    });
  };

  const start = {
    x0: 0,
    x1: this.width,
    y0: 0,
    y1: this.height
  };

  setParentScale();
  const end = {
    x0: this.scaleX( node.x0 ),
    x1: this.scaleX( node.x1 ),
    y0: this.scaleY( node.y0 ),
    y1: this.scaleY( node.y1 )
  };

  const dx0 = end.x0 - start.x0;
  const dx1 = end.x1 - start.x1;
  const dy0 = end.y0 - start.y0;
  const dy1 = end.y1 - start.y1;

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

      this.clearCanvas();
      this.setScale( node, { x0, x1, y0, y1 } );

      if ( node.parent.children.length < 100 ) { 
        for ( const leaf of node.parent.children ) {
          this.drawLeaf( leaf );
          this.labelLeaf( leaf );
        }
      } else {
        for ( const leaf of node.parent.children ) {
          this.drawLeaf( leaf );
        }
      }
      

      const width = x1 - x0;
      const height = y1 - y0;
      this.context.clearRect( x0, y0, width, height )
      this.context.strokeRect( x0, y0, width, height );

      if ( node.children.length < 100 ) {
        // Clip the shrinking child so internal labels don't overflow and look sloppy.
        h.setupClip.call( this, x0, x1, y0, y1 );
        for ( const leaf of node.children ) {
          this.drawLeaf( leaf );
          this.labelLeaf( leaf, { squish: true } );
        }
        h.teardownClip.call( this );
      } else {
        for ( const leaf of node.children ) {
          this.drawLeaf( leaf );
        }
      }

    },
    onComplete: () => {
      this.parent = node.parent;
      this.view = node.parent.children;
      this.resetScale( node.parent );
      this.render();
      this.onViewUpdate.bind(this)();
    }
  });
};

export { zoomOut }