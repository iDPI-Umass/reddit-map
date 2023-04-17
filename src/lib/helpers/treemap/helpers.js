import * as d3 from "d3";

const tile = function ( width, height ) {
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

export {
  tile
}