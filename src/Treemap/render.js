import * as d3 from "d3";
import { Library } from "@observablehq/stdlib";

const library = new Library();


// Creates a closure to keep variables in scope.
export default function create ({ h, svg, ...props }) {
  const { width, x, y } = h;
  let group, root;

  
  const prepareNode = function ( group, data ) {
    return group
      .selectAll( "g" )
      .attr( "class", "node_group" )
      .data( data )
      .join( "g" )
      .on( "mouseenter", ( event, d ) => {
          //props.setHighlightLabel(d.data.node_id)
          props.setHandleTooltipEvent( event );
          props.setHandleTooltipNode( d );
          props.setTooltipIsMouseEnter( true );
          //props.setHighlightLabel(d)
      })
      .on( "mousemove", ( event, d ) => {
          props.setHandleTooltipEvent( event );
          props.setHandleTooltipNode( d );
          props.setTooltipIsMouseEnter( false );
          /* if (d.data.node_id in props.all_node_id_to_nodes) {
              let arr_of_nodes = props.all_node_id_to_nodes[d.data.node_id]
              arr_of_nodes.forEach((n) => {
                  n.attr('fill', () => {
                      return "yellow"});
              })
          } */
          props.setHighlightLabel( d );
      })
      .on( "mouseout", ( event, d ) => {
          props.setHandleTooltipEvent( null );
          props.setHandleTooltipNode( null );
          props.setTooltipIsMouseEnter( false ); 
          svg.selectAll("#g_rect_tooltip").remove();
          svg.selectAll("#rect_tooltip").remove();
          svg.selectAll("#text_tooltip").remove();
          svg.selectAll("#thumbnail").remove()  
          svg.selectAll("#text_tooltip").attr( "opacity", 0 );  
          /* if (d.data.node_id in props.all_node_id_to_nodes) {
              let arr_of_nodes = props.all_node_id_to_nodes[d.data.node_id]
              arr_of_nodes.forEach((n) => {
                  n.attr('fill', () => {
                      return d.data.color});
              })        
          } */
          props.setHighlightLabel(null)
      })
      .on("click", (event, d) => {
          d.data.clicked = !d.data.clicked
          /* props.setSelectedNodes(d)
          props.setIsSelected(d.data.clicked)
          props.setSelectedNodeId(d.data.node_id) */
          
      })
  };

  const position = function ( group, root ) {
    group.selectAll( "g" )
      .attr( "transform", d => {
        if ( d === root ) {
          return `translate(0,-30)`;
        } else {
          return `translate(${ x(d.x0) },${ y(d.y0) })`;
        }
      })
      .select( "rect" )
      .attr( "width", d => {
        if ( d === root ) {
          return width;
        } else {
          return x( d.x1 ) - x( d.x0 );
        }
      })
      .attr( "height", d => {
        if ( d === root ) {
          return 30;
        } else {
          return y( d.y1 ) - y( d.y0 );
        } 
      });
  }

  // When zooming in, draw the new nodes on top, and fade them in.
  const zoomin = function ( d ) {
    const group0 = group.attr( "pointer-events", "none" );
    const group1 = group = svg.append("g").call( render, d );

    x.domain([ d.x0, d.x1 ]);
    y.domain([ d.y0, d.y1 ]);

    svg.transition()
      .duration( 750 )
      .call( t => {
        return group0.transition( t )
          .remove()
          .call( position, d.parent ); 
      })
      .call( t => {
        return group1.transition( t )
          .attrTween( "opacity", () => d3.interpolate( 0, 1 ))
          .call( position, d );
      });
  };

  // When zooming out, draw the old nodes on top, and fade them out.
  const zoomout = function ( d ) {
    const group0 = group.attr( "pointer-events", "none" );
    const group1 = group = svg.insert("g", "*").call( render, d.parent );

    x.domain([ d.parent.x0, d.parent.x1 ]);
    y.domain([ d.parent.y0, d.parent.y1 ]);

    svg.transition()
      .duration( 750 )
      .call( t => {
        return group0.transition( t )
          .remove()
          .attrTween( "opacity", () => d3.interpolate( 1, 0 ))
          .call( position, d );
      })
      .call( t => {
        return group1.transition( t )
          .call( position, d.parent ); 
      });
  };

  const setClickEvent = function ( node ) {
    node.filter( d => d === root ? d.parent : d.children )
      .attr( "cursor", "pointer" )
      .on( "click", ( event, d ) => {
        if ( d === root ) {
          zoomout( root )
        }
        else {
          zoomin( d )
        }
      });
  }

  const decorate = function ( node ) {
    node.append( "rect" )
      .attr( "id", d => ( d.leafUid = library.DOM.uid("leaf") ).id )
      .attr( "fill", d => {
        if ( d.data.taxonomy_label.length === 0 ) {
          return "white";
        }
        return d.data.color;
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
      .attr( "opacity", 0.5 )
      .attr( "stroke", "#fff" )
          
  
    node.append( "clipPath" )
      .attr( "id", d => ( d.clipUid = library.DOM.uid("clip") ).id )
      .append( "use" )
      .attr( "xlink:href", d => d.leafUid.href );

    node.append( "text" )
      .attr( "id", d => "taxonomy_label_text_" + d.data.node_id )
      .attr( "class", "taxonomy_label_text")
      .attr( "clip-path", d => d.clipUid)
      .attr( "font-weight", d => d === root ? "bold" : null)
      .selectAll( "tspan" )
      .data(d => (d.data.hasOwnProperty("children") ? d.data.taxonomy_label : d.data.subreddit).split(/(?=[A-Z][^A-Z])/g))
      .join("tspan")
      .attr("x", 3)
      .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
      //.attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
      .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
      .text(d => d)
  };

  const render = function ( _group, _root ) {
    console.log( "render" );
    group = _group;
    root = _root;

    let data = root.children.concat( root );
    for ( const d of data ) {
      d.data[ "clicked" ] = false;
    }
    
    const node = prepareNode( group, data );
    setClickEvent( node );
    decorate( node );
    
    group.call( position, root );
    props.setParentLabel( root );
    props.setLabels( data );
  };

  return render;
};

  