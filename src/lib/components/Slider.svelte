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
  const step = ( max - min ) / 100;
  
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
      rangeValue = event.target.value;
      rangeValue = value;
      sourceStore.push( dates[ value ] );
    });
  });

  onDestroy(() => {
    unsubscribeSource();
  });
</script>




<div>
  <sl-range 
    bind:this={range}
    min="{min}"
    max="{max}"
    step="{step}"
    value="{rangeValue}"
    >
  </sl-range>
</div>




<style>

</style>