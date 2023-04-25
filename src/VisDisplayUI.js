import React from 'react';
import * as d3 from 'd3';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Tree from "./Tree"
import Treemap from './Treemap';
import BubbleMap from "./BubbleMap";
import VisPickerUI from './VisPickerUI';
import Slider from './Slider';
import data_4 from "./data/RC_2022-02_KMeans_Agglom_100_Clusters_Rules_Mapping.json"
import data_5 from "./data/RC_2021-05_KMeans_Agglom_100_Clusters_Updated_Mapping.json"
import Thumbnail from "react-webpage-thumbnail";


function VisDisplayUI() {

  const [labels, setLabels] = React.useState(null);
  const [selected_nodes, setSelected] = React.useState({});
  const [is_selected, setIsSelected] = React.useState({});
  const [selected_node_id, setSelectedNodeId] = React.useState("");
  const [stack_of_brushes, setZoomInfo] = React.useState(null)
  const [prev_data, setPrevData] = React.useState(null)
  const [curr_data, setCurrData] = React.useState(data_4)
  const [highlight_label, setHighlightLabel] = React.useState(null)
  const [prev_highlight_label, setPrevHighlightLabel] = React.useState(null)
  const [bubble_map_svg, setBubbleMapSvg] = React.useState(null)
  const [treemap_svg, setTreemapSvg] = React.useState(null)
  const [initial_bubble_map_render, setInitialBubbleMapRender] = React.useState(false)
  const [node_render, setNodeRender] = React.useState(false)
  const [tsne_remapped, setTsneRemapped] = React.useState({})
  const [all_node_id_to_nodes, setAllNodeIdToNodesDict] = React.useState({})
  const [curr_node_id_to_nodes, setCurrNodeIdToNodes] = React.useState({})
  const [set_highlight_label_subreddit, setHighlightLabelSubreddit] = React.useState(null)
  const [set_highlight_label_cluster, setHighlightLabelCluster] = React.useState(null)
  const [handle_tooltip_event, setHandleTooltipEvent] = React.useState(null)
  const [root, setRoot] = React.useState(null)
  const [handle_tooltip_node, setHandleTooltipNode] = React.useState(null)
  const [tooltip_is_mouse_enter, setTooltipIsMouseEnter] = React.useState(null)
  const [rerender_treemap, setRerenderTreemap] = React.useState(false)
  const [resize, setResize] = React.useState(null)
  const [is_bubble_map_increased, setIsBubbleMapIncreased] = React.useState(false)
  const [is_highlighted, setIsHighlighted] = React.useState(false)
  const [parent_label, setParentLabel] = React.useState(null)
  const [color_dict, setColorDict] = React.useState({})
  const [trigger_transition, setTriggerTransition] = React.useState(null)

  const slider_height = 75
  const treemap_height = window.innerHeight
  const treemap_width = window.innerHeight
  const bubblemap_height = window.innerHeight - slider_height
  const bubblemap_width = window.innerWidth - treemap_width - 20
  const [move_slider, setMoveSlider] = React.useState(bubblemap_width / 3)
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
  const thumbnails = importAll(require.context('./data/screenshots_test', false, /dogs\.png/));
  const arr_of_metadata = importAll(require.context('./data/subreddit_metadata', false, /\.(json)$/));
  let agg_metadata = {}

  Object.keys(arr_of_metadata).forEach(function(metadata) {
      Object.keys(arr_of_metadata[metadata]).forEach(function(subreddit_key) {
          agg_metadata[subreddit_key] = arr_of_metadata[metadata][subreddit_key]
      })
  })



  if (trigger_transition != null) {
    if (JSON.stringify(curr_data) != JSON.stringify(trigger_transition)) {
      setPrevData(curr_data)
      setCurrData(trigger_transition)
      setRerenderTreemap(!rerender_treemap)
      setNodeRender(false)
    }
    setTriggerTransition(null)
  }

  

  function add_general_tooltip_text(node, prefix, x, y, get_node_id, get_count, isMouseEnter) {
      let text_tooltip = null
      let tspan_node_id = null
      let tspan_count = null
      if (treemap_svg.select("#" + prefix + "text_tooltip").empty()) {
          text_tooltip = treemap_svg.append("text")
              .attr("id", prefix + "text_tooltip")
              .attr("class", "tooltip_class")
              .attr("font-size", "1.3em")
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
      node.data.top_subreddits_by_comment.split(",").forEach((label) => {
        arr_of_top_subreddit_label_to_index[label] = top_index
        top_index += 1
      })
      tspan_top_subreddits
          .selectAll("tspan")
          .data(["Top subreddits based on number of comments: "].concat(node.data.top_subreddits_by_comment.split(",")))
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
              .attr("class", "tooltip_image_class")
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
                num_of_words = 1
                if (arr_of_lines.length == 4) {
                  line += "..."
                }
                arr_of_lines.push(line)
                line = word + " "
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
      const boundingBox = treemap_svg.selectAll(".tooltip_class").node().getBBox()

      
      
      
      image
          .attr("x", boundingBox.x)
          .attr("y", boundingBox.y + boundingBox.height)
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
  

  function handleTooltip(event, d, root, isMouseEnter) {
    
    let get_count = () => {
      if (d.data.node_id.includes("_")) {
        return `Number of comments: ${format(d.data.comment_count)}, Percentage of Cluster: ${(d.data.comment_count/parseInt(d.parent.data.comment_count) * 100).toFixed(2) + '%'}`
      }
      else {
        return `Number of comments: ${format(d.data.comment_count)}, 
        Percentage of Reddit: ${(d.data.comment_count/parseInt(root.data.comment_count) * 100).toFixed(2) + '%'}`
      }
      
    }
    let description = ""
    if (d.data.subreddit in agg_metadata) {
        if ("about" in agg_metadata[d.data.subreddit] && "description" in agg_metadata[d.data.subreddit]["about"]) {
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
        thumbnail = "https://ihopmeag.s3.us-east-2.amazonaws.com/reddit_images/" + d.data.subreddit + ".png"
        
        add_subreddit_level_tooltip_text("", pointer_x, pointer_y, description, thumbnail, prev_dy)
        // add_image("", pointer_x, pointer_y, thumbnail, isMouseEnter)
    }
    else {
        add_top_level_tooltip_text(d, "", pointer_x, pointer_y, prev_dy)
    }

    let boundingBox = treemap_svg.select(".tooltip_class").node().getBBox()

    let rect_tooltip = null
    if (treemap_svg.select("#rect_tooltip").empty()) {
        rect_tooltip = treemap_svg.select("#g_rect_tooltip").append("rect")
            .attr("id", "rect_tooltip")
    }
    else {
        rect_tooltip = treemap_svg.select("#rect_tooltip")
    }
    
    // TODO: FIX THIS
    if (d.data.node_id.includes("_") && treemap_height - pointer_y < boundingBox.height + boundingBox.width) {
      console.log("DDDDDDDD")
      treemap_svg.selectAll(".tooltip_class").attr("y", pointer_y - boundingBox.height - 300)
      treemap_svg.selectAll(".tooltip_image_class").attr("y", pointer_y - 280)
    }

    if (!d.data.node_id.includes("_") && treemap_height - pointer_y < boundingBox.height) {
      console.log("y ", pointer_y - boundingBox.height)
      treemap_svg.selectAll(".tooltip_class").attr("y", pointer_y - boundingBox.height - 50)
      treemap_svg.selectAll(".tooltip_image_class").attr("y", pointer_y - boundingBox.height - 44)

    }
    if (treemap_width - (pointer_x + boundingBox.width) < 0) {
      console.log("x ", pointer_x - boundingBox.width - 10)
      treemap_svg.selectAll(".tooltip_class").attr("x", pointer_x - boundingBox.width - 10)
      treemap_svg.selectAll(".tooltip_image_class").attr("x", pointer_x - boundingBox.width + 2)
    }
    if (pointer_x - boundingBox.width < 0) {
      treemap_svg.selectAll(".tooltip_class").attr("x", -5)
      //treemap_svg.selectAll(".tooltip_class").attr("y", pointer_y - 10)
      treemap_svg.selectAll(".tooltip_image_class").attr("x", 8)
    } 
   
    boundingBox = treemap_svg.select(".tooltip_class").node().getBBox()


    rect_tooltip
        .attr("fill", "white")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("opacity", 1)
        .attr("x", boundingBox.x - 5)
        .attr("y", boundingBox.y - 5)
        .attr("width", boundingBox.width + 10)
        .attr("rx", 5)

    if (d.data.node_id.includes("_")) {
      rect_tooltip.attr("height", boundingBox.height + 10 + treemap_svg.select(".tooltip_image_class").node().getBBox().height)
    }
    else {
      rect_tooltip.attr("height", boundingBox.height + 10)
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

  function setAllNodeIdToNodes(node_id, subreddit, node_dict) {
    if (!(node_id in all_node_id_to_nodes)) {
      all_node_id_to_nodes[node_id] = {}
    }
    all_node_id_to_nodes[node_id][subreddit] = node_dict
  }
  

  if (handle_tooltip_event != null) {
    treemap_svg.append("g").attr("id", "g_rect_tooltip")
    handleTooltip(handle_tooltip_event, handle_tooltip_node, root, tooltip_is_mouse_enter)
  }

  function highlightNodes(highlight_label_cluster, highlight_node, highlight_label_subreddit, color_dict) {
    setPrevHighlightLabel(highlight_label)
    if (highlight_label.data.node_id.includes("_")) {
      highlight_label_cluster = highlight_label.data.node_id.split("_")[0]
      setHighlightLabelCluster(highlight_label_cluster)
      if (highlight_label_cluster in all_node_id_to_nodes) {
        highlight_node = all_node_id_to_nodes[highlight_label_cluster][highlight_label.data.subreddit]["selection"]
        if (!(highlight_label_cluster in color_dict)) {
          color_dict[highlight_label_cluster] = highlight_node.attr('fill')
        }
        
        highlight_node.attr('fill', () => {
          return "yellow"});
        highlight_label_subreddit = highlight_label.data.subreddit
        setHighlightLabelSubreddit(highlight_label_subreddit)
        setIsHighlighted(true)
      }
      
    }
    else {
      highlight_label_subreddit = null
      highlight_label_cluster = highlight_label.data.node_id
      setHighlightLabelCluster(highlight_label_cluster)
      
      if (highlight_label_cluster in 
        all_node_id_to_nodes) {
        let highlight_nodes = all_node_id_to_nodes[highlight_label_cluster]
        Object.keys(highlight_nodes).forEach(function(subreddit) {
          highlight_node = highlight_nodes[subreddit]["selection"]
          if (!(subreddit in color_dict)) {
            color_dict[subreddit] = highlight_node.attr('fill')
          }
          highlight_node.attr('fill', () => {
            return "yellow"});
        })
      }
      setHighlightLabelSubreddit(null)
      setIsHighlighted(true)

      
    }

  }

  function dehighlightNodes(color_dict) {
    setPrevHighlightLabel(highlight_label)
    if (set_highlight_label_subreddit == null) {
      Object.keys(all_node_id_to_nodes[set_highlight_label_cluster]).forEach(function(subreddit) {
        all_node_id_to_nodes[set_highlight_label_cluster][subreddit]["selection"].attr('fill', () => {
          if (!(set_highlight_label_cluster in curr_node_id_to_nodes)) {
            return "#808080"
          }
          return color_dict[subreddit]});
      })
    }
    else {
      all_node_id_to_nodes[set_highlight_label_cluster][set_highlight_label_subreddit]["selection"].attr('fill', () => {
        if (!(set_highlight_label_cluster in curr_node_id_to_nodes)) {
          return "#808080"
        }
        return color_dict[set_highlight_label_subreddit]});
    }
    setIsHighlighted(false)
    
  }

  /* let highlight_label_cluster = null
  let highlight_node = null
  let highlight_label_subreddit = null

  if (Object.keys(all_node_id_to_nodes).length > 0 && highlight_label != null && (!is_highlighted || prev_highlight_label != highlight_label)) {
    if (prev_highlight_label != null && prev_highlight_label != highlight_label) {
      dehighlightNodes(color_dict)
    }
    highlightNodes(highlight_label_cluster, highlight_node, highlight_label_subreddit, color_dict)
    
  }

  if (Object.keys(all_node_id_to_nodes).length > 0 && highlight_label == null && is_highlighted) {
    dehighlightNodes(color_dict)
  } */

  /* if (curr_node_id_to_nodes != null) {
    Object.keys(curr_node_id_to_nodes).forEach(function(node_id) {
      if (id != highlight_label) {
        curr_node_id_to_nodes[node_id]["selection"].attr("fill", )
      }
      highlight_node = highlight_nodes[subreddit]["selection"]
      highlight_node.transition().attr('fill', () => {
        return "yellow"});
    })
  } */

  /* let is_treemap_resized = false
  let is_bubble_map_resized = false
  if (resize != null && bubble_map_svg != null && treemap_svg != null) {
    if (resize == 0 && is_bubble_map_increased) {
      bubble_map_svg
        .transition()
        .duration(100)
        .attr("height", bubblemap_height)
        .attr("width", bubblemap_width)
        is_treemap_resized = true
      if (is_treemap_resized) {
        treemap_svg
          .transition()
          .duration(100)
          .attr("height", treemap_height)
          .attr("width", treemap_width)
      } 
      setIsBubbleMapIncreased(false)
      setMoveSlider(bubblemap_width / 3)
    }
    if (resize < 0 && !is_bubble_map_increased) {
      treemap_svg
          .transition()
          .duration(100)
          .attr("height", treemap_height - 100)
          .attr("width", treemap_width - 100)
      
      is_bubble_map_resized = true
      if (is_bubble_map_resized) {
        bubble_map_svg
          .transition()
          .duration(100)
          .attr("height", bubblemap_height + 100)
          .attr("width", bubblemap_width)
      }
      setIsBubbleMapIncreased(true)
      setMoveSlider((bubblemap_width + 100) / 3)
    }
  } */


    return (
        <React.Fragment>

                    

          <Treemap initial_bubble_map_render={initial_bubble_map_render} 
          prev_data={prev_data} curr_data={curr_data} setLabels={setLabels} 
          setSelectedNodes={setSelectedNodes} setIsSelected={setIsSelected} 
          setSelectedNodeId={setSelectedNodeId} width={treemap_width} 
          height={treemap_height} setHighlightLabel={setHighlightLabel}
          all_node_id_to_nodes={all_node_id_to_nodes}
          setHandleTooltipEvent={setHandleTooltipEvent}
          setHandleTooltipNode={setHandleTooltipNode}
          setTooltipIsMouseEnter={setTooltipIsMouseEnter}
          setTreemapSvg={setTreemapSvg}
          treemap_svg={treemap_svg}
          rerender_treemap={rerender_treemap}
          setParentLabel={setParentLabel}
          setRoot={setRoot}/>


          <BubbleMap prev_data={prev_data} curr_data={curr_data} 
          initial_bubble_map_render={initial_bubble_map_render} setInitialBubbleMapRender={setInitialBubbleMapRender} 
          setNodeRender={setNodeRender} node_render={node_render} 
          tsne_remapped={tsne_remapped} setTsneRemapped={setTsneRemapped}
          width={bubblemap_width} height={bubblemap_height} 
          labels={labels}
          setZoomInfo={setZoomInfo} zoom_info={stack_of_brushes}
          treemap_width={treemap_width}
          setAllNodeIdToNodes={setAllNodeIdToNodes}
          resize={resize} setResize={setResize}
          setBubbleMapSvg={setBubbleMapSvg}
          parent_label={parent_label}
          setCurrNodeIdToNodes={setCurrNodeIdToNodes}/>

          <Slider setRerenderTreemap={setRerenderTreemap} 
          rerender_treemap={rerender_treemap} setNodeRender={setNodeRender} 
          setPrevData={setPrevData} setCurrData={setCurrData} curr_data={curr_data} prev_data={prev_data}
          treemap_width={treemap_width} treemap_height={treemap_height} 
          bubblemap_width={bubblemap_width} bubblemap_height={bubblemap_height}
          move_slider={move_slider}
          slider_height={slider_height}
          setTriggerTransition={setTriggerTransition}></Slider>

                    

                    
                
            
        </React.Fragment>
    );
}



export default VisDisplayUI;
