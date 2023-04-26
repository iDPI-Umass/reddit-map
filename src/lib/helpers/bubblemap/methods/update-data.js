import * as h from "../helpers.js";

// Updates when we look at another month of data.
const updateData = function ( data ) {
  console.log( "New Month" );

  // Reset to top-level view of current data to start animation to another month.
  this.resetView();

  const newView = new Set ( data.descendants() );
  const newBoundaries = data.boundaries;
  const dBoundaries = [];
  for ( let i = 0; i < this.boundaries.length; i++ ) {
    dBoundaries.push( newBoundaries[i] - this.boundaries[i] );
  }
  
  const diffMap = new Map();
  for ( const newNode of newView ) {
    const subreddit = newNode.data.subreddit;
    const oldNode = this.hierarchyMap.get( subreddit );
    if ( oldNode != null ) {
      const dx = newNode.data.tsne_x - oldNode.data.tsne_x;
      const dy = newNode.data.tsne_y - oldNode.data.tsne_y;
      const dSize = newNode.data.comment_count - oldNode.data.comment_count;
      diffMap.set( subreddit, { oldNode, newNode, dx, dy, dSize });
    }
  }

  this.stopZoomLoop();

  h.animate({
    from: 0,
    to: 1,
    duration: 650,
    ease: h.ease,
    onUpdate: ratio => {
      this.clearCanvas();

      // Increment scale toward new boundaries.
      this.setScale({ 
        x0: this.boundaries[0] + ( ratio * dBoundaries[0] ),
        x1: this.boundaries[1] + ( ratio * dBoundaries[1] ),
        y0: this.boundaries[2] + ( ratio * dBoundaries[2] ),
        y1: this.boundaries[3] + ( ratio * dBoundaries[3] )
      },{ 
        x0: this.padding,
        x1: this.width - this.padding,
        y0: this.padding,
        y1: this.height - this.padding
      });
      

      // Animate this frame, but avoid mutating old or new data structures.
      for ( const [ subreddit, { oldNode, newNode, dx, dy, dSize } ] of diffMap.entries() ) {
        this.drawQuarterNode({
          data: {
            tsne_x: oldNode.data.tsne_x + ( ratio * dx ),
            tsne_y: oldNode.data.tsne_y + ( ratio * dy ),
            comment_count: oldNode.data.comment_count + ( ratio * dSize ),
            colorQuarter: oldNode.data.colorQuarter
          }
        });
      }

    },
    onComplete: () => {
      this.loadData( data );
      this.render();
      this.startZoomLoop();
    }
  });
};

export { updateData }