import * as d3 from "d3";
const colorMap = new Map();


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

// From https://gist.github.com/krabs-github/ec56e4f1c12cddf86ae9c551aa9d9e04
const isLight = function ( hex ) {

  let color = +("0x" + hex.slice(1).replace( 
    hex.length < 5 && /./g, '$&$&'
  ));

  const r = color >> 16;
  const g = color >> 8 & 255;
  const b = color & 255;
 
  // HSP equation from http://alienryderflex.com/hsp.html
  const hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
  );

  // Using the HSP value, determine whether the color is light or dark
  return hsp > 127.5;
};

const chooseFontColor = function ( hex ) {
  let result = colorMap.get( hex );
  if ( result == null ) {
    result = isLight( hex );
    colorMap.set( hex, result );
  }

  if ( result ) {
    return "#000000";
  } else {
    return "#FFFFFF";
  }
}

export {
  tile,
  isLight,
  chooseFontColor
}