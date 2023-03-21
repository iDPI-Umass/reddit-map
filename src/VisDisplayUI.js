import React from 'react';
import * as d3 from 'd3';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Tree from "./Tree"
import Treemap from './Treemap';
import BubbleMapTranslate from "./BubbleMapTranslate";
import BubbleMap from "./BubbleMap";
import VisPickerUI from './VisPickerUI';
import Slider from './Slider';
import data_4 from "./data/RC_2021-04_KMeans_Agglom_100_Clusters.json"
import data_5 from "./data/RC_2021-05_KMeans_Agglom_100_Clusters_Cut.json"
import data_6 from "./data/RC_2021-06_KMeans_Agglom_100_Clusters_Cut_Tsne.json"
import Thumbnail from "react-webpage-thumbnail";


function VisDisplayUI() {

  const [labels, setLabels] = React.useState(null);
  const [selected_nodes, setSelected] = React.useState({});
  const [is_selected, setIsSelected] = React.useState({});
  const [selected_node_id, setSelectedNodeId] = React.useState("");
  const [stack_of_brushes, setZoomInfo] = React.useState(null)
  const [prev_data, setPrevData] = React.useState(null)
  const [curr_data, setCurrData] = React.useState(data_5)
  const [highlight_label, setHighlightLabel] = React.useState(null)
  const [bubble_map_svg, setBubbleMapSvg] = React.useState(null)
  const [treemap_svg, setTreemapSvg] = React.useState(null)
  const [initial_bubble_map_render, setInitialBubbleMapRender] = React.useState(false)
  const [node_render, setNodeRender] = React.useState(false)
  const [tsne_remapped, setTsneRemapped] = React.useState({})
  const [node_id_to_nodes, setNodeIdToNodesDict] = React.useState({})
  const [set_highlight_label_subreddit, setHighlightLabelSubreddit] = React.useState(null)
  const [set_highlight_label_cluster, setHighlightLabelCluster] = React.useState(null)
  const [handle_tooltip_event, setHandleTooltipEvent] = React.useState(null)
  const [handle_tooltip_node, setHandleTooltipNode] = React.useState(null)
  const [tooltip_is_mouse_enter, setTooltipIsMouseEnter] = React.useState(null)
  const [rerender_treemap, setRerenderTreemap] = React.useState(false)

  const bubblemap_height = 550
  const bubblemap_width = 800
  const treemap_height = 450
  const treemap_width = 450
  const overTimeOptions = {"delete": 0, "add": 1, "transform": 2}
  const format = d3.format(",d");
  const get_node_id = d => d.ancestors().reverse().map((d) => {
      if (d.data.node_id.includes("_")) {
          return d.data.subreddit
      }
      else {
          return d.data.taxonomy_label
      }

  }).join(".") 

  function importAll(r) {
    let images = {};
    r.keys().forEach((item, index) => { images[item.replace('./', '')] = r(item); });
      return images
  }
  const re = new RegExp("dog.png")
  const thumbnails = require.context('./data/screenshots_test', false, /dogs\.png/);
  const arr_of_metadata = importAll(require.context('./data/subreddit_metadata', false, /\.(json)$/));
  let agg_metadata = {}

  Object.keys(arr_of_metadata).forEach(function(metadata) {
      Object.keys(arr_of_metadata[metadata]).forEach(function(subreddit_key) {
          agg_metadata[subreddit_key] = arr_of_metadata[metadata][subreddit_key]
      })
  })

  //console.log(thumbnails)
  //console.log(thumbnails.keys())

  //console.log("thumbnails: ", thumbnails)

  /* thumbnails("./dogs.png").then((locale) => {
    // do something with locale
    console.log("locale: ", locale)
  }); */





  function add_general_tooltip_text(node, prefix, x, y, get_node_id, get_count, isMouseEnter) {
      let text_tooltip = null
      let tspan_node_id = null
      let tspan_count = null
      if (treemap_svg.select("#" + prefix + "text_tooltip").empty()) {
          text_tooltip = treemap_svg.append("text")
              .attr("id", prefix + "text_tooltip")
              .attr("class", "tooltip_class")
          tspan_node_id = text_tooltip.append("tspan")
              .attr("id", prefix + "tspan_node_id")
              .attr("class", "tooltip_class")
          tspan_count = text_tooltip.append("tspan")
              .attr("id", prefix + "tspan_count")
              .attr("class", "tooltip_class")
      }
      else {
          text_tooltip = treemap_svg.select("#" + prefix + "text_tooltip")
          tspan_node_id = treemap_svg.select("#" + prefix + "tspan_node_id")
          tspan_count = treemap_svg.select("#" + prefix + "tspan_count")
      }
      text_tooltip
          .attr("x", x)
          .attr("y", y)
          .attr("fill", "black")
      let final_dy = ""
      tspan_node_id
          .selectAll("tspan")
          .data(() => {
            let arr_of_lines = []
            let words = get_node_id(node).split(/ |\./)
            let subreddits = get_node_id(node).split(/\./)
            let line = ""
            let num_of_words = 0
            let subreddit = ""
            for (let i = 0; i < words.length; i++) {
              let word = words[i]
              let added_period = false
              subreddit += word
              if (subreddits.includes(subreddit)) {
                subreddit = ""
                added_period = true
              }
              else {
                if (subreddit.length != 0) {
                  subreddit += " "
                }
              }
              if (num_of_words < 5) {
                line += word
                if (added_period) {
                  line += "."
                }
                if (num_of_words < 4 && !added_period) {
                  if (line.length != 0) {
                    line += " "
                  }
                }
                num_of_words += 1
              }
              else {
                num_of_words = 1
                arr_of_lines.push(line)
                line = word + " "
              }
            }
            if (line.length != 0) {
              arr_of_lines.push(line)
            }
            arr_of_lines[0] = arr_of_lines[0].slice(1)
            arr_of_lines[arr_of_lines.length - 1] = arr_of_lines[arr_of_lines.length - 1].slice(0, arr_of_lines[arr_of_lines.length - 1].length - 1)
            return arr_of_lines
          })
          .join("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", (d, i, nodes) => {
            final_dy = 1.2 + (i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9
            return `${1.2 + ((i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9)}em`
          })
          .attr("dx", "1em")
          .attr("class", "tooltip_class")
          .text(d => d) 

      tspan_count
          .attr("x", x)
          .attr("y", y)
          .attr("dx", "1em")
          .attr("dy", `${1.2 + final_dy}em`)
          .text(get_count)
      return final_dy
  }

  function add_top_level_tooltip_text(node, prefix, x, y, prev_dy) {
      let tspan_top_subreddits = null
      let text_tooltip = treemap_svg.select("#" + prefix + "text_tooltip")
      if (treemap_svg.select("#" + prefix + "tspan_top_subreddits").empty()) {
          tspan_top_subreddits = text_tooltip.append("tspan")
              .attr("id", prefix + "tspan_top_subreddits")
              .attr("class", "tooltip_class")
              
      }
      else {
          tspan_top_subreddits = treemap_svg.select("#" + prefix + "tspan_top_subreddits")
      }

      let top_index = 1
      let arr_of_top_subreddit_label_to_index = {}
      node.data.top_subreddit_labels.split(",").forEach((label) => {
        arr_of_top_subreddit_label_to_index[label] = top_index
        top_index += 1
      })
      tspan_top_subreddits
          .selectAll("tspan")
          .data(["Top subreddits based on number of comments: "].concat(node.data.top_subreddit_labels.split(",")))
          .join("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dx", "1em")
          .attr("dy", (d, i, nodes) => {
            return `${prev_dy + 1.2 + ((i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9)}em`
          })
          .attr("class", "tooltip_class")
          .text(d => {
            if (d in arr_of_top_subreddit_label_to_index) {
              return `${arr_of_top_subreddit_label_to_index[d]}. ${d}`
            }
            return d
          })
  }

  function add_subreddit_level_tooltip_text(prefix, x, y, description, thumbnail, prev_dy) {
      let tspan_description = null
      let image = null
      let text_tooltip = treemap_svg.select("#" + prefix + "text_tooltip")
      if (treemap_svg.select("#" + prefix + "tspan_description").empty()) {
          tspan_description = text_tooltip.append("tspan")
              .attr("id", prefix + "tspan_description") 
              .attr("class", "tooltip_class")
          image = treemap_svg.append("image")
              .attr("id", prefix + "thumbnail")
              .attr("class", "tooltip_class")
      }
      else {
          tspan_description = treemap_svg.select("#" + prefix + "tspan_description")
          image = treemap_svg.select("#" + prefix + "thumbnail")
      }
      let final_dy = ""
      tspan_description
          .selectAll("tspan")
          .data(() => {
            let arr_of_lines = []
            let words = description.split(" ")
            let line = ""
            let num_of_words = 0
            for (let i = 0; i < words.length; i++) {
              if (arr_of_lines.length == 5) {
                break
              }
              let word = words[i]
              if (num_of_words < 5) {
                line += word
                if (num_of_words < 4) {
                  line += " "
                }
                num_of_words += 1
              }
              else {
                num_of_words = 0
                if (arr_of_lines.length == 4) {
                  line += "..."
                }
                arr_of_lines.push(line)
                line = ""
              }
            }
            if (arr_of_lines.length < 5) {
              arr_of_lines.push(line)
            }
            return arr_of_lines
          })
          .join("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", (d, i, nodes) => {
            final_dy = prev_dy + 1.2 + (i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9
            return `${prev_dy + 1.2 + ((i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9)}em`
          })
          .attr("dx", "1em")
          .attr("class", "tooltip_class")
          .text(d => d) 
      const boundingBox = treemap_svg.select("#text_tooltip").node().getBBox()
      image
          .attr("x", x)
          .attr("y", y + boundingBox.height)
          .attr("dy", `${2.4 + final_dy}em`)
          .attr("dx", "1em")
          .attr("width", boundingBox.width)
          .attr("href", thumbnail)
  }

  function add_image(prefix, x, y, thumbnail, isMouseEnter) {
      let image = null
      if (treemap_svg.select("#" + prefix + "thumbnail").empty()) {
          image = treemap_svg.append("image")
              .attr("id", prefix + "thumbnail")
              .attr("class", "tooltip_class")
      }
      else {
          image = treemap_svg.select("#" + prefix + "thumbnail")
      }
      const boundingBox = treemap_svg.select("#text_tooltip").node().getBBox()
      image
          .attr("x", x)
          .attr("y", y)
          .attr("width", boundingBox.width)
          .attr("href", thumbnail)
  }
  

  function handleTooltip(event, d, isMouseEnter) {
    
    let get_count = () => {
        if (d.data.node_id.includes("_")) {
            return `Number of comments: ${format(d.data.subreddit_count)}`
        }
        return `Number of comments: ${format(d.data.cluster_subreddit_count)}`
    }
    let description = ""
    if (d.data.subreddit in agg_metadata) {
        if ("description" in agg_metadata[d.data.subreddit]["about"]) {
            description = agg_metadata[d.data.subreddit]["about"]["description"]
        }
        else {
            description = ""
        }
    }
    else {
        description = ""
    }
    
    let pointer_x = d3.pointer(event)[0]
    let pointer_y = d3.pointer(event)[1]

    let prev_dy = add_general_tooltip_text(d, "", pointer_x, pointer_y, get_node_id, get_count, isMouseEnter)
    if (d.data.node_id.includes("_")) {
        let thumbnail = null
        if (d.data.subreddit + ".png" in thumbnails) {
            thumbnail = thumbnails[d.data.subreddit + ".png"]
        }
        else {
            thumbnail = thumbnails["dogs.png"]
        }
        
        add_subreddit_level_tooltip_text("", pointer_x, pointer_y, description, thumbnail, prev_dy)
        // add_image("", pointer_x, pointer_y, thumbnail, isMouseEnter)
    }
    else {
        add_top_level_tooltip_text(d, "", pointer_x, pointer_y, prev_dy)
    }

    let boundingBox = treemap_svg.select("#text_tooltip").node().getBBox()

    let rect_tooltip = null
    if (treemap_svg.select("#rect_tooltip").empty()) {
        rect_tooltip = treemap_svg.select("#g_rect_tooltip").append("rect")
            .attr("id", "rect_tooltip")
    }
    else {
        rect_tooltip = treemap_svg.select("#rect_tooltip")
    }
    
    if (treemap_height - pointer_y < boundingBox.height) {
      treemap_svg.selectAll(".tooltip_class").attr("y", pointer_y - boundingBox.height)
    }
    if (treemap_width - (pointer_x + boundingBox.width) < 0) {
      treemap_svg.selectAll(".tooltip_class").attr("x", pointer_x - boundingBox.width - 10)
    }
    if (pointer_x - boundingBox.width < 0) {
      treemap_svg.selectAll(".tooltip_class").attr("x", -5)
    }
   
    boundingBox = treemap_svg.select("#text_tooltip").node().getBBox()

    rect_tooltip
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-linejoin", "round")
        .attr("opacity", 1)
        .attr("x", boundingBox.x)
        .attr("y", boundingBox.y )
        .attr("width", boundingBox.width)

    if (d.data.node_id.includes("_")) {
      rect_tooltip.attr("height", boundingBox.height + parseInt(treemap_svg.select("#thumbnail").attr("width")))
    } 
    else {
      rect_tooltip.attr("height", boundingBox.height)
    }

    
  }
 

  function setSelectedNodes(node) {
    if (node.data.clicked) {
      selected_nodes[node.data.node_id] = node
    }
    else {
      delete selected_nodes[node.data.node_id]
    }

    
    //setSelectedNodes(selected_nodes)
  }

  function setNodeIdToNodes(node_id, node) {
    if (!(node_id in node_id_to_nodes)) {
      node_id_to_nodes[node_id] = []
    }
    node_id_to_nodes[node_id].push(node)
  }

  if (handle_tooltip_event != null) {
    treemap_svg.append("g").attr("id", "g_rect_tooltip")
    handleTooltip(handle_tooltip_event, handle_tooltip_node, tooltip_is_mouse_enter)
  }

  /* let highlight_label_cluster = null
  let highlight_node = null
  let highlight_label_subreddit = null

  console.log("node_id_to_nodes: ", node_id_to_nodes)
  console.log("highlight_label: ", highlight_label)
  if (highlight_label != null) {
    console.log("highlight_label.data.node_id: ", highlight_label.data.node_id)
  }

  if (Object.keys(node_id_to_nodes).length > 0 && highlight_label != null) {
    console.log("WOOOHOOOOOOOOOOOOOOOO")
    
    if (highlight_label.data.node_id.includes("_")) {
      console.log("WOOOHOOOOOO with underscore")
      highlight_label_cluster = highlight_label.data.node_id.split("_")[0]
      setHighlightLabelCluster(highlight_label_cluster)
      if (highlight_label_cluster in node_id_to_nodes) {
        console.log("we innnn")
        highlight_node = node_id_to_nodes[highlight_label_cluster][highlight_label.data.subreddit]
      
        highlight_node.attr('fill', () => {
          return "yellow"});
        highlight_label_subreddit = highlight_label.data.subreddit
        setHighlightLabelSubreddit(highlight_label_subreddit)
      }
      
    }
    else {
      console.log("WOOOHOOOOOO with NOOOO underscore")
      highlight_label_subreddit = null
      highlight_label_cluster = highlight_label.data.node_id
      setHighlightLabelCluster(highlight_label_cluster)
      if (highlight_label_cluster in 
        node_id_to_nodes) {
        console.log("we in!")
        let highlight_nodes = node_id_to_nodes[highlight_label_cluster]
        console.log("highlight_nodesssssssss: ", highlight_nodes)
        Object.keys(highlight_nodes).forEach(function(subreddit) {
          highlight_node = highlight_nodes[subreddit]
          highlight_node.attr('fill', () => {
            return "yellow"});
        })
      }
      setHighlightLabelSubreddit(null)

      
    }
    
  }

  if (Object.keys(node_id_to_nodes).length > 0 && highlight_label == null) {
    console.log("NAAAAAAAAAH")
    console.log("highlight_label_subreddit: ", set_highlight_label_subreddit)
    console.log("highlight_label_cluster: ", set_highlight_label_cluster)
    if (set_highlight_label_subreddit == null) {

      Object.keys(node_id_to_nodes[set_highlight_label_cluster]).forEach(function(subreddit) {
        node_id_to_nodes[set_highlight_label_cluster][subreddit].attr('fill', () => {
          return node_id_to_nodes[set_highlight_label_cluster][subreddit].data.color});
      })
    }
    else {
      node_id_to_nodes[set_highlight_label_cluster][set_highlight_label_subreddit].attr('fill', () => {
        return node_id_to_nodes[set_highlight_label_cluster][set_highlight_label_subreddit].data.color});
    }
  } */


    return (
        <React.Fragment>

                    <Treemap initial_bubble_map_render={initial_bubble_map_render} 
                    prev_data={prev_data} curr_data={curr_data} setLabels={setLabels} 
                    setSelectedNodes={setSelectedNodes} setIsSelected={setIsSelected} 
                    setSelectedNodeId={setSelectedNodeId} width={treemap_width} 
                    height={treemap_height} setHighlightLabel={setHighlightLabel}
                    node_id_to_nodes={node_id_to_nodes}
                    setHandleTooltipEvent={setHandleTooltipEvent}
                    setHandleTooltipNode={setHandleTooltipNode}
                    setTooltipIsMouseEnter={setTooltipIsMouseEnter}
                    setTreemapSvg={setTreemapSvg}
                    rerender_treemap={rerender_treemap}/>


                    <BubbleMapTranslate prev_data={prev_data} curr_data={curr_data} 
                    initial_bubble_map_render={initial_bubble_map_render} setInitialBubbleMapRender={setInitialBubbleMapRender} 
                    setNodeRender={setNodeRender} node_render={node_render} 
                    tsne_remapped={tsne_remapped} setTsneRemapped={setTsneRemapped}
                    width={bubblemap_width} height={bubblemap_height} 
                    labels={labels}
                    setZoomInfo={setZoomInfo} zoom_info={stack_of_brushes}
                    treemap_width={treemap_width}
                    setNodeIdToNodes={setNodeIdToNodesDict}/>

                    <Slider setRerenderTreemap={setRerenderTreemap} rerender_treemap={rerender_treemap} setNodeRender={setNodeRender} setPrevData={setPrevData} setCurrData={setCurrData} currData={curr_data} treemap_width={treemap_width} treemap_height={treemap_height} bubblemap_width={bubblemap_width} bubblemap_height={bubblemap_height}></Slider>

                    
                
            
        </React.Fragment>
    );
}



export default VisDisplayUI;
