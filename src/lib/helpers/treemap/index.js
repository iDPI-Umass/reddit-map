import * as d3 from "d3";
import * as h from "./helpers";
import { animate, cubicBezier } from "popmotion";

const ease = cubicBezier( 0.42, 0.0, 0.58, 1.0 );


class TreemapEngine {
  constructor () {}

  static create ({ canvas, onViewUpdate }) {
    return Object.assign( new TreemapEngine(), {
      element: canvas,
      context: canvas.getContext( "2d" ),
      d3Canvas: d3.select( canvas ),
      onViewUpdate: onViewUpdate
    });
  }

  size ( frame ) {
    this.resolutionScale = 2;
    this.parentHeight = 30 * this.resolutionScale;
    this.width = frame.clientWidth * this.resolutionScale;
    this.height = frame.clientHeight * this.resolutionScale;

    this.resetScale();
  
    this.d3Canvas
      .attr( "width", this.width )
      .attr( "height", this.height );

    // TODO: Should this go somewhere else?
    this.wireEvents();
  }

  wireEvents () {
    if ( this.isWired !== true ) {
      this.element.addEventListener( "click", this.zoom.bind(this) );
      this.isWired = true;
    }
  }

  resetScale () {
    this.scaleX = d3.scaleLinear()
      .domain([ 0, 1 ])  
      .rangeRound([ 0, this.width ]);
    
    this.scaleY = d3.scaleLinear()
      .domain([ 0, 1 ])
      .rangeRound([ this.parentHeight, this.height ]);
  }

  setScale ( domain, range ) {
    this.scaleX = d3.scaleLinear()
      .domain([ domain.x0, domain.x1 ])
      .rangeRound([ range.x0, range.x1 ]);
    
    this.scaleY = d3.scaleLinear()
      .domain([ domain.y0, domain.y1 ])
      .rangeRound([ range.y0, range.y1 ]);
  }

  loadData ( data ) {
    const tile = h.tile( this.width, this.height );
    const sortedData = data
      .sum( d => Math.sqrt( d.comment_count ))
      .sort( function ( a, b ) {
        return Math.sqrt(b.comment_count) - Math.sqrt(a.comment_count);
      });

    this.data = d3.treemap().tile( tile )( sortedData );
    console.log( "treempa data", this.data );
    this.data.data.color = "#FFFFFF";
    this.data.data.taxonomy_label = "All of Reddit";
    this.parent = this.data;
    this.view = this.data.children;
  }

  setStyleDefaults () {
    this.fontSize = Math.round( 12 * this.resolutionScale );
    this.lineHeight = Math.round( this.fontSize * 1.33 );
    this.context.lineWidth = "2px";
    this.context.strokeStyle = "#FFFFFF";
    this.context.font = `${ this.fontSize }px Roboto`;
    this.context.fontKerning = "normal";
  }

  clearCanvas () {
    this.context.clearRect( 0, 0, this.width, this.height );
  }

  drawParent () {
    const fill = `${ this.parent?.data.color ?? "#FFFFFF" }80`;
    const label = this.parent?.data.taxonomy_label ?? "All of Reddit";

    const x0 = 0;
    const x1 = this.scaleX( 1 );
    const y0 = 0;
    const y1 = this.parentHeight;
    const tx = 4;   // 2 * this.resolutionScale
    const ty = 28;  // 14 * this.resolutionScale

    this.context.fillStyle = fill;
    this.context.fillRect( x0, y0, x1, y1 );
    this.context.strokeRect( x0, y0, x1, y1 );

    this.context.fillStyle = "#000"
    this.context.fillText( label, tx, ty, this.width );
  }

  drawLeaf ( leaf ) {
    const x0 = this.scaleX( leaf.x0 );
    const x1 = this.scaleX( leaf.x1 );
    const y0 = this.scaleY( leaf.y0 );
    const y1 = this.scaleY( leaf.y1 );

    const width = x1 - x0;
    const height = y1 - y0;

    this.context.clearRect( x0, y0, width, height );
    
    this.context.fillStyle = leaf.data.colorLeaf;
    this.context.fillRect( x0, y0, width, height );
    
    this.context.strokeRect( x0, y0, width, height );
  }

  labelLeaf ( leaf ) {
    const x0 = this.scaleX( leaf.x0 );
    const x1 = this.scaleX( leaf.x1 );
    const y0 = this.scaleY( leaf.y0 );

    const width = x1 - x0;
    const tx = x0 + 4;  // 2 * this.resolutionScale
    const ty = y0 + 28; // 14 * this.resolutionScale

    this.context.fillStyle = "#000000"
    h.drawWrappedText.call( this, leaf.data.displayLabel, tx, ty, width );
  }

  drawLeaves () {
    for ( const leaf of this.view ) {
      this.drawLeaf( leaf );
      this.labelLeaf( leaf );
    }
  }

  render () {
    this.setStyleDefaults();
    this.clearCanvas();
    this.drawParent();
    this.drawLeaves();
  }

  
  findNode ( event ) {
    if ( event.offsetY <= (this.parentHeight / this.resolutionScale) ) {
      return { 
        isParent: true,
        node: this.parent
      };
    }

    const x = this.scaleX.invert( event.offsetX * this.resolutionScale );
    const y = this.scaleY.invert( event.offsetY * this.resolutionScale );

    const node = this.view.find( function ( node ) {
      return ( node.x0 <= x ) && 
        ( node.x1 >= x ) &&
        ( node.y0 <= y ) &&
        ( node.y1 >= y );
    });

    return {
      isParent: false,
      node
    };
  }

  zoom ( event ) {
    const match = this.findNode( event );
    
    if ( match.isParent ) {
      return this.zoomOut( event, match.node );
    }

    if ( match.node != null ) {
      return this.zoomIn( event, match.node );
    }
  }


  zoomIn ( event, node ) {
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
      y0: this.parentHeight,
      y1: this.height
    };

    // d as in delta
    const dx0 = end.x0 - start.x0;
    const dx1 = end.x1 - start.x1;
    const dy0 = end.y0 - start.y0;
    const dy1 = end.y1 - start.y1;

    animate({
      from: 0,
      to: 1,
      duration: 650,
      ease: ease,
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
        this.render();
        this.onViewUpdate.bind(this)();
      }
    });

  }

  zoomOut ( event, node ) {
    console.log( "Zoom Out", node );
    if ( node.parent == null ) {
      console.log( "no parent (top level)" );
      return;
    }

    const setParentScale = () => {
      this.setScale( node.parent, {
        x0: 0, 
        x1: this.width, 
        y0: this.parentHeight,
        y1: this.height
      });
    };



    const start = {
      x0: 0,
      x1: this.width,
      y0: this.parentHeight,
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

    animate({
      from: 0,
      to: 1,
      duration: 650,
      ease: ease,
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
        this.render();
        this.onViewUpdate.bind(this)();
      }
    });
  }
}


export default TreemapEngine