import React from 'react';
import * as d3 from 'd3';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Tree from "./Tree"
import Treemap from './Treemap';
import BubbleMapTranslate from "./BubbleMapTranslate";
import BubbleMap from "./BubbleMap";
import VisPickerUI from './VisPickerUI';


function VisDisplayUI() {

  const [nodes, setLabels] = React.useState(null);
  const [selected_nodes, setSelectedNodes] = React.useState({});
  const [is_selected, setIsSelected] = React.useState({});
  const [selected_node_id, setSelectedNodeId] = React.useState("");
  const [zoom_info, setZoomInfo] = React.useState(null)
  const height = 600
  const width = 600

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

    return (
        <React.Fragment>
            <Treemap labels={getLabelNodes} selected_labels={getSelectedNodes} is_selected={getIsSelected} selected_node_id={getSelectedNodeId} nodes={nodes} width={width} height={height}/>
            <BubbleMapTranslate treemap_labels={nodes} selected_labels_treemap={selected_nodes} is_selected_treemap={is_selected} selected_node_id_treemap={selected_node_id} set_zoom_info={getZoomInfo} zoom_info_treemap={zoom_info} width={width} height={height}/>
        </React.Fragment>
    );
}



export default VisDisplayUI;
