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

  const [nodes, setLabels] = React.useState(null);
  const [selected_nodes, setSelectedNodes] = React.useState({});
  const [is_selected, setIsSelected] = React.useState({});
  const [selected_node_id, setSelectedNodeId] = React.useState("");
  const [zoom_info, setZoomInfo] = React.useState(null)
  const [prev_data, setTreeMapPrevData] = React.useState(null)
  const [curr_data, setTreeMapCurrData] = React.useState(data_5)
  const [is_rendered, setIsRendered] = React.useState(false)
  const [highlight_label, setHighlighLabel] = React.useState(null)
  const bubblemap_height = 550
  const bubblemap_width = 800
  const treemap_height = 450
  const treemap_width = 450

  function getIsRendered(is_rendered) {
    setIsRendered(is_rendered)
  }

  function getTreeMapCurrData(data) {
    setTreeMapCurrData(data)
  }

  function getTreeMapPrevData(data) {
    setTreeMapPrevData(data)
  }

  function getLabelNodes(nodes) {
    setLabels(nodes)
  }

  function getSelectedNodes(node) {
    if (node.data.clicked) {
      selected_nodes[node.data.node_id] = node
    }
    else {
      delete selected_nodes[node.data.node_id]
    }

    
    //setSelectedNodes(selected_nodes)
  }

  function getIsSelected(is_selected) {
    setIsSelected(is_selected)
  }

  function getSelectedNodeId(node_id) {
    setSelectedNodeId(node_id)
  }

  function getZoomInfo(zoom_info) {
    setZoomInfo(zoom_info)
  }

  function getVis(vis_num) {
    if (vis_num == 0) {
      setVis(bubblemapSetting)
    }
    if (vis_num == 1) {
      setVis(treemapSetting)
    }
    if (vis_num == 2) {
      setVis(bubbleTreemapSetting)
    }
  }

  function getHighlightLabel(highlight_label) {
    setHighlighLabel(highlight_label)
  }

  const bubble = <div className="App">
                    <VisPickerUI visFns={getVis}/>
                    <BubbleMap/>
                  </div>
  const bubblemapSetting = <div className="App">
                    <VisPickerUI visFns={getVis}/>
                    <BubbleMapTranslate treemap_labels={nodes} selected_labels_treemap={selected_nodes} is_selected_treemap={is_selected} selected_node_id_treemap={selected_node_id} set_zoom_info={getZoomInfo} zoom_info_treemap={zoom_info}/>
                  </div>
  const treemapSetting = <div className="App">
                              <VisPickerUI visFns={getVis}/>
                              <Treemap labels={getLabelNodes} selected_labels={getSelectedNodes} is_selected={getIsSelected} selected_node_id={getSelectedNodeId}/>
                            </div>
  const bubbleTreemapSetting = <div className="App">
    <VisPickerUI visFns={getVis}/>
    <Treemap labels={getLabelNodes} selected_labels={getSelectedNodes} is_selected={getIsSelected} selected_node_id={getSelectedNodeId} nodes={nodes}/>
    <BubbleMapTranslate treemap_labels={nodes} selected_labels_treemap={selected_nodes} is_selected_treemap={is_selected} selected_node_id_treemap={selected_node_id} set_zoom_info={getZoomInfo} zoom_info_treemap={zoom_info}/>
    </div>

    const [vis, setVis] = React.useState(bubbleTreemapSetting)

    console.log("highlight_label vis: ", highlight_label)
    return (
        <React.Fragment>
            <svg width={bubblemap_width + treemap_width} height={bubblemap_height + treemap_height}>
                <g>
                    <svg x={25} y={50}>
                        <Treemap prev_data={prev_data} curr_data={curr_data} setIsRendered={getIsRendered} is_rendered={is_rendered} labels={getLabelNodes} selected_labels={getSelectedNodes} is_selected={getIsSelected} selected_node_id={getSelectedNodeId} nodes={nodes} width={treemap_width} height={treemap_height} highlightLabel={getHighlightLabel}/>
                    </svg>
                </g> 
                <g>
                    <svg x={treemap_width + 25} y={50}>
                        <BubbleMapTranslate is_rendered={is_rendered} prevData={prev_data} currData={curr_data} treemap_labels={nodes} selected_labels_treemap={selected_nodes} is_selected_treemap={is_selected} selected_node_id_treemap={selected_node_id} set_zoom_info={getZoomInfo} zoom_info_treemap={zoom_info} width={bubblemap_width} height={bubblemap_height} highlight_label={highlight_label}/>
                    </svg>
                </g>
                <g>
                  <svg>
                    <Slider prevDataFns={getTreeMapPrevData} currDataFns={getTreeMapCurrData} currData={curr_data} treemap_width={treemap_width} treemap_height={treemap_height} bubblemap_width={bubblemap_width} bubblemap_height={bubblemap_height}></Slider>
                  </svg>
                </g>
                    
                
            </svg>
            
        </React.Fragment>
    );
}



export default VisDisplayUI;
