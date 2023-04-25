import React from 'react';
import * as d3 from 'd3';
import data_4 from "./data/RC_2021-04.json"
import data_5 from "./data/RC_2021-05.json"
import data_6 from "./data/RC_2021-06.json"
import data_7 from "./data/RC_2022-02.json"
import { sliderBottom } from 'd3-simple-slider';

function Slider(props) {
    const svgRef = React.useRef()
    const dict_of_data = {"2021-04": data_4, "2021-05": data_5, "2021-06": data_6, "2021-07": data_7}
    const overTimeOptions = {"delete": 0, "add": 1, "transform": 2}
    const width = (props.treemap_width + props.bubblemap_width) 
    const height = Math.max(props.treemap_height, props.bubblemap_height)
    const times = d3.utcMonth.range(Date.UTC(2021, 3), Date.UTC(2021, 7))
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
