import React from 'react';
import * as d3 from 'd3';

import { render } from 'react-dom';

function BubbleMap(props) {
    const svgRef = React.useRef()
    let width = props.width;
    let height = props.height;
    const overTimeOptions = {"delete": 0, "add": 1, "transform": 2}
    var idleTimeout
    function idled() { idleTimeout = null; }
    var stack_of_brushes = []
    var initial_brush = null
    let arr_of_boundaries = null;
    let remapped_x = null;
    let remapped_y = null;
    let min_x = null;
    let max_x = null;
    let min_y = null;
    let max_y = null;
    let min_size = null;
    let max_size = null;
    let margin = 50
    let tsne_min_x = null
    let tsne_max_x = null
    let tsne_min_y = null
    let tsne_max_y = null
    let tsne_min_size = null
    let tsne_max_size = null
    var tsne_remapped_x = null
    var tsne_remapped_y = null
    var tsne_remapped_size = null
    let svg = null
        
    React.useEffect(() => { 
        function updateChartBrush(e) {
            if (e == null) {
                var prev_brush = stack_of_brushes.pop()
                stack_of_brushes.push(prev_brush)
                remapped_x.domain([ prev_brush["min_x"], prev_brush["max_x"] ])
                remapped_y.domain([ prev_brush["min_y"], prev_brush["max_y"] ])
                if (stack_of_brushes.length == 0) {
                    stack_of_brushes.push(initial_brush)
                }
            }
            else if(!e.selection){
                if (!idleTimeout && e != null) {
                    return idleTimeout = setTimeout(idled, 350)
                };
                var prev_brush = stack_of_brushes.pop()
                if (stack_of_brushes.length >= 1) {
                    prev_brush = stack_of_brushes.pop()
                }
                remapped_x.domain([ prev_brush["min_x"], prev_brush["max_x"] ])
                remapped_y.domain([ prev_brush["min_y"], prev_brush["max_y"] ])
                if (stack_of_brushes.length == 0) {
                    stack_of_brushes.push(initial_brush)
                }
                
            }
            else{
                var new_brush = {"min_x": remapped_x.invert(e.selection[0][0]), 
                "max_x": remapped_x.invert(e.selection[1][0]), 
                "min_y": remapped_y.invert(e.selection[0][1]), 
                "max_y": remapped_y.invert(e.selection[1][1]),
                "e": e}
                stack_of_brushes.push(new_brush)
                remapped_x.domain([ new_brush["min_x"], new_brush["max_x"] ])
                remapped_y.domain([ new_brush["min_y"], new_brush["max_y"] ])
                svg.select(".brush").call(brush.move, null) 
                
            }
            props.setZoomInfo(stack_of_brushes)
            
            svg
            .selectAll("circle")
            .attr("cx", function (d) {
                return remapped_x(d.x); } )
            .attr("cy", function (d) { 
                return remapped_y(d.y); } )



            svg
            .selectAll(".label_text_class")
            .attr("dx", function (d) {

                return remapped_x(d.x); } )
            .attr("dy", function (d) { 
                return remapped_y(d.y); } )

        }  
        if (props.zoom_info != null && props.zoom_info.length > 1) {
            updateChartBrush(null)
        }  

        if (!props.initial_bubble_map_render) {
            svg = d3.select(svgRef.current)
            .attr("x", props.treemap_width + 25)
            .attr("y", 50)
            .attr("viewBox", [0.5, -30.5, width, height + 30])
            .attr("width", width)
            .attr("height", height)
            .style("font", "10px sans-serif")
            .style("float", "right");

            svg.on("mouseover", (event, d) => {
                height += 100
                width += 100
                svg.attr("height", height).attr("width", width)
            })
            .on("mouseout", (event, d) => {
                height -= 100
                width -= 100
                svg.attr("height", height).attr("width", width)
            })

            svg.selectAll("rect").remove();
            svg.selectAll("g").remove();

            var brush = d3.brush()               
            .extent( [ [0,0], [width,height] ] ) 
            .on("end", function (e) {
                updateChartBrush(e)

            })
            svg.append("g").attr("class", "brush").call(brush);
            svg.select(".brush").append("g").attr("class", "g_circle")
            props.setInitialBubbleMapRender(true)
            

        }

        if (props.initial_bubble_map_render && !props.node_render) {
            svg = d3.select(svgRef.current)
                        
            var dict_of_prev_subreddits_to_change = {}

            var nodes = []
            var arr_of_tsne_boundaries = []
            let dict_of_subreddits_to_change = {}
            console.log("bubble map data:" , props.curr_data)
            var curr_root = d3.hierarchy(props.curr_data)
            var curr_nodes = curr_root.descendants()
            if (props.prev_data != null) {   
                var prev_root = d3.hierarchy(props.prev_data)
                var prev_nodes = prev_root.descendants()                
                for (const prev_node in prev_nodes) {
                    dict_of_prev_subreddits_to_change[prev_nodes[prev_node].data.subreddit] ={"node": prev_nodes[prev_node], "change": overTimeOptions["add"]}
                }
                for (const curr_node in curr_nodes) {
                    if (curr_nodes[curr_node].data.hasOwnProperty("tsne_x") && curr_nodes[curr_node].data.node_id.includes("_")) {
                        if (curr_nodes[curr_node].data.subreddit in dict_of_prev_subreddits_to_change) {
                            dict_of_subreddits_to_change[curr_nodes[curr_node].data.subreddit] = {"node": curr_nodes[curr_node], "change": overTimeOptions["transform"]}
                        }
                        else {
                            dict_of_subreddits_to_change[curr_nodes[curr_node].data.subreddit] ={"node": curr_nodes[curr_node], "change": overTimeOptions["add"]}
                        }
                        
                    }
                }
                Object.keys(dict_of_prev_subreddits_to_change).forEach(function(prev_subreddit) {
                    if (!(prev_subreddit in dict_of_subreddits_to_change)) {
                        
                        dict_of_subreddits_to_change[prev_subreddit] = {"node": dict_of_prev_subreddits_to_change[prev_subreddit]["node"], "change": overTimeOptions["delete"]}
                    }
                }); 
                
            }
            else {
                for (const curr_node in curr_nodes) {
                    dict_of_subreddits_to_change[curr_nodes[curr_node].data.subreddit] ={"node": curr_nodes[curr_node], "change": overTimeOptions["add"]}
                }
            }
            var arr_of_curr_results = append_data(props.curr_data, nodes, arr_of_tsne_boundaries, svg, dict_of_subreddits_to_change)
            nodes = arr_of_curr_results[0]
            dict_of_prev_subreddits_to_change = arr_of_curr_results[1]
            arr_of_tsne_boundaries = arr_of_curr_results[2]



            const boundary_nodes = []

            for (const node in nodes) {
                if ((nodes[node].data.hasOwnProperty("tsne_x") && nodes[node].data.node_id.includes("_")) && (dict_of_prev_subreddits_to_change[nodes[node].data.subreddit]["change"] == overTimeOptions["add"] || dict_of_prev_subreddits_to_change[nodes[node].data.subreddit]["change"] == overTimeOptions["transform"])) {
                    boundary_nodes.push(nodes[node])
                }
            }
            arr_of_boundaries = get_boundaries(boundary_nodes, "x");
            min_x = arr_of_boundaries[0];
            max_x = arr_of_boundaries[1];
            min_y = arr_of_boundaries[2];
            max_y = arr_of_boundaries[3];
            min_size = arr_of_boundaries[4];
            max_size = arr_of_boundaries[5];
            remapped_x = d3.scaleLinear()
                .domain([min_x, max_x])
                .range([ 0, width - margin ])
            remapped_y = d3.scaleLinear()
                .domain([min_y, max_y])
                .range([ 0, height - margin - 100])
            initial_brush = {"min_x": min_x, "max_x": max_x, "min_y": min_y, "max_y": max_y}
 
            if (props.zoom_info == null) {
                stack_of_brushes = [initial_brush]
            }
            else {
        
                stack_of_brushes = props.zoom_info
            }
                
            function updateChart(e) {
                var newX = e.transform.rescaleX(remapped_x);
                var newY = e.transform.rescaleY(remapped_y);
                svg.selectAll("circle")
                    .attr('cx', function(d) {
                        return newX(d.x)})
                    .attr('cy', function(d) {return newY(d.y)});

                svg.selectAll("text")
                    .attr("dx", function (d) {
                        return newX(d.x); } )
                    .attr("dy", function (d) { 
                        return newY(d.y); } )
            }

            props.setNodeRender(true)

        } 

        if (props.node_render && props.labels != null) {
            svg = d3.select(svgRef.current)

            if (!svg.selectAll(".label_text_class").empty()) {
                svg.selectAll(".label_text_class").remove()
            }
            svg.selectAll(".circle_class").attr("fill", "#808080")
            let node_id_to_nodes = {}
        
            for (let i = 0; i < props.labels.length - 1; i++) {
                let node = props.labels[i]
                let render_node = null
                if (node.parent != null) {
                    if (node.data.node_id.includes("_")) {
                        render_node = node.parent
                    }
                    else {
                        render_node = node
                    }
                }
                else {
                    render_node = node
                }
                tsne_remapped_x = props.tsne_remapped["tsne_remapped_x"]
                tsne_remapped_y = props.tsne_remapped["tsne_remapped_y"]
                render_labels_treemap(tsne_remapped_x(render_node.data.tsne_x), tsne_remapped_y(render_node.data.tsne_y), svg, render_node, node_id_to_nodes)

            }

            props.setBubbleMapSvg(svg)
        }
        
        
        
        
    }, [props.node_render, props.labels]);
    function append_data(data, prev_nodes, prev_arr_of_tsne_boundaries, svg, dict_of_subreddits_to_change) {
        const root = d3.hierarchy(data);
        svg.selectAll(".g_text_class").remove()
        if (svg.selectAll(".g_text_class").empty()) {
            root.eachBefore(node => create_group(svg, node, root, "g_text_class"))
        }
        
        
        var nodes = root.descendants();
        var leaves = root.leaves()

        const arr_of_tsne_boundaries =  get_boundaries(nodes, "tsne_x");

        const max_range_arr_of_tsne_boundaries = arr_of_tsne_boundaries

        if (prev_arr_of_tsne_boundaries.length == arr_of_tsne_boundaries.length) {
            max_range_arr_of_tsne_boundaries[0] = Math.max(arr_of_tsne_boundaries[0], prev_arr_of_tsne_boundaries[0])
            max_range_arr_of_tsne_boundaries[1] = Math.max(arr_of_tsne_boundaries[1], prev_arr_of_tsne_boundaries[1])
            max_range_arr_of_tsne_boundaries[2] = Math.max(arr_of_tsne_boundaries[2], prev_arr_of_tsne_boundaries[2])
            max_range_arr_of_tsne_boundaries[3] = Math.max(arr_of_tsne_boundaries[3], prev_arr_of_tsne_boundaries[3])
        }
        
        tsne_min_x = max_range_arr_of_tsne_boundaries[0];
        tsne_max_x = max_range_arr_of_tsne_boundaries[1];
        tsne_min_y = max_range_arr_of_tsne_boundaries[2];
        tsne_max_y = max_range_arr_of_tsne_boundaries[3];
        tsne_min_size = max_range_arr_of_tsne_boundaries[4];
        tsne_max_size = max_range_arr_of_tsne_boundaries[5];
        margin = 50
        tsne_remapped_x = d3.scaleLinear()
            .domain([tsne_min_x, tsne_max_x])
            .range([ 0, width - margin ]);
        tsne_remapped_y = d3.scaleLinear()
            .domain([tsne_min_y, tsne_max_y])
            .range([ height - margin - 100, 0]);
        props.tsne_remapped["tsne_remapped_x"] = tsne_remapped_x
        props.tsne_remapped["tsne_remapped_y"] = tsne_remapped_y
        tsne_remapped_size = d3.scaleLinear()
            .domain([tsne_min_size, tsne_max_size])
            .range([ 5, 20 ]);
        Object.keys(dict_of_subreddits_to_change).forEach(function(subreddit) {
            var node = dict_of_subreddits_to_change[subreddit]["node"]
 
            if (node.data.hasOwnProperty("tsne_x") && node.data.node_id.includes("_")) {
                var change = dict_of_subreddits_to_change[subreddit]["change"]
                var parent = node.parent.data
                render_nodes_treemap(tsne_remapped_x(node.data.tsne_x), tsne_remapped_y(node.data.tsne_y), 5, svg, node.data, change, parent);
            }
        })

        
        return [nodes, dict_of_subreddits_to_change, arr_of_tsne_boundaries]

    }


    function render_nodes_treemap(x, y, size, svg, node, change, parent) {
        node["x"] = x
        node["y"] = y
        node["resized_subreddit_count"] = size
        if (change == overTimeOptions["add"]) {
            const circle = svg.select(".g_circle")
            .append("circle")
                .attr("class", "circle_class" + " " + node.subreddit + " " +  "node_id_" + node.node_id + " " + "parent_" + parent.node_id)
                .attr("id", "circle_class_" + node.subreddit)
                .data([node])
                .attr("cx", x)
                .attr("cy", y)
                .attr("fill", "#808080")
                .attr("opacity", 0.25)
                .attr("r", size)
                .attr("stroke", "black")
                .style("stroke-width", 1)
                .style("stroke-opacity", 0)
                
        
        }
        if (change == overTimeOptions["transform"]) {
            svg.select("#circle_class_" + node.subreddit)
                .classed("parent_" + parent.node_id, true)
                .transition()
                .duration(5000)
                .attr("cx", x)
                .attr("cy", y)
                .attr("fill", node.color)
                .attr("r", size)
        }
        if (change == overTimeOptions["delete"]) {
            svg.select("#circle_class_" + node.subreddit).remove()
        }
        
    }


    function render_labels_treemap(x, y, svg, node, node_id_to_nodes) {
        node["x"] = x
        node["y"] = y
        node["clicked"] = false
        var format = d3.format(",");

        var g_text = svg.select("#g_text_class_" + node.data.node_id)
        g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
                        svg.select("#circle_class_" + d.classList[2])
                        .attr('fill', (d) => {
                            return d.color});
                        
                    });        
                    
        if (svg.select("#label_text_class_" + node.data.node_id).empty()) {
            g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
                if (!(node.data.node_id in node_id_to_nodes)) {
                    node_id_to_nodes[node.data.node_id] = {}
                }
                if (!(node.parent.data.node_id in node_id_to_nodes)) {
                    node_id_to_nodes[node.parent.data.node_id] = {}
                }
                node_id_to_nodes[node.data.node_id][d.classList[2]] = {"selection": svg.select("#circle_class_" + d.classList[2]), "color": svg.select("#circle_class_" + d.classList[2]).attr("fill")}
                node_id_to_nodes[node.parent.data.node_id][d.classList[2]] = {"selection": svg.select("#circle_class_" + d.classList[2]), "color": svg.select("#circle_class_" + d.classList[2]).attr("fill")}
            });
            g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
                svg.select("#circle_class_" + d.classList[2])
                .attr('fill', (d) => {
                    return d.color})
                
            })
            
            g_text.append("text")
                .attr("class", "label_text_class")
                .attr("id", "label_text_class_" + node.data.node_id)
                .data([node])
                .attr("dx", x)
                .attr("dy", y)
                .attr("fill", "black")
                .attr("stroke", "black")
                .style("stroke-width", .1)
                .text(() => {
                    return node.data.taxonomy_label
                })
                .on("mouseover", (event) => {
                    g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
                        svg.select("#circle_class_" + d.classList[2])
                        .attr('fill', () => {
                            return "yellow"});
                        
                    });
         
                })
                .on("mousemove", (event) => {

                    g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
                        svg.select("#circle_class_" + d.classList[2])
                        .attr('fill', () => {
                            return "yellow"});
                        
                    });

                })
                .on("mouseout", (d) => {
                    g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
                        svg.select("#circle_class_" + d.classList[2])
                        .attr('fill', (d) => {
                            return d.color});
                        
                    });

                })
                .on("click", (d, i) => {
                    if (node.data.clicked == true) {
                        g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
                            svg.select("#circle_class_" + d.classList[2])
                            .style("opacity", .25).style("stroke-opacity", 0)  
                        });
                        node.data.clicked = false
                    
                    }
                    else {
                        g_text.selectAll(".circle_text_class")._groups[0].forEach(function(d) {
                            svg.select("#circle_class_" + d.classList[2])
                            .style("opacity", 1).style("stroke-opacity", 1) 
                        });
                        node.data.clicked = true
                    

                    }
                    
                })



        }  
        
             

    }


    // finds the min and max values of the given property or key of all the data stored in the given elements
    function get_boundaries(elements, property) {
        var min_x = null;
        var max_x = null;
        var min_y = null;
        var max_y = null;
        var min_size = null;
        var max_size = null;
        var total_x = 0
        var total_y = 0
        var num_circles = 0

        elements.forEach((element) => {
            if (element.data.hasOwnProperty(property)) {
                var tsne_x = element.data.tsne_x;
                var tsne_y = element.data.tsne_y;
                
                if (property == "x") {
                    tsne_x = element.data.x;
                    tsne_y = element.data.y;
                }
                
                const size = element.data.subreddit_count;

                min_x = find_min(min_x, tsne_x)
                max_x = find_max(max_x, tsne_x)

                min_y = find_min(min_y, tsne_y)
                max_y = find_max(max_y, tsne_y)

                min_size = find_min(min_size, size)
                max_size = find_max(max_size, size)
                
            }
        

        })
        return [min_x, max_x, min_y, max_y, min_size, max_size]
    }

    function find_min(curr_min, value) {
        if (typeof value == "string") {
            value = Number(value)

        }
        if (curr_min == null) {
            curr_min = value
        }
        if (value < curr_min) {
            curr_min = value
        }

        return curr_min
    }

    function find_max(curr_max, value) {
        if (curr_max == null) {
            curr_max = value
        }
        if (value > curr_max) {
            curr_max = value
        }

        return curr_max
    }
    
    function create_group(svg, node, root, prefix) {
        if (node.data.node_id == root.data.node_id) {
            svg.select(".brush").append("g").attr("class", prefix).attr("id", prefix + "_" + node.data.node_id)
        }
        else if (node.parent.data.node_id == root.data.node_id) {
            svg.select("#" + prefix + "_" + root.data.node_id)
                .append("g")
                    .attr("class", prefix)
                    .attr("id", prefix + "_" + node.data.node_id)
        }
        
        else {
            if (node.data.node_id.includes("_")) {
                svg.select("#" + prefix + "_" + node.parent.data.node_id)
                .append("g")
                    .attr("class", prefix + " " + "circle_text_class" + " " + node.data.subreddit)
                    .attr("id", prefix + "_" + node.data.subreddit)
            }
            else {
                svg.select("#" + prefix + "_" + node.parent.data.node_id)
                .append("g")
                    .attr("class", prefix)
                    .attr("id", prefix + "_" + node.data.node_id)
            }

            
        }
    }

    

    function get_parent(selection, level) {
        var curr_selection = selection;
        while (level > 0) {
            curr_selection = curr_selection.parentElement
            level--;
        }
        return curr_selection
    }



    return (
        <React.Fragment>
            <svg ref={svgRef}></svg>
        </React.Fragment>
    );
}

export default BubbleMap;
