import React from 'react';
import * as d3 from 'd3';
import data from "./data/RC_2021-05_KMeans_Agglom_100_Clusters_Updated_Mapping.json"

function Tree() {
    const svgRef = React.useRef()
    const width = 1500
    var height = 800
    const padding = 35;

    React.useEffect(() => {
        const root = d3.hierarchy(data);
        const descendants = root.descendants();
        const label = function(d){ return d.node_id + " " + d.taxonomy_label;}
        const dx = 10;
        const dy = width / (root.height + padding);
        const tree = d3.tree;
        const curve = d3.curveBumpX;
        const stroke = "#555";
        const strokeWidth = 1.5;
        const strokeOpacity = 0.4;
        const strokeLinejoin = "round";
        const strokeLinecap = "round";
        const linkTarget = "_blank";
        const fill = "#999";
        const r = 3
        const title = d => "node_id: " +  d.node_id + ", cluster_label: " +  d.cluster_label + ", subreddit_labels: " + d.all_subreddit_labels;
        const L = descendants.map(d => label(d.data));
        const halo = "#fff";
        const haloWidth = 3;


        root.sort((a, b) => d3.descending(a.height, b.height));

        
        

        // Compute the layout.
        tree().nodeSize([dx, dy])(root);

        // Center the tree.
        let x0 = Infinity;
        let x1 = -x0;
        root.each(d => {
            if (d.x > x1) x1 = d.x;
            if (d.x < x0) x0 = d.x;
        });
        height = x1 - x0 + dx * 2;

        const svg = d3.select(svgRef.current)
            .attr("viewBox", [-dy * padding / 2, x0 - dx, width, height])
            .attr("width", width)
            .attr("height", height)
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10);

        svg.append("g")
            .attr("fill", "none")
            .attr("stroke", stroke)
            .attr("stroke-opacity", strokeOpacity)
            .attr("stroke-linecap", strokeLinecap)
            .attr("stroke-linejoin", strokeLinejoin)
            .attr("stroke-width", strokeWidth)
          .selectAll("path")
            .data(root.links())
            .join("path")
              .attr("d", d3.link(curve)
                  .x(d => d.y)
                  .y(d => d.x));
        const node = svg.append("g")
            .selectAll("a")
            .data(root.descendants())
            .join("a")
            .attr("xlink:href", null)
            .attr("target", linkTarget)
            .attr("transform", d => `translate(${d.y},${d.x})`);

        node.append("circle")
            .attr("fill", d => d.children ? stroke : fill)
            .attr("r", r);
      
        if (title != null) node.append("title")
            .text(d => title(d.data, d));
      
        if (L) node.append("text")
            .attr("dy", "0.32em")
            .attr("x", d => d.children ? -6 : 6)
            .attr("text-anchor", d => d.children ? "end" : "start")
            .attr("paint-order", "stroke")
            .attr("stroke", halo)
            .attr("stroke-width", haloWidth)
            .text((d, i) => L[i]);



    }, []);

    return (
        <React.Fragment>
            <svg ref={svgRef} width={width} height={height}></svg>
        </React.Fragment>
    );
}

export default Tree;
