import * as d3 from "d3";

const size = function ( frame ) {
  this.resolutionScale = 2;
  this.width = frame.clientWidth * this.resolutionScale;
  this.height = frame.clientHeight * this.resolutionScale;
  this.bubbleSize = 5 * this.resolutionScale;
  this.padding = this.bubbleSize * 2; // 2 for double radius and either side of width/height
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
};

const setScale = function ( domain, range ) {
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

export { size, setScale, scaleToBoundaries }