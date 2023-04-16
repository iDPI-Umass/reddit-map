import * as d3 from 'd3';
import { Library } from '@observablehq/stdlib';
import { zoomStore } from "$lib/stores/zoom.js";

const library = new Library();

// This module forms a closure over which these varaibles need to remain in scope. 
let width, height, svg, tooltip;
let prev_data;

const overTimeOptions = {"delete": 0, "add": 1, "transform": 2}
let stack_of_brushes = [];
let margin = 50;

let initial_brush;
let arr_of_boundaries;
let remapped_x, remapped_y;
let min_x, max_x, min_y, max_y;
let min_size, max_size;
let tsne_min_x, tsne_max_x, tsne_min_y, tsne_max_y;
let tsne_min_size, tsne_max_size;
const tsne_remapped = {};
let tsne_remapped_x, tsne_remapped_y, tsne_remapped_size;
let all_node_id_to_nodes = {};
let node_id_to_nodes = {};


let idleTimeout
const idled = function () {
  idleTimeout = null;
}


const setAllNodeIdToNodes = function ( node_id, subreddit, node_dict ) {
  if ( !(node_id in all_node_id_to_nodes) ) {
    all_node_id_to_nodes[node_id] = {}
  }
  all_node_id_to_nodes[node_id][subreddit] = node_dict
}




const updateChartBrush = function (e) {
  // If no selection, back to initial coordinate. Otherwise, update X axis domain
  if ( e == null ) {
    var prev_brush = stack_of_brushes.pop()
    stack_of_brushes.push(prev_brush)
    remapped_x.domain([ prev_brush["min_x"], prev_brush["max_x"] ])
    remapped_y.domain([ prev_brush["min_y"], prev_brush["max_y"] ])
    if (stack_of_brushes.length == 0) {
      stack_of_brushes.push(initial_brush)
    }

  } else if (!e.selection) {
    if (!idleTimeout && e != null) {
      return idleTimeout = setTimeout(idled, 350)
    };
    var prev_brush = stack_of_brushes.pop()
    if (stack_of_brushes.length >= 1) {
      prev_brush = stack_of_brushes.pop()
    }
    remapped_x.domain([ prev_brush["min_x"], prev_brush["max_x"] ])
    remapped_y.domain([ prev_brush["min_y"], prev_brush["max_y"] ])
    if (stack_of_brushes.length == 0) {
      stack_of_brushes.push(initial_brush)
    }

  } else {
    let new_brush = {
      "min_x": remapped_x.invert(e.selection[0][0]), 
      "max_x": remapped_x.invert(e.selection[1][0]), 
      "min_y": remapped_y.invert(e.selection[0][1]), 
      "max_y": remapped_y.invert(e.selection[1][1]),
      "e": e
    };
    stack_of_brushes.push(new_brush)
    remapped_x.domain([ new_brush["min_x"], new_brush["max_x"] ])
    remapped_y.domain([ new_brush["min_y"], new_brush["max_y"] ])
    // This remove the grey brush area as soon as the selection has been done 
    //svg.select(".brush").call(brush.move, null) // TODO decomment this to get brush functionality 
  }

  zoomStore.push( stack_of_brushes )

  // Update axis and circle position

  svg.selectAll( "circle" )
    .attr( "cx", d => remapped_x( d.x ) )
    .attr( "cy", d => remapped_y( d.y ) );

  svg.selectAll( ".label_text_class" )
    .attr( "dx", d => remapped_x( d.x ) )
    .attr( "dy", d => remapped_y( d.y ) );
};

const prepareTooltip = function () {
  tooltip = svg.append("g")
    .attr("class", "tooltip")
    .attr("id", "g_tooltip");
  
  svg.select("#g_tooltip")
    .append("rect")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .attr("id", "rect_tooltip")
    .attr("rx", 5)
    .attr("ry", 5)
    .style("fill", "white")
    .style("stroke", "black")
    .style("stroke-linejoin", "round");

  svg.select("#g_tooltip")
    .append("text")
    .attr("class", "tooltip")
    .attr("id", "text_tooltip")
    .attr("opacity", 0)
    .text("");
}

const prepareBrush = function () {
  // TODO: decomment this to get brush functionality
  /* var brush = d3.brush()                 // Add the brush feature using the d3.brush function
  .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
  .on("end", function (e) {
      updateChartBrush(e)

  }) */

  svg.append("g")
    .attr("class", "brush");
    //.call(brush); // TODO decomment this to get brush functionality

  svg.select(".brush")
    .append("g")
    .attr("class", "g_circle");
};
  


const isDirtyBrush = function ({ zoom_info }) {
  return ( zoom_info != null ) && ( zoom_info.length > 1 );
};


const updateChart = function (e) {
  // recover the new scale
  let newX = e.transform.rescaleX(remapped_x);
  let newY = e.transform.rescaleY(remapped_y);
  
  svg.selectAll("circle")
    .attr( "cx", d => newX( d.x ) )
    .attr( "cy", d => newY( d.y ) );

  svg.selectAll("text")
    .attr( "dx", d => newX( d.x ) )
    .attr( "dy", d => newY( d.y ) );
};



const append_data = function ( data, options ) {
  const root = d3.hierarchy( data );
  const {
    nodes: prev_nodes,
    arr_of_tsne_boundaries: prev_arr_of_tsne_boundaries,
    dict_of_subreddits_to_change
  } = options;


  svg.selectAll(".g_text_class")
    .remove();
  
  root.eachBefore( node => create_group( node, root, "g_text_class" ));
  
  const nodes = root.descendants();
  const leaves = root.leaves();
  const set_of_parents = new Set();
  for ( const leaf of leaves ) {
    set_of_parents.add( leaf.parent );
  }

  const arr_of_tsne_boundaries =  get_boundaries( nodes, "tsne_x" );

  const max_range_arr_of_tsne_boundaries = arr_of_tsne_boundaries;

  if (prev_arr_of_tsne_boundaries.length === arr_of_tsne_boundaries.length) {
      max_range_arr_of_tsne_boundaries[0] = Math.max(arr_of_tsne_boundaries[0], prev_arr_of_tsne_boundaries[0])
      max_range_arr_of_tsne_boundaries[1] = Math.max(arr_of_tsne_boundaries[1], prev_arr_of_tsne_boundaries[1])
      max_range_arr_of_tsne_boundaries[2] = Math.max(arr_of_tsne_boundaries[2], prev_arr_of_tsne_boundaries[2])
      max_range_arr_of_tsne_boundaries[3] = Math.max(arr_of_tsne_boundaries[3], prev_arr_of_tsne_boundaries[3])
  }
  
  tsne_min_x = max_range_arr_of_tsne_boundaries[0];
  tsne_max_x = max_range_arr_of_tsne_boundaries[1];
  tsne_min_y = max_range_arr_of_tsne_boundaries[2];
  tsne_max_y = max_range_arr_of_tsne_boundaries[3];
  tsne_min_size = max_range_arr_of_tsne_boundaries[4];
  tsne_max_size = max_range_arr_of_tsne_boundaries[5];
  margin = 50
  tsne_remapped_x = d3.scaleLinear()
    .domain([ tsne_min_x, tsne_max_x ])
    .range([ 0, width - margin ]);
  tsne_remapped_y = d3.scaleLinear()
    .domain([ tsne_min_y, tsne_max_y ])
    .range([ height - margin - 100, 0 ]);
  tsne_remapped_size = d3.scaleLinear()
    .domain([ tsne_min_size, tsne_max_size ])
    .range([ 5, 20 ]);
  

  for ( const key in dict_of_subreddits_to_change ) {
    const node = dict_of_subreddits_to_change[ key ][ "node" ];

    if (node.data.hasOwnProperty("tsne_x") && node.data.node_id.includes("_")) {
      const change = dict_of_subreddits_to_change[ key ][ "change" ];
      const parent = node.parent.data;
      render_nodes_treemap(
        tsne_remapped_x(node.data.tsne_x), 
        tsne_remapped_y(node.data.tsne_y), 
        5,
        node.data,
        change,
        parent
      );
    }
  }

  return [
    nodes,
    dict_of_subreddits_to_change, 
    arr_of_tsne_boundaries
  ];
};


const render_nodes_treemap = function (x, y, size, node, change, parent) {
  node["x"] = x;
  node["y"] = y;
  node["resized_subreddit_count"] = size;

  if ( change === overTimeOptions["add"] ) {
    const circle = svg.select(".g_circle")
      .append("circle")
      .attr("class", "circle_class" + " " + node.subreddit + " " +  "node_id_" + node.node_id + " " + "parent_" + parent.node_id)
      .attr("id", "circle_class_" + node.subreddit)
      .data([node])
      .attr("cx", x)
      .attr("cy", y)
      .attr("fill", "#808080")
      .attr("opacity", 0.25)
      .attr("r", size)
      .attr("stroke", "black")
      .style("stroke-width", 1)
      .style("stroke-opacity", 0)
          
      
    circle.on("mouseover", event => {
      tooltip.select("#text_tooltip")
        .style("opacity", 1)
        .attr("dx", (d3.pointer(event)[0]-25))
        .attr("dy", (d3.pointer(event)[1]-5))
        .text(node.subreddit)
      
      const boundingBox = tooltip.select("#text_tooltip").node().getBBox()
      
      tooltip.select("#rect_tooltip")
        .style("opacity", 1)
        .style("x", boundingBox.x - 2.5)
        .style("y", boundingBox.y - 2.5)
        .style("width", boundingBox.width + 5)
        .style("height", boundingBox.height + 5)
    })
    .on("mouseout", () => {
      tooltip.select("#rect_tooltip")
        .style("opacity", 0)
      tooltip.select("#text_tooltip")
        .style("opacity", 0)
    });
  }

  if ( change == overTimeOptions["transform"] ) {
    svg.select("#circle_class_" + node.subreddit)
      .classed("parent_" + parent.node_id, true)
      .transition()
      .duration(5000)
      .attr("cx", x)
      .attr("cy", y)
      .attr("fill", node.color)
      .attr("r", size)
  }

  if ( change == overTimeOptions["delete"] ) {
    svg.select("#circle_class_" + node.subreddit).remove()
  }
  
};


const renderLabels = function ( x, y, node ) {
  node["x"] = x;
  node["y"] = y;
  node["clicked"] = false;
  let format = d3.format(",");
  let g_text = svg.select("#g_text_class_" + node.data.node_id);
  
  
  g_text.selectAll(".circle_text_class")
    ._groups[0].forEach( d => {
      return svg.select("#circle_class_" + d.classList[2])
        .attr( "fill", d => d.color );
    });        
              
  if (svg.select("#label_text_class_" + node.data.node_id).empty()) {
      g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
          if (!(node.data.node_id in node_id_to_nodes)) {
              node_id_to_nodes[node.data.node_id] = {}
          }
          if (!(node.parent.data.node_id in node_id_to_nodes)) {
              node_id_to_nodes[node.parent.data.node_id] = {}
          }
          node_id_to_nodes[node.data.node_id][d.classList[2]] = {"selection": svg.select("#circle_class_" + d.classList[2]), "color": svg.select("#circle_class_" + d.classList[2]).attr("fill")}
          node_id_to_nodes[node.parent.data.node_id][d.classList[2]] = {"selection": svg.select("#circle_class_" + d.classList[2]), "color": svg.select("#circle_class_" + d.classList[2]).attr("fill")}
          //props.setNodeIdToNodes(node.node_id, svg.select("#circle_class_" + d.classList[2]))
          setAllNodeIdToNodes(node.data.node_id, d.classList[2], {"selection": svg.select("#circle_class_" + d.classList[2]), "color": svg.select("#circle_class_" + d.classList[2]).attr("fill")})
          setAllNodeIdToNodes(node.parent.data.node_id, d.classList[2], {"selection": svg.select("#circle_class_" + d.classList[2]), "color": svg.select("#circle_class_" + d.classList[2]).attr("fill")})
      });
      g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
          svg.select("#circle_class_" + d.classList[2])
          .attr('fill', (d) => {
              return d.color})
          .on("mouseover", (event, d) => {
                  tooltip.select("#text_tooltip")
                      .style("opacity", 1)
                      .attr("dx", (d3.pointer(event)[0]-25))
                      .attr("dy", (d3.pointer(event)[1]-5))
                      .text(d.subreddit + "\n" + node.data.taxonomy_label)
                  const boundingBox = tooltip.select("#text_tooltip").node().getBBox()
                  tooltip.select("#rect_tooltip")
                      .style("opacity", 1)
                      .style("x", boundingBox.x - 2.5)
                      .style("y", boundingBox.y - 2.5)
                      .style("width", boundingBox.width + 5)
                      .style("height", boundingBox.height + 5)
                  
              })
          
      })
      
      g_text.append("text")
          .attr("class", "label_text_class")
          .attr("id", "label_text_class_" + node.data.node_id)
          .data([node])
          .attr("dx", x)
          .attr("dy", y)
          .attr("fill", "black")
          .attr("stroke", "black")
          .style("stroke-width", .1)
          .text(() => {
              return node.data.taxonomy_label
          })
          .on("mouseover", (event) => {
              g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
                  svg.select("#circle_class_" + d.classList[2])
                  .attr('fill', () => {
                      return "yellow"});
                  
              });
              /* svg.selectAll(".parent_" + node.data.node_id)
              .attr('fill', () => {
                  return "yellow"}); */
          
             
   
          })
          .on("mousemove", (event) => {
              /* svg.selectAll(".parent_" + node.data.node_id)
              .attr('fill', () => {
                  return "yellow"}); */

              g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
                  svg.select("#circle_class_" + d.classList[2])
                  .attr('fill', () => {
                      return "yellow"});
                  
              });

          })
          .on("mouseout", (d) => {
              /* svg.selectAll(".parent_" + node.data.node_id)
              .attr('fill', () => {
                  return node.data.color}); */
              g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
                  svg.select("#circle_class_" + d.classList[2])
                  .attr('fill', (d) => {
                      return d.color});
                  
              });

          })
          .on("click", (d, i) => {
              if (node.data.clicked == true) {
                  g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
                      svg.select("#circle_class_" + d.classList[2])
                      .style("opacity", .25).style("stroke-opacity", 0)  
                  });
                  // svg.selectAll(".parent_" + node.data.node_id).style("opacity", .25).style("stroke-opacity", 0)
                  node.data.clicked = false
              
              }
              else {
                  g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
                      svg.select("#circle_class_" + d.classList[2])
                      .style("opacity", 1).style("stroke-opacity", 1) 
                  });
                  //svg.selectAll(".parent_" + node.data.node_id).style("opacity", 1).style("stroke-opacity", 1)
                  node.data.clicked = true
              

              }
              
          })



  }  
  
       

};



const get_boundaries = function ( elements, property ) {
  var min_x = null;
  var max_x = null;
  var min_y = null;
  var max_y = null;
  var min_size = null;
  var max_size = null;
  var total_x = 0
  var total_y = 0
  var num_circles = 0

  elements.forEach((element) => {
      if (element.data.hasOwnProperty(property)) {
          var tsne_x = element.data.tsne_x;
          var tsne_y = element.data.tsne_y;
          
          if (property == "x") {
              tsne_x = element.data.x;
              tsne_y = element.data.y;
          }
          
          const size = element.data.subreddit_count;

          min_x = find_min(min_x, tsne_x)
          max_x = find_max(max_x, tsne_x)

          min_y = find_min(min_y, tsne_y)
          max_y = find_max(max_y, tsne_y)

          min_size = find_min(min_size, size)
          max_size = find_max(max_size, size)
          
      }
  

  })
  return [min_x, max_x, min_y, max_y, min_size, max_size]
}

const find_min = function (curr_min, value) {
  if (typeof value == "string") {
      value = Number(value)

  }
  if (curr_min == null) {
      curr_min = value
  }
  if (value < curr_min) {
      curr_min = value
  }

  return curr_min
};

const find_max = function (curr_max, value) {
  if (curr_max == null) {
      curr_max = value
  }
  if (value > curr_max) {
      curr_max = value
  }

  return curr_max
};

const create_group = function ( node, root, prefix ) {
  if ( node.data.node_id == root.data.node_id ) {
    svg.select(".brush")
      .append("g")
      .attr("class", prefix)
      .attr("id", prefix + "_" + node.data.node_id)
  }
  else if ( node.parent.data.node_id == root.data.node_id ) {
    svg.select("#" + prefix + "_" + root.data.node_id)
      .append("g")
      .attr("class", prefix)
      .attr("id", prefix + "_" + node.data.node_id)
  } else {
    if ( node.data.node_id.includes("_") ) {
      svg.select("#" + prefix + "_" + node.parent.data.node_id)
        .append("g")
        .attr("class", prefix + " " + "circle_text_class" + " " + node.data.subreddit)
        .attr("id", prefix + "_" + node.data.subreddit)
    } else {
      svg.select("#" + prefix + "_" + node.parent.data.node_id)
        .append("g")
        .attr("class", prefix)
        .attr("id", prefix + "_" + node.data.node_id)
    }
  }
};


const render = function ( data, options = {} ) {
  let dict_of_prev_subreddits_to_change = {};    
  let nodes = [];
  let arr_of_tsne_boundaries = [];
  let dict_of_subreddits_to_change = {};
  
  console.log( "bubble map data:", data );
  let curr_root = d3.hierarchy( data );
  let curr_nodes = curr_root.descendants();
    
  if ( prev_data != null ) {   
    let prev_root = d3.hierarchy( prev_data );
    let prev_nodes = prev_root.descendants();

    // TODO: CHANGE THE FOLLOWING SO YOU DON"T HAVE TO RECALC THE DATA EACH TIME
    for ( const key in prev_nodes ) {
      const prev_node = prev_nodes[ key ];

      dict_of_prev_subreddits_to_change[ prev_node.data.subreddit ] = {
        node: prev_node, 
        change: overTimeOptions[ "add" ]
      };
    }

    for ( const key in curr_nodes ) {
      const curr_node = curr_nodes[ key ];

      if ( curr_node.data.hasOwnProperty("tsne_x") && curr_node.data.node_id.includes("_") ) {
        if ( curr_node.data.subreddit in dict_of_prev_subreddits_to_change ) {
          dict_of_subreddits_to_change[ curr_node.data.subreddit ] = {
            node: curr_node,
            change: overTimeOptions[ "transform" ]
          };
        }
        else {
          dict_of_subreddits_to_change[ curr_node.data.subreddit ] ={
            node: curr_node, 
            change: overTimeOptions[ "add" ]
          };
        }
            
      }
    }

    const keys = Object.keys( dict_of_prev_subreddits_to_change );
    for ( const key of keys ) {
      if ( !( key in dict_of_subreddits_to_change ) ) {
        dict_of_subreddits_to_change[ key ] = {
          node: dict_of_prev_subreddits_to_change[ key ][ "node" ],
          change: overTimeOptions[ "delete" ]
        };
      }
    }
        
  } else {
    
    for (const key in curr_nodes) {
      const curr_node = curr_nodes[ key ];
      dict_of_subreddits_to_change[ curr_node.data.subreddit ] = {
        node: curr_node,
        change: overTimeOptions[ "add" ]
      };
    }
  
  }
  
  
  
  
  let arr_of_curr_results = append_data( data, {
    nodes, 
    arr_of_tsne_boundaries,
    dict_of_subreddits_to_change
  });
  
  nodes = arr_of_curr_results[0];
  dict_of_prev_subreddits_to_change = arr_of_curr_results[1];
  arr_of_tsne_boundaries = arr_of_curr_results[2];



  const boundary_nodes = [];

  for ( const node of nodes ) {
    if (( node.data.hasOwnProperty("tsne_x") && node.data.node_id.includes("_") ) && (dict_of_prev_subreddits_to_change[ node.data.subreddit ]["change"] === overTimeOptions["add"] || dict_of_prev_subreddits_to_change[ node.data.subreddit ]["change"] === overTimeOptions["transform"])) {
      boundary_nodes.push(node)
    }
  }
  
  arr_of_boundaries = get_boundaries(boundary_nodes, "x");
  min_x = arr_of_boundaries[0];
  max_x = arr_of_boundaries[1];
  min_y = arr_of_boundaries[2];
  max_y = arr_of_boundaries[3];
  min_size = arr_of_boundaries[4];
  max_size = arr_of_boundaries[5];
  remapped_x = d3.scaleLinear()
    .domain([min_x, max_x])
    .range([ 0, width - margin ]);
  remapped_y = d3.scaleLinear()
    .domain([min_y, max_y])
    .range([ 0, height - margin - 100]);
  initial_brush = { min_x, max_y, min_y, max_y };

  if ( options.zoom_info == null ) {
    stack_of_brushes = [ initial_brush ]
  }
  else {
    stack_of_brushes = options.zoom_info
  }
        
    

  if ( !svg.selectAll(".label_text_class").empty() ) {
    svg.selectAll(".label_text_class").remove();
  }

  svg.selectAll(".circle_class")
    .attr("fill", "#808080");
    
  node_id_to_nodes = {};
    
  // for ( const node of props.labels ) {
  //   let render_node = node;
  //   if ( node.parent != null && node.data.node_id.include( "_" ) ) {
  //     render_node = node.parent;
  //   }

  //   renderLabels( 
  //     tsne_remapped_x( render_node.data.tsne_x ),
  //     tsne_remapped_y( render_node.data.tsne_y ),
  //     render_node
  //   );
  // }
    
};





const prepare = function ( _svg, frame, options = {} ) {
  if ( isDirtyBrush(options) ) {
    updateChartBrush(null);
  }  

  width = frame.clientWidth;
  height = frame.clientHeight;

  svg = d3.select( _svg )
    .attr( "viewBox", [ 0.5, -30.5, width, height + 30 ])
    .style( "font", "10px sans-serif" )
    .style( "float", "right" );

  svg.selectAll("rect").remove();
  svg.selectAll("g").remove();

  prepareTooltip();
  prepareBrush();
};


export {
  prepare,
  render
}