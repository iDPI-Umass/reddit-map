import * as d3 from "d3";
import { animate, easeInOut } from "popmotion";
import { Library } from "@observablehq/stdlib";

const library = new Library();


const _tile = function ( width, height ) {
  return function ( node, x0, y0, x1, y1 ) {
    d3.treemapBinary( node, 0, 0, width, height );
    for ( const child of node.children ) {
      child.x0 = x0 + child.x0 / width * (x1 - x0);
      child.x1 = x0 + child.x1 / width * (x1 - x0);
      child.y0 = y0 + child.y0 / height * (y1 - y0);
      child.y1 = y0 + child.y1 / height * (y1 - y0);
    }
  };
};


class TreemapEngine {
  constructor () {}

  static create ({ canvas }) {
    return Object.assign( new TreemapEngine(), {
      element: canvas,
      context: canvas.getContext( "2d" ),
      d3Canvas: d3.select( canvas )
    });
  }

  size ( frame ) {
    this.parentHeight = 30;
    this.width = frame.clientWidth;
    this.height = frame.clientHeight;
  
    this.scaleX = d3.scaleLinear().rangeRound([ 0, this.width ]);
    this.scaleY = d3.scaleLinear().rangeRound([ 0, this.height - this.parentHeight ]);
  
    this.d3Canvas
      .attr( "width", this.width )
      .attr( "height", this.height );

    // TODO: Should this go somewhere else?
    this.wireEvents();
  }

  resetScale () {
    this.scaleX = d3.scaleLinear().rangeRound([ 0, this.width ]);
    this.scaleY = d3.scaleLinear().rangeRound([ 0, this.height - this.parentHeight ]);
  }

  wireEvents () {
    if ( this.isWired !== true ) {
      this.element.addEventListener( "click", this.zoom.bind(this) );
      this.isWired = true;
    }
  }

  tagLeaves ( children ) {
    for ( const child of children ) {
      child.data.leafUid = library.DOM.uid("leaf").id;

      if ( child.children != null ) {
        this.tagLeaves( child.children );
      }
    }
  }

  loadData ( data ) {
    const tile = _tile( this.width, this.height );
    const sortedData = d3.hierarchy( data )
      .sum( d => Math.sqrt( d.comment_count ))
      .sort( function ( a, b ) {
        return Math.sqrt(b.comment_count) - Math.sqrt(a.comment_count);
      });

    this.data = d3.treemap().tile( tile )( sortedData );
    this.tagLeaves( this.data.children );
    console.log( "data", this.data );
    this.parent = null;
    this.view = this.data.children;
  }

  clearCanvas () {
    this.context.clearRect( 0, 0, this.width, this.height );
  }

  drawParent () {
    const border = "#FFFFFF";
    const fill = `${ this.parent?.data.color ?? "#FFFFFF" }80`;

    const x0 = 0;
    const x1 = this.scaleX( 1 );
    const y0 = 0;
    const y1 = this.parentHeight;

    this.context.fillStyle = fill;
    this.context.fillRect( x0, y0, x1, y1 );

    this.context.lineWidth = "1px";
    this.context.strokeStyle = border;
    this.context.strokeRect( x0, y0, x1, y1 );
  }

  drawLeaf ( leaf ) {
    const border = "#FFFFFF";
    let fill = `${ leaf.data.color ?? "#FFFFFF" }80`;

    const x0 = this.scaleX( leaf.x0 );
    const x1 = this.scaleX( leaf.x1 );
    const y0 = this.scaleY( leaf.y0 ) + this.parentHeight;
    const y1 = this.scaleY( leaf.y1 ) + this.parentHeight;

    this.context.fillStyle = fill;
    this.context.fillRect( x0, y0, (x1 - x0), (y1 - y0) );

    this.context.lineWidth = "1px";
    this.context.strokeStyle = border;
    this.context.strokeRect( x0, y0, (x1 - x0), (y1 - y0) );
  }

  drawLeaves () {
    for ( const leaf of this.view ) {
      this.drawLeaf( leaf );
    }
  }

  render () {
    this.clearCanvas();
    this.drawParent();
    this.drawLeaves();
  }

  
  findNode ( event ) {
    if ( event.offsetY <= this.parentHeight ) {
      return { 
        isParent: true,
        node: this.parent
      };
    }

    const x = event.offsetX / this.width;
    const y = ( event.offsetY - this.parentHeight ) / this.height;

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
    console.log( "Zoom In" );
    if ( node.children == null ) {
      console.log( "no children" );
      return;
    }
    
    const start = {
      x0: this.scaleX( node.x0 ),
      x1: this.scaleX( node.x1 ),
      y0: this.scaleY( node.y0 ) + this.parentHeight,
      y1: this.scaleY( node.y1 ) + this.parentHeight
    };

    const end = {
      x0: 0,
      x1: this.width,
      y0: this.parentHeight,
      y1: this.height + this.parentHeight
    };

    const dx0 = end.x0 - start.x0;
    const dx1 = end.x1 - start.x1;
    const dy0 = end.y0 - start.y0;
    const dy1 = end.y1 - start.y1;

    animate({
      from: 0,
      to: 1,
      duration: 750,
      ease: easeInOut,
      onUpdate: ratio => {
        const x0 = start.x0 + ( ratio * dx0 );
        const x1 = start.x1 + ( ratio * dx1 );
        const y0 = start.y0 + ( ratio * dy0 );
        const y1 = start.y1 + ( ratio * dy1 );

        const width = x1 - x0;
        const height = y1 - y0;

        this.context.clearRect( x0, y0, width, height )
        this.context.lineWidth = "1px";
        this.context.strokeStyle = "#FFFFFF";
        this.context.strokeRect( x0, y0, width, height );

        const scaleX = d3.scaleLinear()
          .domain([ node.x0, node.x1 ])
          .rangeRound([ x0, x1 ]);
        const scaleY = d3.scaleLinear()
          .domain([ node.y0, node.y1 ])
          .rangeRound([ y0, y1 ]);

        for ( const leaf of node.children ) {
          const fill = `${ leaf.data.color ?? "#FFFFFF" }80`;
  
          const x0 = scaleX( leaf.x0 );
          const x1 = scaleX( leaf.x1 );
          const y0 = scaleY( leaf.y0 );
          const y1 = scaleY( leaf.y1 );

          const width = x1 - x0;
          const height = y1 - y0;
        
          this.context.fillStyle = fill;
          this.context.fillRect( x0, y0, width, height );
        
          this.context.lineWidth = "1px";
          this.context.strokeStyle = `rgba(255,255,255,${ ratio })`;
          this.context.strokeRect( x0, y0, width, height );
        }
        
      }
    });

  }

  zoomOut ( event, node ) {
    console.log( "Zoom Out TBD" );
  }
}

// This module forms a closure over which these varaibles need to remain in scope. 
let width, height, x, y, svg, group, root;




const styleLeafCursor = function ( node ) {
  node.filter(d => d === root ? d.parent : d.children)
    .attr("cursor", "pointer")
    .on("click", (event, d) => {
      if (d === root) {
        zoomout( root );
      }
      else {
        zoomin( d );
      }
    });
}


const addTitle = function ( node ) {
  /* node.append("title")
    .text((d) => {
        if (d.data.node_id.includes("_")) {
            return `${node_id(d)}\n${format(d.data.comment_count)}`
        }
        return `${node_id(d)}\n${format(d.data.cluster_comment_count)}`
    }); */
}


const addLeaves = function ( node ) {
  node.append("rect")
    .attr("id", d => (d.leafUid = library.DOM.uid("leaf")).id)
    .attr("fill", (d) => {
      if (d.data.taxonomy_label.length === 0) {
          return "white"
      }
      return d.data.color
      /* if(d === root) {
        return "#fff"
      } 
      else {
        if (d.children) {
          return "#ccc"
        } 
        else {
          return "#ddd"
        }
      } */
    })
    .attr("opacity", 0.5)
    .attr("stroke", "#fff");

  node.append("clipPath")
    .attr("id", d => (d.clipUid = library.DOM.uid("clip")).id)
    .append("use")
    .attr("xlink:href", d => d.leafUid.href);
};


const labelLeaves = function ( node ) {
  node.append("text")
    .attr("id", d => "taxonomy_label_text_" + d.data.node_id )
    .attr("class", "taxonomy_label_text")
    .attr("clip-path", d => d.clipUid)
    .attr("font-weight", d => d === root ? "bold" : null)
    .selectAll("tspan")
    .data(d => (d.data.hasOwnProperty("children") ? d.data.taxonomy_label : d.data.subreddit).split(/(?=[A-Z][^A-Z])/g))
    .join("tspan")
    .attr("x", 3)
    .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
    //.attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
    .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
    .text(d => d)
};


const positionLeaves = function ( group, root ) {
  group.selectAll("g")
    .attr("transform", function ( d ) {
      if ( d === root ) {
        return `translate(0,-30)`;
      } else {
        return `translate(${ x(d.x0) },${ y(d.y0) })`;
      }
    })
    .select("rect")
    .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
    .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0));
};


// When zooming in, draw the new nodes on top, and fade them in.
const zoomin = function ( d ) {          
  const group0 = group.attr( "pointer-events", "none" );
  const group1 = group = svg.append("g").call( _render, d );

  x.domain([ d.x0, d.x1 ]);
  y.domain([ d.y0, d.y1 ]);

  svg.transition()
    .duration( 750 )
    .call( function ( t ) {
      return group0
        .transition( t )
        .remove()
        .call( positionLeaves, d.parent );
    })
    .call( function ( t ) {
      return group1
        .transition( t )
        .attrTween( "opacity", () => d3.interpolate(0, 1) )
        .call( positionLeaves, d );
    }); 
};


// When zooming out, draw the old nodes on top, and fade them out.
const zoomout = function ( d ) {
  const group0 = group.attr( "pointer-events", "none" );
  const group1 = group = svg.insert("g", "*").call( _render, d.parent );

  x.domain([ d.parent.x0, d.parent.x1 ]);
  y.domain([ d.parent.y0, d.parent.y1 ]);

  svg.transition()
    .duration(750)
    .call( function ( t ) {
      return group0
        .transition( t )
        .remove()
        .attrTween( "opacity", () => d3.interpolate(1, 0) )
        .call( positionLeaves, d );
    })
    .call( function ( t ) {
      return group1
        .transition( t )
        .call( positionLeaves, d.parent );
    });
};



const oldRender = function ( group, _root ) {
  root = _root;
  let data = root.children.concat( root );
  for ( const d of data ) {
    d.data[ "clicked" ] = false;
  }    

  const node = group
    .selectAll("g")
    .attr("class", "node_group")
    .data(data)
    .join("g");

  styleLeafCursor( node );
  addTitle( node );
  addLeaves( node );
  labelLeaves( node );
  group.call( positionLeaves, root );
}


export default TreemapEngine