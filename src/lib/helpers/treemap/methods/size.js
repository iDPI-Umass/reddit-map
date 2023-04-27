import * as d3 from "d3";
import * as h from "../helpers.js";


const size = function ({ width, height }) {
  this.resolutionScale = 2;
  this.width = width * this.resolutionScale;
  this.height = height * this.resolutionScale;
  this.lineWidth = 2 * this.resolutionScale;

  const tile = h.tile( this.width, this.height );
  d3.treemap().tile( tile )( this.data );

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

const resetScale = function () {
  const domain = { 
    x0: 0,
    x1: 1,
    y0: 0,
    y1: 1
  };

  const range = {
    x0: 0,
    x1: this.width,
    y0: 0,
    y1: this.height
  };
  
  this.setScale( domain, range );
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
  resetScale,
  setScale,
  setScaleRange
}