import * as d3 from "d3";

const hasLeaves = function ( subroot ) {
  return subroot.children?.[0].children == null;
};

const pluckLabels = function ( subroot ) {
  let nodes;
  
  // Leaves are terminal nodes in the hierarchy.
  // If we're only one step above leaves, we should only display the parent. 
  if ( hasLeaves( subroot ) ) {
    nodes = [ subroot ];
  } else {
    nodes = subroot.children;
  }

  const labels = [];
  for ( const node of nodes ) {
    labels.push( node );
  }
  return labels;
};

export {
  pluckLabels
}