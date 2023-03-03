import React from 'react';
import * as d3 from 'd3';
import data_5 from "./data/RC_2021-05_KMeans_Agglom_100_Clusters_Cut.json"
import data_6 from "./data/RC_2021-06_KMeans_Agglom_100_Clusters_Cut_Tsne.json"

import {Library} from '@observablehq/stdlib';


function Treemap(props) {
    const svgRef = React.useRef();
    /* const width = 954;
    const height = 924; */
    const width = props.width;
    const height = props.height;
    const library = new Library();
    



    React.useEffect(() => {

        
        if (props.initial_bubble_map_render) {
            props.setLabels(null)
        
            const x = d3.scaleLinear().rangeRound([0, width]);
            const y = d3.scaleLinear().rangeRound([0, height]);
            const format = d3.format(",d");
            function tile(node, x0, y0, x1, y1) {
                d3.treemapBinary(node, 0, 0, width, height);
                for (const child of node.children) {
                    child.x0 = x0 + child.x0 / width * (x1 - x0);
                    child.x1 = x0 + child.x1 / width * (x1 - x0);
                    child.y0 = y0 + child.y0 / height * (y1 - y0);
                    child.y1 = y0 + child.y1 / height * (y1 - y0);
                }
            }


            const treemap = data => d3.treemap()
                .tile(tile)
                (d3.hierarchy(data)
                .sum(d => Math.sqrt(d.subreddit_count))
                .sort((a, b) => Math.sqrt(b.subreddit_count) - Math.sqrt(a.subreddit_count)));

            
            // hierarchy 
            const treemap_data = treemap(props.curr_data)
            
            const node_id = d => d.ancestors().reverse().map((d) => {
                if (d.data.node_id.includes("_")) {
                    return d.data.subreddit
                }
                else {
                    return d.data.taxonomy_label
                }
    
            }).join(".") 
            


            
            const svg = d3.select(svgRef.current)
                .attr("x", 25)
                .attr("y", 50)
                .attr("viewBox", [0.5, -30.5, width, height + 30])
                .style("font", "10px sans-serif")
                .style("float", "left").style("display", "inline-block");


            svg.selectAll("g").remove();

            let group = svg.append("g")
                .call(render, treemap_data);

            
            /* var tooltip = svg.append("g").attr("id", "g_tooltip")
            svg.select("#g_tooltip").append("rect")
            .attr("opacity", 0)
            .attr("id", "rect_tooltip")
            .attr("x", 5)
            .attr("y", 5)
            .attr("width", 50)
            .attr("height", 50)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-linejoin", "round")

            svg.select("#g_tooltip")
                .append("text")
                    .attr("id", "text_tooltip")
                    .attr("opacity", 0)
                    .attr("fill", "black")
                    .attr("x", 5)
                    .attr("y", 5)
                    .text("test") */

            svg
                .append("text")
                    .attr("id", "text_tooltip")
                    .attr("opacity", 0)
                    .attr("fill", "black")
                    .attr("x", 5)
                    .attr("y", 5)
                    .text("test")

            
            

            function render(group, root) {
                var data = root.children.concat(root)
                data.forEach((d) => {
                    d.data["clicked"] = false
                })
                function handleTooltip(event, d) {
                    svg.select("#text_tooltip")
                        .attr("x", (d3.pointer(event)[0]-25))
                        .attr("y", (d3.pointer(event)[1]-5))
                        .text(() => {
                            if (d.data.node_id.includes("_")) {
                                return `${node_id(d)}\n${format(d.data.subreddit_count)}`
                            }
                            return `${node_id(d)}\n${format(d.data.cluster_subreddit_count)}`
                        })
                    const boundingBox = svg.select("#text_tooltip").node().getBBox()
                    let rect_tooltip = null
                    if (svg.select("#rect_tooltip").empty()) {
                        rect_tooltip = svg.append("rect")
                            .attr("id", "rect_tooltip")
                    }
                    else {
                        rect_tooltip = svg.select("#rect_tooltip")
                    }
                    rect_tooltip
                        .attr("fill", "white")
                        .attr("stroke", "black")
                        .attr("stroke-linejoin", "round")
                        .attr("opacity", 1)
                        .attr("x", boundingBox.x - 2.5)
                        .attr("y", boundingBox.y - 2.5)
                        .attr("width", boundingBox.width + 5)
                        .attr("height", boundingBox.height + 5)

                    let text_tooltip = null
                    if (svg.select("#temp_text_tooltip").empty()) {
                        text_tooltip = svg.append("text")
                            .attr("id", "temp_text_tooltip")
                    }
                    else {
                        text_tooltip = svg.select("#temp_text_tooltip")
                    }
                    text_tooltip
                        .attr("fill", "black")
                        .attr("x", (d3.pointer(event)[0]-25))
                        .attr("y", (d3.pointer(event)[1]-5))
                        .text(() => {
                            if (d.data.node_id.includes("_")) {
                                return `${node_id(d)}\n\n${format(d.data.subreddit_count)}`
                            }
                            return `${node_id(d)}\n\n${format(d.data.cluster_subreddit_count)}`
                        })

                }
                const node = group
                    .selectAll("g")
                    .data(data)
                    .join("g")
                    .on("mouseenter", (event, d) => {
                        props.setHighlightLabel(d.data.node_id)
                        handleTooltip(event, d)
                    })
                    .on("mousemove", (event, d) => {
                        props.setHighlightLabel(d.data.node_id)
                        handleTooltip(event, d)
                    })
                    .on("mouseout", () => {
                        svg.select("#rect_tooltip").remove()
                        svg.select("#temp_text_tooltip").remove()               
                    })
                    .on("click", (event, d) => {
                        d.data.clicked = !d.data.clicked
                        props.setSelectedNodes(d)
                        props.setIsSelected(d.data.clicked)
                        props.setSelectedNodeId(d.data.node_id)
                        
                    })

                    
                    
                node.filter(d => d === root ? d.parent : d.children)
                    .attr("cursor", "pointer")
                    .on("click", (event, d) => {
                        if (d === root) {
                            zoomout(root)
                        }
                        else {
                            zoomin(d)
                        }
                    });
            
                /* node.append("title")
                    .text((d) => {
                        if (d.data.node_id.includes("_")) {
                            return `${node_id(d)}\n${format(d.data.subreddit_count)}`
                        }
                        return `${node_id(d)}\n${format(d.data.cluster_subreddit_count)}`
                    }); */
            
            
            
                node.append("rect")
                    .attr("id", d => (d.leafUid = library.DOM.uid("leaf")).id)
                    .attr("fill", (d) => {
                        return d.data.color
                        /* if(d === root) {
                            return "#fff"
                        } 
                        else {
                            if (d.children) {
                                return "#ccc"
                            } 
                            else {
                                return "#ddd"
                            }
                        } */
                    })
                    .attr("opacity", 0.5)
                    .attr("stroke", "#fff")
                    

                    
            
                node.append("clipPath")
                    .attr("id", d => (d.clipUid = library.DOM.uid("clip")).id)
                .append("use")
                    .attr("xlink:href", d => d.leafUid.href);
            
                node.append("text")
                    .attr("clip-path", d => d.clipUid)
                    .attr("font-weight", d => d === root ? "bold" : null)
                    .selectAll("tspan")
                    .data(d => (d.data.hasOwnProperty("children") ? d.data.taxonomy_label : d.data.subreddit).split(/(?=[A-Z][^A-Z])/g))
                    .join("tspan")
                    .attr("x", 3)
                    .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
                    //.attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
                    .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
                    .text(d => d)
                    
                
                group.call(position, root);
                props.setLabels(data)
                

            }

            function position(group, root) {
    
                group.selectAll("g")
                    .attr("transform", d => d === root ? `translate(0,-30)` : `translate(${x(d.x0)},${y(d.y0)})`)
                .select("rect")
                    .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
                    .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0));
            }
        
            // When zooming in, draw the new nodes on top, and fade them in.
            function zoomin(d) {
                const group0 = group.attr("pointer-events", "none");
                const group1 = group = svg.append("g").call(render, d);
            
                x.domain([d.x0, d.x1]);
                y.domain([d.y0, d.y1]);
            
                svg.transition()
                    .duration(750)
                    .call(t => group0.transition(t).remove()
                        .call(position, d.parent))
                    .call(t => group1.transition(t)
                        .attrTween("opacity", () => d3.interpolate(0, 1))
                        .call(position, d));
            }
        
            // When zooming out, draw the old nodes on top, and fade them out.
            function zoomout(d) {
                const group0 = group.attr("pointer-events", "none");
                const group1 = group = svg.insert("g", "*").call(render, d.parent);
            
                x.domain([d.parent.x0, d.parent.x1]);
                y.domain([d.parent.y0, d.parent.y1]);
            
                svg.transition()
                    .duration(750)
                    .call(t => group0.transition(t).remove()
                        .attrTween("opacity", () => d3.interpolate(1, 0))
                        .call(position, d))
                    .call(t => group1.transition(t)
                        .call(position, d.parent));
            }
        }

        
    }, [props.initial_bubble_map_render]);

    return (
        <React.Fragment>
            <svg ref={svgRef} width={width} height={height}></svg>
        </React.Fragment>
    );
}



export default Treemap;
