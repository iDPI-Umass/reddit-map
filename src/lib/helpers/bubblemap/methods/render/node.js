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

const drawQuarterNode = function ( node ) {
  const x = this.scaleX( node.data.tsne_x );
  const y = this.scaleY( node.data.tsne_y );
  const r = this.bubbleSize;
  
  this.context.beginPath();
  this.context.arc( x, y, r, 0, h.twoPiRadians );
  this.context.closePath();
  this.context.fillStyle = node.data.colorQuarter;
  this.context.fill();
};

const drawFullNode = function ( node ) {
  const x = this.scaleX( node.data.tsne_x );
  const y = this.scaleY( node.data.tsne_y );
  const r = this.bubbleSize;
  
  this.context.beginPath();
  this.context.arc( x, y, r, 0, h.twoPiRadians );
  this.context.closePath();
  this.context.fillStyle = node.data.color;
  this.context.fill();
  this.context.lineWidth = this.bubbleBorder;
  this.context.stroke();
};

const drawInertView = function () {
  this.context.fillStyle = "#80808040";
  for ( const node of this.view ) {
    if ( !this.subview.has( node ) && (node.data.subreddit != null) ) {
      this.drawInertNode( node );
    }
  }
};

const drawSubview = function () {
  if ( this.subroot === this.data ) {
    for ( const node of this.subview ) {
      if ( node.data.subreddit != null ) {
        this.drawQuarterNode( node );
      }
    }
  } else {
    for ( const node of this.subview ) {
      if ( node.data.subreddit != null ) {
        this.drawFullNode( node );
      }
    }
  }
};

export {
  drawInertNode,
  drawQuarterNode,
  drawFullNode,
  drawInertView,
  drawSubview
}