import React from 'react';
import * as d3 from 'd3';
import data_4 from "./data/RC_2021-04_KMeans_Agglom_100_Clusters.json"
import data_5 from "./data/RC_2021-05_KMeans_Agglom_100_Clusters_Cut.json"
import data_6 from "./data/RC_2021-06_KMeans_Agglom_100_Clusters_Cut_Tsne.json"

function Slider() {
    const svgRef = React.useRef()
    const dict_of_data = {4: data_4, 6: data_5, 5: data_6}
    const overTimeOptions = {"delete": 0, "add": 1, "transform": 2}

    var slider = sliderBottom()
            .min(5)
            .max(6)
            .step(1)
            .width(300)
            .displayValue(true)
            .on('onchange', (d) => {
                var arr_of_results = append_data(d, dict_of_data[d], nodes, arr_of_tsne_boundaries, svg, tooltip, dict_of_prev_subreddits_to_change, highlight_label)
                nodes = arr_of_results[0]
                dict_of_prev_subreddits_to_change = arr_of_results[1]
                arr_of_tsne_boundaries = arr_of_results[2]
            })

    var g_slider = svg.append("g")
                    .attr("class", "controls")
                    .attr("id", "slider")
                    .attr('transform', 'translate(' + width / 3 + ',375)').call(slider)

    return (
        <React.Fragment>
        </React.Fragment>
    );
}



export default Slider;
