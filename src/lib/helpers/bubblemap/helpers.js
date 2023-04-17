import * as d3 from "d3";

const pluckLabels = function ( nodes ) {
  const labels = [];
  for ( const node of nodes ) {
    labels.push({
      text: node.data.displayLabel,
      x: node.data.tsne_x,
      y: node.data.tsne_y
    });
  }
  return labels;
};

export {
  pluckLabels
}