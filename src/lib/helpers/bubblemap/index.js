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
    this.lineHeight = 12 * this.resolutionScale;
    this.lineHeightHalf = this.lineHeight / 2;
    this.labelBoxPadding = 4 * this.resolutionScale;
    this.labelBoxPaddingDouble = 2 * this.labelBoxPadding;
    this.labelBoxHeight = this.lineHeight + ( 2 * this.labelBoxPadding );
    this.labelBoxHeightHalf = this.labelBoxHeight / 2;
    this.bubbleBorder = Math.round( 0.5 * this.resolutionScale);
  
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

    this.scaleSize = d3.scaleLog()
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
      if ( node.data.comment_count != null ) {
        minSize = node.data.comment_count;
        maxSize = node.data.comment_count;
        break;
      }
    }    
   
    for ( const node of view ) {
      const { tsne_x, tsne_y, comment_count } = node.data;

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
    
      if ( comment_count != null ) {
        if ( comment_count < minSize ) {
          minSize = comment_count
        }
        if ( comment_count > maxSize ) {
          maxSize = comment_count
        }
      }
    }

    return [ minY, maxY, minY, maxY, minSize, maxSize ];
  }

  scaleToBoundaries () {
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
      this.hierarchyMap.set( this.data.data.node_id, this.data );
      this.indexHierachy( this.data.children );
      return;
    }
    
    if ( children[0]?.data?.subreddit != null ) {
      for ( const child of children ) {
        this.hierarchyMap.set( child.data.subreddit, child );
      }
    } else {
      for ( const child of children ) {
        this.hierarchyMap.set( child.data.node_id, child );
        if ( child.children != null ) {
          this.indexHierachy( child.children );
        }
      }
    }
  }

  loadData ( data ) {
    this.data = data
    console.log( "bubblemap data", this.data );
    this.indexHierachy();

    this.boundaries = this.data.boundaries;
    this.subroot = this.data;
    this.view = new Set( this.data.descendants() );
    this.subview = this.view;
    this.labels = h.pluckLabels( this.subroot );
  }

  setStyleDefaults () {
    this.context.strokeStyle = "#000";
    this.context.font = "24px Roboto";
    this.context.fontKerning = "normal";
  }

  clearCanvas () {
    this.context.clearRect( 0, 0, this.width, this.height );
  }

  drawInertNode ( node ) {
    const x = this.scaleX( node.data.tsne_x );
    const y = this.scaleY( node.data.tsne_y );
    const r = this.scaleSize( node.data.comment_count );
    
    this.context.beginPath();
    this.context.arc( x, y, r, 0, twoPiRadians );
    this.context.closePath();
    this.context.fill();    
  }

  drawInertView () {
    this.context.fillStyle = "#80808040";
    for ( const node of this.view ) {
      if ( !this.subview.has( node ) && (node.data.subreddit != null) ) {
        this.drawInertNode( node );
      }
    }
  }

  getNearestLabel ( node ) {
    let parent = this.hierarchyMap.get( node.parent.data.node_id );
    for ( const label of this.labels ) {
      if ( parent === label ) {
        return parent;
      }
    }
    return this.getNearestLabel( parent );
  }

  drawBranch ( node ) {
    const x = this.scaleX( node.data.tsne_x );
    const y = this.scaleY( node.data.tsne_y );
    
    this.context.beginPath();
    this.context.moveTo( x, y );
    
    const parent = this.getNearestLabel( node );
    const px = this.scaleX( parent.data.tsne_x );
    const py = this.scaleY( parent.data.tsne_y );
    
    this.context.lineTo( px, py );
    this.context.lineWidth = 1;
    this.context.stroke();
  }

  drawBranches () {
    if ( this.subroot !== this.data ) {
      for ( const node of this.subview ) {
        if ( node.data.subreddit != null ) {
          this.drawBranch( node );
        }
      }
    }
  }

  drawQuarterNode ( node ) {
    const x = this.scaleX( node.data.tsne_x );
    const y = this.scaleY( node.data.tsne_y );
    const r = this.scaleSize( node.data.comment_count );
    
    this.context.beginPath();
    this.context.arc( x, y, r, 0, twoPiRadians );
    this.context.closePath();
    this.context.fillStyle = node.data.colorQuarter;
    this.context.fill();
  }

  drawFullNode ( node ) {
    const x = this.scaleX( node.data.tsne_x );
    const y = this.scaleY( node.data.tsne_y );
    const r = this.scaleSize( node.data.comment_count );
    
    this.context.beginPath();
    this.context.arc( x, y, r, 0, twoPiRadians );
    this.context.closePath();
    this.context.fillStyle = node.data.color;
    this.context.fill();
    this.context.lineWidth = this.bubbleBorder;
    this.context.stroke();
  }

  drawSubview () {
    if ( this.subroot === this.data ) {
      for ( const node of this.subview ) {
        if ( node.data.subreddit != null ) {
          this.drawQuarterNode( node );
        }
      }
    } else {
      for ( const node of this.subview ) {
        if ( node.data.subreddit != null ) {
          this.drawFullNode( node );
        }
      }
    }
  }

  drawLabel ( label ) {
    const x = this.scaleX( label.data.tsne_x );
    const y = this.scaleY( label.data.tsne_y );
    const text = label.data.displayLabel;

    const metrics = this.context.measureText( text );
    const textX = x - metrics.width / 2;
    const textY = y + this.labelBoxPadding;
    const boxX = textX - this.labelBoxPadding;
    const boxY = y - this.labelBoxHeightHalf;
    const boxWidth = metrics.width + this.labelBoxPaddingDouble;

    this.context.fillStyle = "#FFFFFFC0";
    this.context.fillRect( boxX, boxY, boxWidth, this.labelBoxHeight );
    this.context.strokeRect( boxX, boxY, boxWidth, this.labelBoxHeight );
    this.context.fillStyle = "#000000";
    this.context.fillText( text, textX, textY );
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
    this.drawInertView();
    this.drawBranches();
    this.drawSubview();
    this.drawLabels();
  }

  // Updates when we drill down into a treemap category.
  updateView ({ subrootID }) {
    this.subroot = this.hierarchyMap.get( subrootID );
    this.subview = new Set( this.subroot.descendants() );
    this.labels = h.pluckLabels( this.subroot );
    this.render();
  }

  // Updates when we look at another month of data.
  updateData ( data ) {
    console.log( "New Month" );

    // Reset to top-level view of current data to start animation to another month.
    this.updateView({ subrootID: this.data.data.node_id });

    const newView = new Set ( data.descendants() );
    const newBoundaries = data.boundaries;
    const dBoundaries = [];
    for ( let i = 0; i < this.boundaries.length; i++ ) {
      dBoundaries.push( newBoundaries[i] - this.boundaries[i] );
    }
    
    const diffMap = new Map();
    for ( const newNode of newView ) {
      const subreddit = newNode.data.subreddit;
      const oldNode = this.hierarchyMap.get( subreddit );
      if ( oldNode != null ) {
        const dx = newNode.data.tsne_x - oldNode.data.tsne_x;
        const dy = newNode.data.tsne_y - oldNode.data.tsne_y;
        const dSize = newNode.data.comment_count - oldNode.data.comment_count;
        diffMap.set( subreddit, { oldNode, newNode, dx, dy, dSize });
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
        for ( const [ subreddit, { oldNode, newNode, dx, dy, dSize } ] of diffMap.entries() ) {
          this.drawQuarterNode({
            data: {
              tsne_x: oldNode.data.tsne_x + ( ratio * dx ),
              tsne_y: oldNode.data.tsne_y + ( ratio * dy ),
              comment_count: oldNode.data.comment_count + ( ratio * dSize ),
              colorQuarter: oldNode.data.colorQuarter
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