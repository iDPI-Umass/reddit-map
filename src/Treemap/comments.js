/* svg.on("mouseover", (event, d) => {
        height += 100
        width += 100
        svg.attr("height", height).attr("width", width)
    })
    .on("mouseout", (event, d) => {
        height -= 100
        width -= 100
        svg.attr("height", height).attr("width", width)
    }) */


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


/* node.append("title")
    .text((d) => {
        if (d.data.node_id.includes("_")) {
            return `${node_id(d)}\n${format(d.data.subreddit_count)}`
        }
        return `${node_id(d)}\n${format(d.data.cluster_subreddit_count)}`
    }); */


/* data.forEach((n) => {
    let text_boundingBox = node.select("#taxonomy_label_text_" + n.data.node_id).node().getBBox()
    node.append("rect")
        .attr("x", text_boundingBox.x)
        .attr("y", text_boundingBox.y)
        .attr("width", text_boundingBox.width)
        .attr("height", text_boundingBox.height)
        .attr("opacity", 0)
}) */

/* node.selectAll(".taxonomy_label_text")
    .append("rect")
    .attr("x", (d) => {
        return node.select("#taxonomy_label_text_" + d.data.node_id).node().getBBox().x
    })
    .attr("y", (d) => {
        return node.select("#taxonomy_label_text_" + d.data.node_id).node().getBBox().y
    })
    .attr("width", (d) => {
        return node.select("#taxonomy_label_text_" + d.data.node_id).node().getBBox().width
    })
    .attr("height", (d) => {
        return node.select("#taxonomy_label_text_" + d.data.node_id).node().getBBox().height
    }) */