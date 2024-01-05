import React from 'react';
import * as d3 from 'd3';
import data_5 from "./data/RC_2021-05_KMeans_Agglom_100_Clusters_Cut.json"
import data_6 from "./data/RC_2021-06_KMeans_Agglom_100_Clusters_Cut_Tsne.json"
import {Library} from '@observablehq/stdlib';


function Treemap(props) {
    const svgRef = React.useRef();
    let width = props.width;
    let height = props.height;
    const library = new Library();
    



    React.useEffect(() => {

        if (props.initial_bubble_map_render) {
            props.setLabels(null)
        
            const x = d3.scaleLinear().rangeRound([0, width]);
            const y = d3.scaleLinear().rangeRound([0, height]);
            
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

            
            const treemap_data = treemap(props.curr_data)
            
            const svg = d3.select(svgRef.current)
                .attr("x", 25)
                .attr("y", 50)
                .attr("height", height)
                .attr("width", width)
                .attr("viewBox", [0.5, -30.5, width , height + 30])
                .style("font", "10px sans-serif")
                .style("float", "left").style("display", "inline-block")

            svg.selectAll("g").remove();

            let group = svg.append("g")
                .call(render, treemap_data);

            function render(group, root) {
                var data = root.children.concat(root)
                data.forEach((d) => {
                    d.data["clicked"] = false
                })
                

                const node = group
                    .selectAll("g")
                    .attr("class", "node_group")
                    .data(data)
                    .join("g")
                    .on("mouseenter", (event, d) => {
                        props.setHandleTooltipEvent(event)
                        props.setHandleTooltipNode(d)
                        props.setTooltipIsMouseEnter(true)
                    })
                    .on("mousemove", (event, d) => {
                        props.setHandleTooltipEvent(event)
                        props.setHandleTooltipNode(d)
                        props.setTooltipIsMouseEnter(false)
                        props.setHighlightLabel(d)
                    })
                    .on("mouseout", (event, d) => {
                        props.setHandleTooltipEvent(null)
                        props.setHandleTooltipNode(null)
                        props.setTooltipIsMouseEnter(false)
                        svg.selectAll("#g_rect_tooltip").remove()
                        svg.selectAll("#rect_tooltip").remove()
                        svg.selectAll("#text_tooltip").remove()   
                        svg.selectAll("#thumbnail").remove()  
                        svg.selectAll("#text_tooltip").attr("opacity", 0)  
                        props.setHighlightLabel(null)
                    })
                    .on("click", (event, d) => {
                        d.data.clicked = !d.data.clicked
                        
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
            
            
                node.append("rect")
                    .attr("id", d => (d.leafUid = library.DOM.uid("leaf")).id)
                    .attr("fill", (d) => {
                        if (d.data.taxonomy_label.length === 0) {
                            return "white"
                        }
                        return d.data.color
                    })
                    .attr("opacity", 0.5)
                    .attr("stroke", "#fff")
                    

                    
            
                node.append("clipPath")
                    .attr("id", d => (d.clipUid = library.DOM.uid("clip")).id)
                .append("use")
                    .attr("xlink:href", d => d.leafUid.href);
            
                node.append("text")
                    .attr("id", (d) => {
                        return "taxonomy_label_text_" + d.data.node_id
                    })
                    .attr("class", "taxonomy_label_text")
                    .attr("clip-path", d => d.clipUid)
                    .attr("font-weight", d => d === root ? "bold" : null)
                    .selectAll("tspan")
                    .data(d => (d.data.hasOwnProperty("children") ? d.data.taxonomy_label : d.data.subreddit).split(/(?=[A-Z][^A-Z])/g))
                    .join("tspan")
                    .attr("x", 3)
                    .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
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
            props.setTreemapSvg(svg)
        }

        


        
    }, [props.initial_bubble_map_render, props.rerender_treemap]);

    return (
        <React.Fragment>
            <svg ref={svgRef}></svg>
        </React.Fragment>
    );
}



export default Treemap;