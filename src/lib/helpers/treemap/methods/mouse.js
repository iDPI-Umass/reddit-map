import { openResultsStore } from "../../../stores/open-results";
import { get } from "svelte/store";

const handleMouseDown = function ( event ) {
  if ( !get( openResultsStore ) ) {
    const node = this.findNode( event );
    if ( node == null ) {
      console.warn( "Click event had no matching node" );
      return;
    }

    if ( node.data.subreddit != null ) {
      this.openTab( node.data.subreddit );
    } else {
      this.zoomIn( node );
    }
  }
};


const handleHover = function ( event ) {
  this.hoverX = event.offsetX;
  this.hoverY = event.offsetY;
};

const handleHoverEnter = function ( event ) {
  const currentX = event.offsetX;
  const currentY = event.offsetY;
  const node = this.findNode({
    offsetX: currentX,
    offsetY: currentY
  });

  const detail = { currentX, currentY, node };
  const custom = new CustomEvent( "hoverenter", { detail });
  this.element.dispatchEvent( custom );
  this.hoverActive = true;
};

const handleHoverLeave = function () {
  const detail = {};
  const event = new CustomEvent( "hoverleave", { detail });
  this.element.dispatchEvent( event );
  this.hoverActive = false;
};

const startHoverLoop = function () {
  console.log
  let currentX = this.hoverX;
  let currentY = this.hoverY;
  let currentNode = null;

  const changeDetected = () => {
    return (this.hoverX !== currentX) || 
      (this.hoverY !== currentY);
  };

  const update = function () {
    if ( changeDetected() ) {
      currentX = this.hoverX;
      currentY = this.hoverY;

      const node = this.findNode({
        offsetX: this.hoverX,
        offsetY: this.hoverY
      });

      const detail = { node, currentX, currentY };

      if ( node !== currentNode ) {
        currentNode = node;
        const event = new CustomEvent( "hovernode", { detail });
        this.element.dispatchEvent( event );
      }
      
      if ( this.hoverActive === true ) {
        const event = new CustomEvent( "hovermove", { detail });
        this.element.dispatchEvent( event );
      }
    }
    
    this.hoverLoopID = window.requestAnimationFrame( update.bind(this) );
  };
  
  this.hoverLoopID = window.requestAnimationFrame( update.bind(this) );
};

const stopHoverLoop = function () {
  window.cancelAnimationFrame( this.hoverLoopID );
};

export {
  handleMouseDown,
  handleHover,
  handleHoverEnter,
  handleHoverLeave,
  startHoverLoop,
  stopHoverLoop
}