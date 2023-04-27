import * as d3 from "d3";
import * as Meta from "@dashkite/joy/metaclass";
import * as methods from "./methods";


class BubblemapEngine {
  constructor () {}

  static create ({ canvas }) {
    const self = Object.assign( new BubblemapEngine(), {
      element: canvas,
      context: canvas.getContext( "2d" ),
      d3Canvas: d3.select( canvas )
    });
    self.wireEvents();
    return self;
  }
}

Meta.mixin( BubblemapEngine.prototype, [
  Meta.methods( methods )
]);


export default BubblemapEngine