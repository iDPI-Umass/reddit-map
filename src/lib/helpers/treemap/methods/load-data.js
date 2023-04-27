import * as d3 from "d3";
import * as h from "../helpers.js";

const loadData = function ( data ) {
  const tile = h.tile( this.width, this.height );
  const sortedData = data
    .sum( d => Math.sqrt( d.comment_count ))
    .sort( function ( a, b ) {
      return Math.sqrt(b.comment_count) - Math.sqrt(a.comment_count);
    });

  this.data = d3.treemap().tile( tile )( sortedData );
  console.log( "treemap data", this.data );
  this.data.data.color = "#FFFFFF";
  this.data.data.taxonomy_label = "All of Reddit";
  this.parent = this.data;
  this.view = this.data.children;
};

export {
  loadData
}