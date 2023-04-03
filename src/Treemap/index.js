import React from "react";
import debounce from "lodash/debounce";
import Helpers from "./helpers";
import RenderEngine from "./render";
import * as d3 from 'd3';


function Treemap( props ) {
  const { 
    curr_data, 
    initial_bubble_map_render, 
    rerender_treemap,
    setHandleTooltipEvent,
    setHandleTooltipNode,
    setTooltipIsMouseEnter,
    setHighlightLabel,
    setParentLabel,
    setLabels,
    setTreemapSvg
  } = props;

  const svgRef = React.useRef();
  const [ windowSize, setWindowSize ] = 
    React.useState( `${ window.innerWidth }::${ window.innerHeight }` );


  React.useEffect(() => {
    function updateWindowSize() {
      setWindowSize( `${ window.innerWidth }::${ window.innerHeight }` );
    }
    const handleResize = debounce( updateWindowSize, 500 );
    window.addEventListener( "resize", handleResize );
    return function () {
      window.removeEventListener( "resize", handleResize );
    };
  });
    

  React.useLayoutEffect(() => {
    console.log("useLayoutEffect");
    if ( initial_bubble_map_render ) {
      const svg = d3.select( svgRef.current );
      const width = svgRef.current.clientWidth;
      const height = svgRef.current.clientHeight;
      const h = Helpers({ width, height });
      const render = RenderEngine({
        h,
        svg,
        setHandleTooltipEvent,
        setHandleTooltipNode,
        setTooltipIsMouseEnter,
        setHighlightLabel,
        setParentLabel,
        setLabels
      });
      
      setLabels( null );
      h.clean( svg );
      h.style( svg );

      console.log( "tree data:", curr_data );
      const treemap = h.treemap( curr_data );
      svg.append( "g" )
        .call( render, treemap );
  
      setTreemapSvg(svg)
    }

      
  }, [
    curr_data, 
    initial_bubble_map_render, 
    rerender_treemap,
    setHandleTooltipEvent,
    setHandleTooltipNode,
    setTooltipIsMouseEnter,
    setHighlightLabel,
    setParentLabel,
    setLabels,
    setTreemapSvg
  ]);

  return (
    <svg 
      ref={ svgRef } 
      height="100%"
      width="100%"
    />
  );
}

export default Treemap;
