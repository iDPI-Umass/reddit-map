import * as h from "../../helpers.js";

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
  this.context.lineWidth = this.bubbleBorder;
  this.context.stroke();
};

const drawInertNodes = function () {
  this.context.fillStyle = "#80808040";
  for ( const node of this.view ) {
    if ( !this.subview.has( node ) && (node.data.subreddit != null) ) {
      this.drawInertNode( node );
    }
  }
};

const drawSubviewNodes = function () {
  if ( this.isTopLevel === true ) {
    for ( const node of this.subview ) {
      if ( node.data.subreddit != null ) {
        const label = this.getNearestLabel( node );
        this.drawQuarterNode( label, node );
      }
    }
  } else {
    for ( const node of this.subview ) {
      if ( node.data.subreddit != null ) {
        const label = this.getNearestLabel( node );
        this.drawFullNode( label, node );
      }
    }
  }
};

const  drawNeighborNodes = function () {
  for ( const neighbor of this.neighbors ) {
    for ( const node of neighbor.descendants() ) {
      this.drawFullNode( neighbor, node );
    }
  }
};

export {
  drawInertNode,
  drawQuarterNode,
  drawFullNode,
  drawInertNodes,
  drawSubviewNodes,
  drawNeighborNodes
}