import * as d3 from "d3";
import { animate, cubicBezier } from "popmotion";

const ease = cubicBezier( 0.42, 0.0, 0.58, 1.0 );

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

const drawWrappedText = function ( text, x, y, width ) {  
  const words = text.split(" ");
  let line = "";

  for ( let i = 0; i < words.length; i++ ) {
    const word = words[i];
    const draftLine = line  + word + " ";
    const metrics = this.context.measureText( draftLine );
    
    // Draw the line if we're out of width, otherwise keep tallying.
    if (( i > 0 ) && ( metrics.width > width )) {
      this.context.fillText( line, x, y );
      line = word + " ";
      y += this.lineHeight;
    } else {
      line = draftLine;
    }
  }

  // Followup with outstanding text.
  this.context.fillText( line, x, y );
}


const setupClip = function ( x0, x1, y0, y1 ) {
  const width = x1 - x0;
  const height = y1 - y0;

  this.context.save();
  this.context.beginPath();
  this.context.rect( x0, y0, width, height );
  this.context.clip();
};

const teardownClip = function () {
  this.context.restore();
}




export {
  animate,
  ease,
  tile,
  drawWrappedText,
  setupClip,
  teardownClip
}