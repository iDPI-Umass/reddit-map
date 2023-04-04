import React from 'react';
import * as d3 from 'd3';
import data_4 from "./data/RC_2021-04_KMeans_Agglom_100_Clusters_Updated_Mapping.json"
import data_5 from "./data/RC_2021-05_KMeans_Agglom_100_Clusters_Updated_Mapping.json"
import data_6 from "./data/RC_2021-06_KMeans_Agglom_100_Clusters_Cut_Tsne.json"
import { sliderBottom } from 'd3-simple-slider';

function Slider(props) {
    const svgRef = React.useRef()
    const dict_of_data = {"2021-04": data_4, "2021-05": data_5, "2021-06": data_6}
    const overTimeOptions = {"delete": 0, "add": 1, "transform": 2}
    const width = (props.treemap_width + props.bubblemap_width) 
    const height = Math.max(props.treemap_height, props.bubblemap_height)
    const times = d3.utcMonth.range(Date.UTC(2021, 3), Date.UTC(2021, 5))
    const utcFormatter = d3.utcFormat("%Y-%m")

    React.useEffect(() => { 

        const svg = d3.select(svgRef.current)
        svg.select(".controls").remove()

        var slider = sliderBottom()
            .min(d3.min(times))
            .max(d3.max(times))
            .marks(times)
            .width(300)
            .tickFormat(utcFormatter)
            .tickValues(times)
            .on('onchange', (d) => {
                /* console.log("slider data prev before: ", props.prev_data)
                console.log("slider data curr befre: ", props.curr_data)
                console.log("compare curr data: ", (props.curr_data))
                console.log("compare utc data: ", dict_of_data[utcFormatter(d)])
                if (JSON.stringify(props.curr_data) != JSON.stringify(dict_of_data[utcFormatter(d)])) {
                    console.log("HERE")
                    console.log("HERE PREV: ", props.curr_data)
                    console.log("HERE CURR: ", utcFormatter(d), dict_of_data[utcFormatter(d)])
                    props.setPrevData(props.curr_data)
                    props.setCurrData(dict_of_data[utcFormatter(d)])
                    props.setRerenderTreemap(!props.rerender_treemap)
                    props.setNodeRender(false)
                }
                console.log("slider data prev after: ", props.prev_data)
                console.log("slider data curr after: ", props.curr_data) */
                console.log("ON CHANGE: ", dict_of_data[utcFormatter(d)])
                props.setTriggerTransition(dict_of_data[utcFormatter(d)])
                
            })

        var g_slider = svg.append("g")
                        .attr("class", "controls")
                        .attr('transform', `translate(${(props.bubblemap_width / 4)}, ${20})`).call(slider)
    }, []);

    return (
        <React.Fragment>
            <svg ref={svgRef} width={props.bubblemap_width} height={props.slider_height}></svg>
        </React.Fragment>
    );
}



export default Slider;
