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
  const [zoom_info, setZoomInfo] = React.useState(null)
  const [prev_data, setPrevData] = React.useState(null)
  const [curr_data, setCurrData] = React.useState(data_5)
  const [is_rendered, setIsRendered] = React.useState(false)
  const [highlight_label, setHighlightLabel] = React.useState(null)
  const bubblemap_height = 550
  const bubblemap_width = 800
  const treemap_height = 450
  const treemap_width = 450

  function setSelectedNodes(node) {
    if (node.data.clicked) {
      selected_nodes[node.data.node_id] = node
    }
    else {
      delete selected_nodes[node.data.node_id]
    }

    
    //setSelectedNodes(selected_nodes)
  }






    console.log("highlight_label vis: ", highlight_label)
    return (
        <React.Fragment>
            <svg width={bubblemap_width + treemap_width} height={bubblemap_height + treemap_height}>
                <g>
                    <svg x={25} y={50}>
                        <Treemap prev_data={prev_data} curr_data={curr_data} setIsRendered={setIsRendered} is_rendered={is_rendered} setLabels={setLabels} setSelectedNodes={setSelectedNodes} setIsSelected={setIsSelected} setSelectedNodeId={setSelectedNodeId} width={treemap_width} height={treemap_height} setHighlightLabel={setHighlightLabel}/>
                    </svg>
                </g> 
                <g>
                    <svg x={treemap_width + 25} y={50}>
                        <BubbleMapTranslate is_rendered={is_rendered} prevData={prev_data} currData={curr_data} labels={labels} selected_labels={selected_nodes} is_selected={is_selected} selected_node_id={selected_node_id} setZoomInfo={setZoomInfo} zoom_info={zoom_info} width={bubblemap_width} height={bubblemap_height} highlight_label={highlight_label}/>
                    </svg>
                </g>
                <g>
                  <svg>
                    <Slider setPrevData={setPrevData} setCurrData={setCurrData} currData={curr_data} treemap_width={treemap_width} treemap_height={treemap_height} bubblemap_width={bubblemap_width} bubblemap_height={bubblemap_height}></Slider>
                  </svg>
                </g>
                    
                
            </svg>
            
        </React.Fragment>
    );
}



export default VisDisplayUI;
