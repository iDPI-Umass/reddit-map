import * as d3 from "d3";

const size = function ( frame ) {
  this.resolutionScale = 2;
  this.parentHeight = 30 * this.resolutionScale;
  this.width = frame.clientWidth * this.resolutionScale;
  this.height = frame.clientHeight * this.resolutionScale;
  this.lineWidth = 2 * this.resolutionScale;

  this.resetScale();

  this.d3Canvas
    .attr( "width", this.width )
    .attr( "height", this.height );
};

const resetScale = function () {
  this.scaleX = d3.scaleLinear()
    .domain([ 0, 1 ])  
    .rangeRound([ 0, this.width ]);
  
  this.scaleY = d3.scaleLinear()
    .domain([ 0, 1 ])
    .rangeRound([ this.parentHeight, this.height ]);
};

const setScale = function ( domain, range ) {
  this.scaleX = d3.scaleLinear()
    .domain([ domain.x0, domain.x1 ])
    .rangeRound([ range.x0, range.x1 ]);
  
  this.scaleY = d3.scaleLinear()
    .domain([ domain.y0, domain.y1 ])
    .rangeRound([ range.y0, range.y1 ]);
};

export {
  size,
  resetScale,
  setScale
}