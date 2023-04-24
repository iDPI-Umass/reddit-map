import * as d3 from "d3";
import * as Meta from "@dashkite/joy/metaclass";
import * as h from "./helpers.js";
import * as methods from "./methods";


class TreemapEngine {
  constructor () {}

  static create ({ canvas, onViewUpdate }) {
    const self = Object.assign( new TreemapEngine(), {
      element: canvas,
      context: canvas.getContext( "2d" ),
      d3Canvas: d3.select( canvas ),
      onViewUpdate: onViewUpdate
    });

    self.wireEvents();
    return self;
  }
}

Meta.mixin( TreemapEngine.prototype, [
  Meta.methods( methods )
]);


export default TreemapEngine