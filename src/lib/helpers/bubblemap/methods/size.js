import * as d3 from "d3";

const size = function ({ width, height }) {
  this.resolutionScale = 2;
  
  this.width = width * this.resolutionScale;
  this.height = height * this.resolutionScale;
  
  this.bubbleSize = 5 * this.resolutionScale;
  this.bubbleBorder = Math.round( 0.5 * this.resolutionScale);
  this.padding = this.bubbleSize * 2; // 2 for double radius and either side of width/height
  
  this.fontSize = Math.round( 16 * this.resolutionScale );
  this.lineHeight = Math.round( this.fontSize * 1 );
  this.lineHeightHalf = this.lineHeight / 2;
  this.labelBoxPadding = Math.round( this.fontSize / 3 );
  this.labelBoxPaddingDouble = 2 * this.labelBoxPadding;
  this.labelBoxHeight = this.lineHeight + ( 2 * this.labelBoxPadding );
  this.labelBoxHeightHalf = this.labelBoxHeight / 2;

  this.d3Canvas
    .attr( "width", this.width )
    .attr( "height", this.height );
};

const setScale = function ( domain, range ) {
  this.currentDomain = domain;
  this.currentRange = range;

  this.scaleX = d3.scaleLinear()
    .domain([ domain.x0, domain.x1 ])
    .rangeRound([ range.x0, range.x1 ]);
  
  this.scaleY = d3.scaleLinear()
    .domain([ domain.y0, domain.y1 ])
    .rangeRound([ range.y0, range.y1 ]);
};

const scaleToBoundaries = function () {
  const [ x0, x1, y0, y1 ] = this.boundaries;
  
  this.setScale( { x0, x1, y0, y1 }, { 
    x0: this.padding,
    x1: this.width - this.padding,
    y0: this.padding,
    y1: this.height - this.padding
  });
};

const setScaleRange = function ( range ) {
  const domain = this.currentDomain;
  this.currentRange = range;

  this.scaleX = d3.scaleLinear()
    .domain([ domain.x0, domain.x1 ])
    .rangeRound([ range.x0, range.x1 ]);

  this.scaleY = d3.scaleLinear()
    .domain([ domain.y0, domain.y1 ])
    .rangeRound([ range.y0, range.y1 ]);
};

export { 
  size,
  setScale, 
  scaleToBoundaries,
  setScaleRange
}