import * as h from "../../helpers.js";
import { get } from 'svelte/store'
import { filterStore } from "$lib/stores/filter.js";

const drawInertNode = function ( node ) {
  const x = this.scaleX( node.data.tsne_x );
  const y = this.scaleY( node.data.tsne_y );
  const r = this.bubbleSize;
  
  this.context.beginPath();
  this.context.arc( x, y, r, 0, h.twoPiRadians );
  this.context.closePath();
  this.context.fill();    
};

const drawQuarterNode = function ( label, node ) {
  const x = this.scaleX( node.data.tsne_x );
  const y = this.scaleY( node.data.tsne_y );
  const r = this.bubbleSize;
  
  this.context.beginPath();
  this.context.arc( x, y, r, 0, h.twoPiRadians );
  this.context.closePath();
  this.context.fillStyle = label.data.colorQuarter;
  this.context.fill();
};

const drawFullNode = function ( label, node ) {
  const x = this.scaleX( node.data.tsne_x );
  const y = this.scaleY( node.data.tsne_y );
  const r = this.bubbleSize;
  
  this.context.beginPath();
  this.context.arc( x, y, r, 0, h.twoPiRadians );
  this.context.closePath();
  this.context.fillStyle = label.data.color;
  this.context.fill();
};

const drawOutlinedNode = function ( label, node ) {
  const x = this.scaleX( node.data.tsne_x );
  const y = this.scaleY( node.data.tsne_y );
  const r = this.bubbleSize;
  
  this.context.beginPath();
  this.context.arc( x, y, r, 0, h.twoPiRadians );
  this.context.closePath();
  this.context.fillStyle = label.data.color;
  this.context.fill();
  this.context.lineWidth = this.bubbleBorder;
  this.context.stroke();
};

const drawInertNodes = function () {
  const filter = get(filterStore);
  this.context.fillStyle = "#80808040";
  if ( this.view === this.subview ) {
    return;
  }

  for ( const node of this.view ) {
    if ( !this.subview.has( node ) && ( !filter || !( filter.key in node.data ) || node.data[filter.key] != filter.value ) ) {
      this.drawInertNode( node );
    }
  }
};

const drawSubviewNodes = function () {
  const filter = get(filterStore);
  if ( this.isTopLevel === true ) {
    for ( const node of this.subview ) {
      if ( node.data.subreddit != null && ( !filter || !( filter.key in node.data ) || node.data[filter.key] != filter.value ) ) {
        const label = this.getNearestLabel( node );
        this.drawQuarterNode( label, node );
      }
    }

  } else if ( this.subroot.children?.[0]?.data.subreddit == null ) {
    for ( const node of this.subview ) {
      if ( ( !filter || !( filter.key in node.data ) || node.data[filter.key] != filter.value ) ) {
        const label = this.getNearestLabel( node );
        this.drawQuarterNode( label, node );
      }
    }

  } else {
    for ( const node of this.subview ) {
      if ( !filter || !( filter.key in node.data ) || node.data[filter.key] != filter.value ) { 
        const label = this.getNearestLabel( node );
        this.drawOutlinedNode( label, node );
      }
    }
  }
};

const  drawNeighborNodes = function () {
  const filter = get(filterStore);
  for ( const neighbor of this.neighbors ) {
    for ( const node of neighbor.descendants() ) {
      if ( !filter || !( filter.key in node.data ) || node.data[filter.key] != filter.value ) { 
        this.drawOutlinedNode( neighbor, node );
      }
    }
  }
};

export {
  drawInertNode,
  drawQuarterNode,
  drawFullNode,
  drawOutlinedNode,
  drawInertNodes,
  drawSubviewNodes,
  drawNeighborNodes
}