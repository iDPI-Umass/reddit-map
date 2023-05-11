<script>
  import "@shoelace-style/shoelace/dist/components/range/range.js";
  import { onDestroy, onMount } from "svelte";
  import { sourceStore } from "$lib/stores/source";

  let range;
  let source, unsubscribeSource;

  let rangeValue = 0;
  const dates = [ 
    "2021-04",
    "2021-05"
  ];

  const min = 0;
  const max = dates.length - 1;
  const step = ( max - min ) / ( 100 * dates.length );
  let displayMonth = dates[ rangeValue ];

  const updateRangeValue = function ( newValue ) {
    rangeValue = newValue;
    sourceStore.push( dates[ rangeValue ] );
    displayMonth = dates[ rangeValue ];
  };

  const handleArrows = function ( event ) {
    if ( event.key === "ArrowRight" ) {
      if ( rangeValue < dates.length - 1 ) {
        updateRangeValue( rangeValue + 1 );
        return;
      }
    }

    if ( event.key === "ArrowLeft" ) {
      if ( rangeValue > 0 ) {
        updateRangeValue( rangeValue - 1 );
        return;
      }
    }

  };
  
  onMount(() => {
    unsubscribeSource = sourceStore.subscribe( function ( _source ) {
      if ( _source != null ) {
        const index = dates.findIndex( d => d === _source.name );
        if ( index != null ) {
          rangeValue = index;
        }
      }
    });

    range.tooltipFormatter = function ( value ) {
      const index = Math.round( value );
      return dates[ index ];
    };

    range.addEventListener( "sl-change", function ( event ) {
      const value = Math.round( event.target.value );
      // First allow range component to be set to the given value to prevent thrash.
      rangeValue = event.target.value;

      // Now propogate the rounded value;
      updateRangeValue( value );
    });

    range.addEventListener( "touchmove", function ( event ) {
      event.preventDefault();
    });
  });

  onDestroy(() => {
    unsubscribeSource();
  });
</script>




<div>
  <sl-range 
    bind:this={range}
    on:keydown={handleArrows}
    min="{min}"
    max="{max}"
    step="{step}"
    value="{rangeValue}"
    label="RedditMap for {displayMonth}"
    >
  </sl-range>
</div>




<style>
  div {
    width: 100%;
  }
</style>