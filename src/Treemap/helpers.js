import * as d3 from "d3";


const Helpers = function ({ width, height }) {
  
  const h = {};

  h.width = width;
  h.height = height;
  h.x = d3.scaleLinear().rangeRound([ 0, width ]);
  h.y = d3.scaleLinear().rangeRound([ 0, height ]);

  h.tile = function ( node, x0, y0, x1, y1 ) {
    d3.treemapBinary( node, 0, 0, width, height );
    
    for ( const child of node.children ) {
      child.x0 = x0 + child.x0 / width * ( x1 - x0 );
      child.x1 = x0 + child.x1 / width * ( x1 - x0 );
      child.y0 = y0 + child.y0 / height * ( y1 - y0 );
      child.y1 = y0 + child.y1 / height * ( y1 - y0 );
    }
  };  
  
  h.treemap = function ( data ) {
    return d3.treemap()
      .tile( h.tile )
      (d3.hierarchy(data)
      .sum(d => Math.sqrt(d.subreddit_count))
      .sort((a, b) => Math.sqrt(b.subreddit_count) - Math.sqrt(a.subreddit_count)));
  };

  h.clean = function ( node ) {
    return node
      .selectAll( "g" )
      .remove();
  };

  h.style = function ( node ) {
    return node
      .attr( "x", 25 )
      .attr( "y", 50 )
      .attr( "height", height )
      .attr( "width", width )
      .attr( "viewBox", [ 0.5, -30.5, width , height + 30 ])
      .style( "font", "10px sans-serif" )
      .style( "float", "left" )
      .style( "display", "inline-block" );
  };
  
  
  return h;
};

export default Helpers