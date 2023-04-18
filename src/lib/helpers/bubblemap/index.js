import * as d3 from "d3";
import * as h from "./helpers";
import { animate, cubicBezier } from "popmotion";


const ease = cubicBezier( 0.42, 0.0, 0.58, 1.0 );
const twoPiRadians = 2 * Math.PI;


class BubblemapEngine {
  constructor () {}

  static create ({ canvas }) {
    return Object.assign( new BubblemapEngine(), {
      element: canvas,
      context: canvas.getContext( "2d" ),
      d3Canvas: d3.select( canvas )
    });
  }

  size ( frame ) {
    this.resolutionScale = 2;
    this.width = frame.clientWidth * this.resolutionScale;
    this.height = frame.clientHeight * this.resolutionScale;
    this.minBubbleSize = 5 * this.resolutionScale;
    this.maxBubbleSize = 20 * this.resolutionScale;
    this.padding = this.maxBubbleSize * 2; // 2 for double radius and either side of width/height

  
    this.d3Canvas
      .attr( "width", this.width )
      .attr( "height", this.height );

    // TODO: Should this go somewhere else?
    this.wireEvents();
  }

  wireEvents () {
    if ( this.isWired !== true ) {
      // this.element.addEventListener( "click", this.zoom.bind(this) );
      this.isWired = true;
    }
  }

  setScale ( domain, range ) {
    this.scaleX = d3.scaleLinear()
      .domain([ domain.x0, domain.x1 ])
      .rangeRound([ range.x0, range.x1 ]);
    
    this.scaleY = d3.scaleLinear()
      .domain([ domain.y0, domain.y1 ])
      .rangeRound([ range.y0, range.y1 ]);

    this.scaleSize = d3.scaleLinear()
      .domain([ domain.size0, domain.size1 ])
      .rangeRound([ range.size0, range.size1 ]);
  }

  getBoundaries ( view ) {
    let minX, maxX, minY, maxY, minSize, maxSize;

    for ( const node of view ) {
      if ( node.data.tsne_x != null ) {
        minX = node.data.tsne_x;
        maxX = node.data.tsne_x;
        minY = node.data.tsne_y;
        maxY = node.data.tsne_y;
        break;
      }
    }

    for ( const node of view ) {
      if ( node.data.subreddit_count != null ) {
        minSize = node.data.subreddit_count;
        maxSize = node.data.subreddit_count;
        break;
      }
    }    
   
    for ( const node of view ) {
      const { tsne_x, tsne_y, subreddit_count } = node.data;

      if ( tsne_x != null ) {
        if ( tsne_x < minX ) {
          minX = tsne_x;
        }
        if ( tsne_x > maxX ) {
          maxX = tsne_x;
        }
        if ( tsne_y < minY ) {
          minY = tsne_y;
        }
        if ( tsne_y > maxY ) {
          maxY = tsne_y;
        }
      }
    
      if ( subreddit_count != null ) {
        if ( subreddit_count < minSize ) {
          minSize = subreddit_count
        }
        if ( subreddit_count > maxSize ) {
          maxSize = subreddit_count
        }
      }
    }

    return [ minY, maxY, minY, maxY, minSize, maxSize ];
  }

  scaleToBoundaries () {
    this.boundaries = this.getBoundaries( this.view );
    const [ x0, x1, y0, y1, size0, size1 ] = this.boundaries;
    
    this.setScale( { x0, x1, y0, y1, size0, size1 }, { 
      x0: this.padding,
      x1: this.width - this.padding,
      y0: this.padding,
      y1: this.height - this.padding,
      size0: this.minBubbleSize,
      size1: this.maxBubbleSize
    });
  }

  indexHierachy ( children ) {
    if ( children == null ) {
      this.hierarchyMap = new Map();
      this.hierarchyMap.set( this.data.data.displayLabel, this.data );
      this.indexHierachy( this.data.children );
      return;
    }
    
    for ( const child of children ) {
      this.hierarchyMap.set( child.data.displayLabel, child );
      if ( child.children != null ) {
        this.indexHierachy( child.children );
      }
    }
  }

  loadData ( data ) {
    this.data = data
    console.log( "bubblemap data", this.data );
    this.indexHierachy();

    this.subroot = this.data;
    this.view = new Set( this.data.descendants() );
    this.subview = this.view;
    this.labels = h.pluckLabels( this.subroot.children );
  }

  setStyleDefaults () {
    this.context.lineWidth = "2px";
    this.context.strokeStyle = "#FFFFFF";
    this.context.font = "24px Roboto";
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

  drawInertNode ( node ) {
    const x = this.scaleX( node.data.tsne_x );
    const y = this.scaleY( node.data.tsne_y );
    const r = this.scaleSize( node.data.subreddit_count );
    
    this.context.beginPath();
    this.context.arc( x, y, r, 0, twoPiRadians );
    this.context.fill();    
  }

  drawView () {
    this.context.fillStyle = "#80808040";
    for ( const node of this.view ) {
      if ( !this.subview.has( node ) ) {
        this.drawInertNode( node );
      }
    }
  }

  drawNode ( node ) {
    const x = this.scaleX( node.data.tsne_x );
    const y = this.scaleY( node.data.tsne_y );
    const r = this.scaleSize( node.data.subreddit_count );
    
    this.context.beginPath();
    this.context.arc( x, y, r, 0, twoPiRadians );
    this.context.fillStyle = node.data.colorBubble;
    this.context.fill();    
  }

  drawSubview () {
    for ( const node of this.subview ) {
      this.drawNode( node );
    }
  }

  drawLabel ( label ) {
    const x = this.scaleX( label.x );
    const y = this.scaleY( label.y );

    this.context.fillStyle = "#000000"
    this.context.fillText( label.text, x, y );
  }

  drawLabels () {
    for ( const label of this.labels ) {
      this.drawLabel( label );
    }
  }

  render () {
    this.setStyleDefaults();
    this.clearCanvas();
    this.scaleToBoundaries();
    this.drawView();
    this.drawSubview();
    this.drawLabels();
  }

  // Updates when we drill down into a treemap category.
  updateView ({ subrootLabel }) {
    this.subroot = this.hierarchyMap.get( subrootLabel );
    this.subview = new Set( this.subroot.descendants() );
    this.labels = h.pluckLabels( this.subroot.children );
    this.render();
  }

  // Updates when we look at another month of data.
  updateData ( data ) {
    console.log( "New Month" );

    // Reset to top-level view of current data to start animation to another month.
    this.updateView({ subrootLabel: this.data.data.displayLabel });

    const newView = new Set ( data.descendants() );
    const newBoundaries = this.getBoundaries( newView );
    const dBoundaries = [];
    for ( let i = 0; i < this.boundaries.length; i++ ) {
      dBoundaries.push( newBoundaries[i] - this.boundaries[i] );
    }
    
    const diffMap = new Map();
    for ( const newNode of newView ) {
      const name = newNode.data.displayLabel;
      const oldNode = this.hierarchyMap.get( name );
      if ( oldNode != null ) {
        const dx = newNode.data.tsne_x - oldNode.data.tsne_x;
        const dy = newNode.data.tsne_y - oldNode.data.tsne_y;
        const dSize = newNode.data.subreddit_count - oldNode.data.subreddit_count;
        diffMap.set( name, { oldNode, newNode, dx, dy, dSize });
      }
    }

    animate({
      from: 0,
      to: 1,
      duration: 650,
      ease: ease,
      onUpdate: ratio => {
        this.clearCanvas();

        // Increment scale toward new boundaries.
        this.setScale({ 
          x0: this.boundaries[0] + ( ratio * dBoundaries[0] ),
          x1: this.boundaries[1] + ( ratio * dBoundaries[1] ),
          y0: this.boundaries[2] + ( ratio * dBoundaries[2] ),
          y1: this.boundaries[3] + ( ratio * dBoundaries[3] ),
          size0: this.boundaries[4] + ( ratio * dBoundaries[4] ),
          size1: this.boundaries[5] + ( ratio * dBoundaries[5] ),
        },{ 
          x0: this.padding,
          x1: this.width - this.padding,
          y0: this.padding,
          y1: this.height - this.padding,
          size0: this.minBubbleSize,
          size1: this.maxBubbleSize
        });
        

        // Animate this frame, but avoid mutating old or new data structures.
        for ( const [ name, { oldNode, newNode, dx, dy, dSize } ] of diffMap.entries() ) {
          this.drawNode({
            data: {
              tsne_x: oldNode.data.tsne_x + ( ratio * dx ),
              tsne_y: oldNode.data.tsne_y + ( ratio * dy ),
              subreddit_count: oldNode.data.subreddit_count + ( ratio * dSize ),
              colorBubble: oldNode.data.colorBubble
            }
          });
        }

      },
      onComplete: () => {
        this.loadData( data );
        this.render();
      }
    });
  }
}


export default BubblemapEngine