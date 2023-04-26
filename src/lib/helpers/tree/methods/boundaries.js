const getBoundaries = function ( view ) {
  let minX, maxX, minY, maxY, minSize, maxSize;

  for ( const node of view ) {
    if ( node.data.tsne_x != null ) {
      minX = node.data.tsne_x;
      maxX = node.data.tsne_x;
      minY = node.data.tsne_y;
      maxY = node.data.tsne_y;
      break;
    }
  }

  for ( const node of view ) {
    if ( node.data.comment_count != null ) {
      minSize = node.data.comment_count;
      maxSize = node.data.comment_count;
      break;
    }
  }    
 
  for ( const node of view ) {
    const { tsne_x, tsne_y, comment_count } = node.data;

    if ( tsne_x != null ) {
      if ( tsne_x < minX ) {
        minX = tsne_x;
      }
      if ( tsne_x > maxX ) {
        maxX = tsne_x;
      }
      if ( tsne_y < minY ) {
        minY = tsne_y;
      }
      if ( tsne_y > maxY ) {
        maxY = tsne_y;
      }
    }
  
    if ( comment_count != null ) {
      if ( comment_count < minSize ) {
        minSize = comment_count
      }
      if ( comment_count > maxSize ) {
        maxSize = comment_count
      }
    }
  }

  return [ minY, maxY, minY, maxY, minSize, maxSize ];
};

export { getBoundaries }