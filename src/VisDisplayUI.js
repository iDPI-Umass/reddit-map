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
  const [initial_bubble_map_render, setInitialBubbleMapRender] = React.useState(false)
  const [node_render, setNodeRender] = React.useState(false)
  const [tsne_remapped, setTsneRemapped] = React.useState({})

  const bubblemap_height = 550
  const bubblemap_width = 800
  const treemap_height = 450
  const treemap_width = 450
  const overTimeOptions = {"delete": 0, "add": 1, "transform": 2}
  
 

  function setSelectedNodes(node) {
    if (node.data.clicked) {
      selected_nodes[node.data.node_id] = node
    }
    else {
      delete selected_nodes[node.data.node_id]
    }

    
    //setSelectedNodes(selected_nodes)
  }

    return (
        <React.Fragment>
            <svg width={bubblemap_width + treemap_width} height={bubblemap_height + treemap_height}>
                <g>
                    <svg x={25} y={50}>
                        <Treemap initial_bubble_map_render={initial_bubble_map_render} prev_data={prev_data} curr_data={curr_data} setLabels={setLabels} setSelectedNodes={setSelectedNodes} setIsSelected={setIsSelected} setSelectedNodeId={setSelectedNodeId} width={treemap_width} height={treemap_height} setHighlightLabel={setHighlightLabel}/>
                    </svg>
                </g> 
                <g>
                    <svg x={treemap_width + 25} y={50}>
                        <BubbleMapTranslate prev_data={prev_data} curr_data={curr_data} 
                        initial_bubble_map_render={initial_bubble_map_render} setInitialBubbleMapRender={setInitialBubbleMapRender} 
                        setNodeRender={setNodeRender} node_render={node_render} 
                        tsne_remapped={tsne_remapped} setTsneRemapped={setTsneRemapped}
                        width={bubblemap_width} height={bubblemap_height} 
                        labels={labels}
                        setZoomInfo={setZoomInfo} zoom_info={stack_of_brushes}/>
                    </svg>
                </g>
                <g>
                  <svg>
                    <Slider setNodeRender={setNodeRender} setPrevData={setPrevData} setCurrData={setCurrData} currData={curr_data} treemap_width={treemap_width} treemap_height={treemap_height} bubblemap_width={bubblemap_width} bubblemap_height={bubblemap_height}></Slider>
                  </svg>
                </g>
                    
                
            </svg>
            
        </React.Fragment>
    );
}



export default VisDisplayUI;
