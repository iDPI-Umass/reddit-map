import React from 'react';
import * as d3 from 'd3';
import data_4 from "./data/RC_2021-04_KMeans_Agglom_100_Clusters.json"
import data_5 from "./data/RC_2021-05_KMeans_Agglom_100_Clusters_Cut.json"
import data_6 from "./data/RC_2021-06_KMeans_Agglom_100_Clusters_Cut_Tsne.json"
import { sliderBottom } from 'd3-simple-slider';

import { render } from 'react-dom';

function BubbleMapTranslate(props) {
    const svgRef = React.useRef()
    //const width = 1200
    const width = props.width;
    const height = props.height;
    const dict_of_data = {4: data_4, 6: data_5, 5: data_6}
    const test_data = data_6
    const overTimeOptions = {"delete": 0, "add": 1, "transform": 2}
    //const months = [2021-04, 2021-05, 2021-06]
    
    // note: might need to make changes later to add more groupings to add interactions with other clusters
    React.useEffect(() => {
        
        var brush = d3.brush()                 // Add the brush feature using the d3.brush function
            .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
            .on("end", function (e) {
                updateChartBrush(e)

            })

       
        var dict_of_prev_subreddits_to_change = {}
        
        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0.5, -30.5, width, height + 30])
            .style("font", "10px sans-serif")
            .style("float", "right");

        svg.selectAll("rect").remove();
        svg.selectAll("g").remove();

        svg.append("g").attr("class", "brush").call(brush);
        svg.select(".brush").append("g").attr("class", "g_circle")
        


      /*   
        var clip = svg.append("defs").append("SVG:clipPath")
        .attr("id", "clip")
        .append("SVG:rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0); */

        var tooltip = svg.append("g").attr("class", "tooltip").attr("id", "g_tooltip")
        svg.select("#g_tooltip").append("rect")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .attr("id", "rect_tooltip")
        .attr("rx", 5)
        .attr("ry", 5)
        .style("fill", "white")
        .style("stroke", "black")
        .style("stroke-linejoin", "round")

        svg.select("#g_tooltip")
            .append("text")
                .attr("class", "tooltip")
                .attr("id", "text_tooltip")
                .attr("opacity", 0)
                .text("")

        var highlight_label = svg.append("g").attr("class", "highlight_label").attr("id", "g_highlight_label")
        svg.select("#g_highlight_label").append("rect")
        .style("opacity", 0)
        .attr("class", "highlight_label")
        .attr("id", "rect_highlight_label")
        .attr("rx", 5)
        .attr("ry", 5)
        .style("fill", "white")
        .style("stroke", "black")
        .style("stroke-linejoin", "round")

        svg.select("#g_highlight_label")
            .append("text")
                .attr("class", "highlight_label")
                .attr("id", "text_highlight_label")
                .attr("opacity", 0)
                .text("")

        var nodes = []
        var arr_of_tsne_boundaries = []    
        var arr_of_results = append_data(5, dict_of_data[5], nodes, arr_of_tsne_boundaries, svg, tooltip, dict_of_prev_subreddits_to_change)
        nodes = arr_of_results[0]
        dict_of_prev_subreddits_to_change = arr_of_results[1]
        arr_of_tsne_boundaries = arr_of_results[2]   
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

        const boundary_nodes = []

        for (const node in nodes) {
            if ((nodes[node].data.hasOwnProperty("tsne_x") && nodes[node].data.node_id.includes("_")) && (dict_of_prev_subreddits_to_change[nodes[node].data.subreddit]["change"] == overTimeOptions["add"] || dict_of_prev_subreddits_to_change[nodes[node].data.subreddit]["change"] == overTimeOptions["transform"])) {
                boundary_nodes.push(nodes[node])
            }
        }
        const arr_of_boundaries = get_boundaries(boundary_nodes, "x");
        const min_x = arr_of_boundaries[0];
        const max_x = arr_of_boundaries[1];
        const min_y = arr_of_boundaries[2];
        const max_y = arr_of_boundaries[3];
        const min_size = arr_of_boundaries[4];
        const max_size = arr_of_boundaries[5];
        const margin = 50
        var remapped_x = d3.scaleLinear()
            .domain([min_x, max_x])
            .range([ 0, width - margin ]);
        var remapped_y = d3.scaleLinear()
            .domain([min_y, max_y])
            .range([ 0, height - margin - 100]);
            
        function updateChart(e) {
            // recover the new scale
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


        var idleTimeout
        function idled() { idleTimeout = null; }
        var initial_brush = {"min_x": min_x, "max_x": max_x, "min_y": min_y, "max_y": max_y}
        var stack_of_brushes = null
        if (props.zoom_info_treemap == null) {
            stack_of_brushes = [initial_brush]
        }
        else {

            stack_of_brushes = props.zoom_info_treemap
        }
        

        // e, remapped_x, remapped_y
        function updateChartBrush(e) {
            
            // If no selection, back to initial coordinate. Otherwise, update X axis domain
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
                svg.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
                
            }
            props.set_zoom_info(stack_of_brushes)

            // Update axis and circle position


            
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

            /*

            svg
            .selectAll(".label_rect_class")
            .attr("x", function (d) {
                return remapped_x(d.x - 2.5); } )
            .attr("y", function (d) { 
                return remapped_y(d.y - 2.5); } ) */



        }


        if (props.zoom_info_treemap != null && props.zoom_info_treemap.length > 1) {
            updateChartBrush(null)
            /* if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
            var prev_brush = props.zoom_info_treemap.pop()
            stack_of_brushes = props.zoom_info_treemap
            remapped_x.domain([ prev_brush["min_x"], prev_brush["max_x"] ])
            remapped_y.domain([ prev_brush["min_y"], prev_brush["max_y"] ])
            if (stack_of_brushes.length == 0) {
                stack_of_brushes.push(initial_brush)
                props.set_zoom_info(stack_of_brushes)
            }
             */


        }
        
        
        
    }, [props.treemap_labels, props.selected_labels_treemap, props.is_selected_treemap, props.selected_node_id_treemap]);
    function append_data(temp_data_num, data, prev_nodes, prev_arr_of_tsne_boundaries, svg, tooltip, dict_of_prev_subreddits_to_change, highlight_label) {
        /* if (!svg.selectAll("circle").empty()) {
            svg.selectAll("circle").style("opacity", .25).style("stroke-opacity", 0)
        } */
        const root = d3.hierarchy(data);
        if (svg.selectAll(".g_text_class_" + temp_data_num).empty()) {
            root.eachBefore(node => create_group(svg, node, root, "g_text_class_" + temp_data_num, temp_data_num))
        }
        
        var nodes = root.descendants();
        var leaves = root.leaves()
        var set_of_parents = new Set()
        for (let i = 0; i < leaves.length; i++) {
            set_of_parents.add(leaves[i].parent)
        }

        var dict_of_subreddits_to_change = {}
        
        
        for (const node in nodes) {
            if (nodes[node].data.hasOwnProperty("tsne_x") && nodes[node].data.node_id.includes("_")) {
                if (nodes[node].data.subreddit in dict_of_prev_subreddits_to_change) {
                    if (dict_of_prev_subreddits_to_change[nodes[node].data.subreddit]["change"] != overTimeOptions["delete"]) {
                        dict_of_subreddits_to_change[nodes[node].data.subreddit] = {"node": nodes[node], "change": overTimeOptions["transform"]}
                    }
                    else {
                        dict_of_subreddits_to_change[nodes[node].data.subreddit] ={"node": nodes[node], "change": overTimeOptions["add"]}
                    }
                }
                else {
                    dict_of_subreddits_to_change[nodes[node].data.subreddit] ={"node": nodes[node], "change": overTimeOptions["add"]}
                }
                
            }
        }

        Object.keys(dict_of_prev_subreddits_to_change).forEach(function(prev_subreddit) {
            if (!(prev_subreddit in dict_of_subreddits_to_change) && dict_of_prev_subreddits_to_change[prev_subreddit]["change"] != overTimeOptions["delete"]) {
                
                dict_of_subreddits_to_change[prev_subreddit] = {"node": dict_of_prev_subreddits_to_change[prev_subreddit]["node"], "change": overTimeOptions["delete"]}
            }
        });

        

        const arr_of_tsne_boundaries =  get_boundaries(nodes, "tsne_x");

        const max_range_arr_of_tsne_boundaries = arr_of_tsne_boundaries

        if (prev_arr_of_tsne_boundaries.length == arr_of_tsne_boundaries.length) {
            max_range_arr_of_tsne_boundaries[0] = Math.max(arr_of_tsne_boundaries[0], prev_arr_of_tsne_boundaries[0])
            max_range_arr_of_tsne_boundaries[1] = Math.max(arr_of_tsne_boundaries[1], prev_arr_of_tsne_boundaries[1])
            max_range_arr_of_tsne_boundaries[2] = Math.max(arr_of_tsne_boundaries[2], prev_arr_of_tsne_boundaries[2])
            max_range_arr_of_tsne_boundaries[3] = Math.max(arr_of_tsne_boundaries[3], prev_arr_of_tsne_boundaries[3])
        }
        
        const tsne_min_x = max_range_arr_of_tsne_boundaries[0];
        const tsne_max_x = max_range_arr_of_tsne_boundaries[1];
        const tsne_min_y = max_range_arr_of_tsne_boundaries[2];
        const tsne_max_y = max_range_arr_of_tsne_boundaries[3];
        const tsne_min_size = max_range_arr_of_tsne_boundaries[4];
        const tsne_max_size = max_range_arr_of_tsne_boundaries[5];
        const margin = 50
        var tsne_remapped_x = d3.scaleLinear()
            .domain([tsne_min_x, tsne_max_x])
            .range([ 0, width - margin ]);
        var tsne_remapped_y = d3.scaleLinear()
            .domain([tsne_min_y, tsne_max_y])
            .range([ height - margin - 100, 0]);
        var tsne_remapped_size = d3.scaleLinear()
            .domain([tsne_min_size, tsne_max_size])
            .range([ 5, 20 ]);
        Object.keys(dict_of_subreddits_to_change).forEach(function(subreddit) {
            var node = dict_of_subreddits_to_change[subreddit]["node"]
 
            if (node.data.hasOwnProperty("tsne_x") && node.data.node_id.includes("_")) {
                var change = dict_of_subreddits_to_change[subreddit]["change"]
                var parent = node.parent.data
                render_nodes_treemap(tsne_remapped_x(node.data.tsne_x), tsne_remapped_y(node.data.tsne_y), 5, svg, node.data, tooltip, change, parent, temp_data_num);
            }
        })

        // needs to be converted into a function
        /* svg.call(d3.zoom()
            .scaleExtent([1, 5])
            .translateExtent([[0, 0], [width, height]])
            .on("zoom", function (e) {
                updateChart(e)
                })) */
        if (!svg.selectAll(".label_text_class").empty()) {
            svg.selectAll(".label_text_class").transition().remove()
        }

        /* set_of_parents.forEach((parent) => {
            render_labels(tsne_remapped_x(parent.data.tsne_x), tsne_remapped_y(parent.data.tsne_y), svg, parent.data, highlight_label, tooltip, temp_data_num)
        }) */
        if (props.treemap_labels != null) {
            for (let i = 0; i < props.treemap_labels.length - 1; i++) {
                let node = props.treemap_labels[i]
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
                let render_node_data = render_node.data
                render_labels_treemap(tsne_remapped_x(render_node_data.tsne_x), tsne_remapped_y(render_node_data.tsne_y), svg, render_node_data, highlight_label, tooltip, temp_data_num)

            }
        
        }
        Object.keys(props.selected_labels_treemap).forEach(function(node_id) {
            if (node_id.includes("_")) {
                let node = props.selected_labels_treemap[node_id]
                svg.select("#circle_class_" + node.data.subreddit)
                            .style("opacity", 1).style("stroke-opacity", 1)
            }
        });
/*         if (Object.keys(props.selected_labels_treemap).length != null ) {
            if (props.selected_treemap_label.data.node_id.includes("_")) {
                if (props.is_selected_treemap) {
                    svg.select("#circle_class_" + props.selected_treemap_label.data.subreddit)
                        .style("opacity", 1).style("stroke-opacity", 1)
                }
                else {
                    svg.select("#circle_class_" + props.selected_treemap_label.data.subreddit)
                        .style("opacity", .25).style("stroke-opacity", 0)
                }
                
            }
         }*/
        


        

        return [nodes, dict_of_subreddits_to_change, arr_of_tsne_boundaries]

    }

    

    function render_nodes(x, y, size, svg, node, tooltip, change, parent, temp_data_num) {
        node["x"] = x
        node["y"] = y
        node["resized_subreddit_count"] = size
        if (change == overTimeOptions["add"]) {
            const circle = svg.select(".g_circle")
            .append("circle")
                .attr("class", "circle_class" + " " + node.subreddit + " " + "parent_" + temp_data_num + "_" + parent.node_id)
                .attr("id", "circle_class_" + node.subreddit)
                .data([node])
                .attr("cx", x)
                .attr("cy", y)
                .attr("fill", node.color)
                .attr("opacity", 0.25)
                .attr("r", size)
                .attr("stroke", "black")
                .style("stroke-width", 1)
                .style("stroke-opacity", 0)
                
            
        circle.on("mouseover", (event) => {
                tooltip.select("#text_tooltip")
                    .style("opacity", 1)
                    .attr("dx", (d3.pointer(event)[0]-25))
                    .attr("dy", (d3.pointer(event)[1]-5))
                    .text(node.subreddit)
                const boundingBox = tooltip.select("#text_tooltip").node().getBBox()
                tooltip.select("#rect_tooltip")
                    .style("opacity", 1)
                    .style("x", boundingBox.x - 2.5)
                    .style("y", boundingBox.y - 2.5)
                    .style("width", boundingBox.width + 5)
                    .style("height", boundingBox.height + 5)
                
            })
            .on("mouseout", () => {
                tooltip.select("#rect_tooltip")
                    .style("opacity", 0)
                tooltip.select("#text_tooltip")
                    .style("opacity", 0)
            })
        }
        if (change == overTimeOptions["transform"]) {
            svg.select("#circle_class_" + node.subreddit)
                .classed("parent_" + temp_data_num + "_" + parent.node_id, true)
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

    function render_nodes_treemap(x, y, size, svg, node, tooltip, change, parent, temp_data_num) {
        node["x"] = x
        node["y"] = y
        node["resized_subreddit_count"] = size
        if (change == overTimeOptions["add"]) {
            const circle = svg.select(".g_circle")
            .append("circle")
                .attr("class", "circle_class" + " " + node.subreddit + " " + "parent_" + temp_data_num + "_" + parent.node_id)
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
                
            
        circle.on("mouseover", (event) => {
                tooltip.select("#text_tooltip")
                    .style("opacity", 1)
                    .attr("dx", (d3.pointer(event)[0]-25))
                    .attr("dy", (d3.pointer(event)[1]-5))
                    .text(node.subreddit)
                const boundingBox = tooltip.select("#text_tooltip").node().getBBox()
                tooltip.select("#rect_tooltip")
                    .style("opacity", 1)
                    .style("x", boundingBox.x - 2.5)
                    .style("y", boundingBox.y - 2.5)
                    .style("width", boundingBox.width + 5)
                    .style("height", boundingBox.height + 5)
                
            })
            .on("mouseout", () => {
                tooltip.select("#rect_tooltip")
                    .style("opacity", 0)
                tooltip.select("#text_tooltip")
                    .style("opacity", 0)
            })
        }
        if (change == overTimeOptions["transform"]) {
            svg.select("#circle_class_" + node.subreddit)
                .classed("parent_" + temp_data_num + "_" + parent.node_id, true)
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

    function render_labels(x, y, svg, node, highlight_label, tooltip, temp_data_num) {
        node["x"] = x
        node["y"] = y
        node["clicked"] = false
        var format = d3.format(",");
        var g_text = null
        if (node.node_id.includes("_")) {
            g_text = svg.select("#g_text_class_" + temp_data_num + "_" + node.subreddit)
        }
        else {
            g_text = svg.select("#g_text_class_" + temp_data_num + "_" + node.node_id)
        }

        if (svg.select("#label_text_class_" + node.node_id).empty()) {
            g_text.append("text")
                .attr("class", "label_text_class")
                .attr("id", "label_text_class_" + node.node_id)
                .data([node])
                .attr("dx", x)
                .attr("dy", y)
                .attr("fill", "black")
                .attr("stroke", "black")
                .style("stroke-width", .1)
                .text(() => {
                    if (node.node_id.includes("_")) {
                        return node.subreddit
                    }
                    return node.taxonomy_label
                })
                .on("mouseover", (event) => {
                    g_text.selectAll(".circle_text_class_" + temp_data_num)._groups[0].forEach(function(d) {
                        svg.select("#circle_class_" + d.classList[2])
                        .attr('fill', () => {
                            return "yellow"});
                        
                    });
                    /* svg.selectAll(".parent_" + temp_data_num + "_" + node.node_id)
                    .attr('fill', () => {
                        return "yellow"}); */
                
                   
         
                })
                .on("mousemove", (event) => {
                    /* svg.selectAll(".parent_" + temp_data_num + "_" + node.node_id)
                    .attr('fill', () => {
                        return "yellow"}); */

                    g_text.selectAll(".circle_text_class_" + temp_data_num)._groups[0].forEach(function(d) {
                        svg.select("#circle_class_" + d.classList[2])
                        .attr('fill', () => {
                            return "yellow"});
                        
                    });

                })
                .on("mouseout", (d) => {
                    /* svg.selectAll(".parent_" + temp_data_num + "_" + node.node_id)
                    .attr('fill', () => {
                        return node.color}); */
                    g_text.selectAll(".circle_text_class_" + temp_data_num)._groups[0].forEach(function(d) {
                        svg.select("#circle_class_" + d.classList[2])
                        .attr('fill', (d) => {
                            return d.color});
                        
                    });

                })
                .on("click", (d, i) => {
                    if (node.clicked == true) {
                        g_text.selectAll(".circle_text_class_" + temp_data_num)._groups[0].forEach(function(d) {
                            svg.select("#circle_class_" + d.classList[2])
                            .style("opacity", .25).style("stroke-opacity", 0)  
                        });
                        // svg.selectAll(".parent_" + temp_data_num + "_" + node.node_id).style("opacity", .25).style("stroke-opacity", 0)
                        node.clicked = false
                    
                    }
                    else {
                        g_text.selectAll(".circle_text_class_" + temp_data_num)._groups[0].forEach(function(d) {
                            svg.select("#circle_class_" + d.classList[2])
                            .style("opacity", 1).style("stroke-opacity", 1) 
                        });
                        //svg.selectAll(".parent_" + temp_data_num + "_" + node.node_id).style("opacity", 1).style("stroke-opacity", 1)
                        node.clicked = true
                    

                    }
                    
                })

        }
        
        
        /* const labelBoundingBox = g_text.select("#label_text_class_" + node.node_id).node().getBBox()


        g_text.append("rect")
                .attr("class", "label_rect_class")
                .attr("id", "label_rect_class_" + node.node_id)
                .attr("fill", "transparent")
                .style("x", labelBoundingBox.x - 2.5)
                .style("y", labelBoundingBox.y - 2.5)
                .style("width", labelBoundingBox.width + 5)
                .style("height", labelBoundingBox.height + 5)
                .on("mouseover", (event) => {
                    svg.selectAll(".parent_" + node.node_id)
                    .attr('fill', () => {
                        return "yellow"});
                    var top_subreddits = node.top_subreddit_labels.split(",")
                    
                    var label = ""
                    top_subreddits.forEach((subreddit_label, i) => {
                        label += subreddit_label 
                        if (i != top_subreddits.length - 1) {
                           label += "\n"
                        }       
                    })
                    tooltip.select("#text_tooltip")
                        .style("opacity", 1)
                        .attr("dx", (d3.pointer(event)[0]-25))
                        .attr("dy", (d3.pointer(event)[1]-500))
                        .text(label)
                    const toolTipBoundingBox = tooltip.select("#text_tooltip").node().getBBox()
                    tooltip.select("#rect_tooltip")
                        .style("opacity", 1)
                        .style("x", toolTipBoundingBox.x - 2.5)
                        .style("y", toolTipBoundingBox.y - 2.5)
                        .style("width", toolTipBoundingBox.width + 5)
                        .style("height", toolTipBoundingBox.height + 5)

                    //highlight_label.select("#text_highlight_label")
                    //.style("opacity", 1)
                    //.attr("dx", x)
                    //.attr("dy", y)
                    //.attr("fill", "black")
                    //.attr("stroke", "black")
                    //.style("stroke-width", .1)
                    //.text(node.taxonomy_label)
                    //const boundingBox = highlight_label.select("#text_highlight_label").node().getBBox()
                    //highlight_label.select("#rect_highlight_label")
                        //.style("opacity", 1)
                        //.style("x", boundingBox.x - 2.5)
                        //.style("y", boundingBox.y - 2.5)
                        //.style("width", boundingBox.width + 5)
                        //.style("height", boundingBox.height + 5)
                })
                .on("mousemove", (event) => {
                    svg.selectAll(".parent_" + node.node_id)
                    .attr('fill', () => {
                        return "yellow"});
                    const toolTipBoundingBox = tooltip.select("#text_tooltip").node().getBBox()
                    tooltip.select("#text_tooltip")
                        .attr("dx", (d3.pointer(event)[0]-25))
                        .attr("dy", (d3.pointer(event)[1]-5))
                    tooltip.select("#rect_tooltip")
                        .style("x", toolTipBoundingBox.x - 2.5)
                        .style("y", toolTipBoundingBox.y - 2.5)
                })
                .on("mouseout", (d) => {
                    svg.selectAll(".parent_" + node.node_id)
                    .attr('fill', () => {
                        return node.color});
                    tooltip.select("#rect_tooltip")
                        .style("opacity", 0)
                    tooltip.select("#text_tooltip")
                        .style("opacity", 0)
                    //highlight_label.select("#rect_highlight_label")
                    //.style("opacity", 0)
                    //highlight_label.select("#text_highlight_label")
                        //.style("opacity", 0)
                })
                .on("click", (d, i) => {
                    if (node.clicked == true) {
                        svg.selectAll(".parent_" + node.node_id).style("opacity", .25).style("stroke-opacity", 0)
                        node.clicked = false
                    
                    }
                    else {
                        svg.selectAll(".parent_" + node.node_id).style("opacity", 1).style("stroke-opacity", 1)
                        node.clicked = true
                    

                    }
                    
                }) */
                
                

    }


    function render_labels_treemap(x, y, svg, node, highlight_label, tooltip, temp_data_num) {
        node["x"] = x
        node["y"] = y
        node["clicked"] = false
        var format = d3.format(",");
        var g_text = null
        if (node.node_id.includes("_")) {
            g_text = svg.select("#g_text_class_" + temp_data_num + "_" + node.subreddit)
        }
        else {
            g_text = svg.select("#g_text_class_" + temp_data_num + "_" + node.node_id)
        }

        if (svg.select("#label_text_class_" + node.node_id).empty()) {
            g_text.selectAll(".circle_text_class_" + temp_data_num)._groups[0].forEach(function(d) {
                svg.select("#circle_class_" + d.classList[2])
                .attr('fill', (d) => {
                    return d.color})
                .on("mouseover", (event, d) => {
                        tooltip.select("#text_tooltip")
                            .style("opacity", 1)
                            .attr("dx", (d3.pointer(event)[0]-25))
                            .attr("dy", (d3.pointer(event)[1]-5))
                            .text(d.subreddit + "\n" + node.taxonomy_label)
                        const boundingBox = tooltip.select("#text_tooltip").node().getBBox()
                        tooltip.select("#rect_tooltip")
                            .style("opacity", 1)
                            .style("x", boundingBox.x - 2.5)
                            .style("y", boundingBox.y - 2.5)
                            .style("width", boundingBox.width + 5)
                            .style("height", boundingBox.height + 5)
                        
                    })
                
            });

            g_text.append("text")
                .attr("class", "label_text_class")
                .attr("id", "label_text_class_" + node.node_id)
                .data([node])
                .attr("dx", x)
                .attr("dy", y)
                .attr("fill", "black")
                .attr("stroke", "black")
                .style("stroke-width", .1)
                .text(() => {
                    if (node.node_id.includes("_")) {
                        return node.subreddit
                    }
                    return node.taxonomy_label
                })
                .on("mouseover", (event) => {
                    g_text.selectAll(".circle_text_class_" + temp_data_num)._groups[0].forEach(function(d) {
                        svg.select("#circle_class_" + d.classList[2])
                        .attr('fill', () => {
                            return "yellow"});
                        
                    });
                    /* svg.selectAll(".parent_" + temp_data_num + "_" + node.node_id)
                    .attr('fill', () => {
                        return "yellow"}); */
                
                   
         
                })
                .on("mousemove", (event) => {
                    /* svg.selectAll(".parent_" + temp_data_num + "_" + node.node_id)
                    .attr('fill', () => {
                        return "yellow"}); */

                    g_text.selectAll(".circle_text_class_" + temp_data_num)._groups[0].forEach(function(d) {
                        svg.select("#circle_class_" + d.classList[2])
                        .attr('fill', () => {
                            return "yellow"});
                        
                    });

                })
                .on("mouseout", (d) => {
                    /* svg.selectAll(".parent_" + temp_data_num + "_" + node.node_id)
                    .attr('fill', () => {
                        return node.color}); */
                    g_text.selectAll(".circle_text_class_" + temp_data_num)._groups[0].forEach(function(d) {
                        svg.select("#circle_class_" + d.classList[2])
                        .attr('fill', (d) => {
                            return d.color});
                        
                    });

                })
                .on("click", (d, i) => {
                    if (node.clicked == true) {
                        g_text.selectAll(".circle_text_class_" + temp_data_num)._groups[0].forEach(function(d) {
                            svg.select("#circle_class_" + d.classList[2])
                            .style("opacity", .25).style("stroke-opacity", 0)  
                        });
                        // svg.selectAll(".parent_" + temp_data_num + "_" + node.node_id).style("opacity", .25).style("stroke-opacity", 0)
                        node.clicked = false
                    
                    }
                    else {
                        g_text.selectAll(".circle_text_class_" + temp_data_num)._groups[0].forEach(function(d) {
                            svg.select("#circle_class_" + d.classList[2])
                            .style("opacity", 1).style("stroke-opacity", 1) 
                        });
                        //svg.selectAll(".parent_" + temp_data_num + "_" + node.node_id).style("opacity", 1).style("stroke-opacity", 1)
                        node.clicked = true
                    

                    }
                    
                })

        }        

    }



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

    function remap_point(point, min, max, min_range, max_range, margin, do_subtraction) {
        const range = max_range - min_range;
        const point_range = max - min
        var remap_point = point
        if (do_subtraction) {
            remap_point = (range - margin) - (((point - min ) / point_range) * (range - margin))
        }
        else {
            remap_point = min_range + (((point - min ) / point_range) * (range - margin))
        }

        return remap_point;
    }
    
    function create_group(svg, node, root, prefix, temp_data_num) {

        
        
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
                    .attr("class", prefix + " circle_text_class_" + temp_data_num + " " + node.data.subreddit)
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
            <svg ref={svgRef} width={width} height={height}></svg>
        </React.Fragment>
    );
}

export default BubbleMapTranslate;
