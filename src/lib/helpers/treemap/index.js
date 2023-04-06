import * as d3 from 'd3';
import { Library } from '@observablehq/stdlib';

const library = new Library();

// This module forms a closure over which these varaibles need to remain in scope. 
let width, height, x, y, svg, group, root;


const tile = function ( node, x0, y0, x1, y1 ) {
  d3.treemapBinary( node, 0, 0, width, height );
  for ( const child of node.children ) {
      child.x0 = x0 + child.x0 / width * (x1 - x0);
      child.x1 = x0 + child.x1 / width * (x1 - x0);
      child.y0 = y0 + child.y0 / height * (y1 - y0);
      child.y1 = y0 + child.y1 / height * (y1 - y0);
  }
}

const treemap = data => d3.treemap()
  .tile(tile)
  (d3.hierarchy(data)
  .sum(d => Math.sqrt(d.comment_count))
  .sort((a, b) => Math.sqrt(b.comment_count) - Math.sqrt(a.comment_count)));


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



const _render = function ( group, _root ) {
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



const render = function ( data ) {
  const treemap_data = treemap( data );
  group = svg.append("g")
    .call(_render, treemap_data);
};


const prepare = function ( _svg, frame ) {
  width = frame.clientWidth;
  height = frame.clientHeight;

  x = d3.scaleLinear().rangeRound([ 0, width ]);
  y = d3.scaleLinear().rangeRound([ 0, height ]);

  svg = d3.select(_svg)
    .attr("viewBox", [0.5, -30.5, width , height + 30])
    .style("font", "10px sans-serif")
    .style("float", "left")
    .style("display", "inline-block")

  svg.selectAll("g")
    .remove();
};


export {
  prepare,
  render
}