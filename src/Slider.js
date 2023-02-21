import React from 'react';
import * as d3 from 'd3';
import data_4 from "./data/RC_2021-04_KMeans_Agglom_100_Clusters.json"
import data_5 from "./data/RC_2021-05_KMeans_Agglom_100_Clusters_Cut.json"
import data_6 from "./data/RC_2021-06_KMeans_Agglom_100_Clusters_Cut_Tsne.json"
import { sliderBottom } from 'd3-simple-slider';

function Slider(props) {
    const svgRef = React.useRef()
    const dict_of_data = {4: data_4, 6: data_5, 5: data_6}
    const overTimeOptions = {"delete": 0, "add": 1, "transform": 2}
    const width = (props.treemap_width + props.bubblemap_width) / 3
    const height = Math.max(props.treemap_height, props.bubblemap_height)

    const svg = d3.select(svgRef.current)

    var slider = sliderBottom()
            .min(5)
            .max(6)
            .step(1)
            .width(300)
            .displayValue(true)
            .on('onchange', (d) => {
                props.prevData(props.currData)
                props.currData(dict_of_data[d])
            })

    var g_slider = svg.append("g")
                    .attr("class", "controls")
                    .attr("id", "slider")
                    .attr('transform', `translate(${width}, ${height})`).call(slider)

    return (
        <React.Fragment>
            <svg ref={svgRef}></svg>
        </React.Fragment>
    );
}



export default Slider;
