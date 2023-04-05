<script>
  import Spinner from "$lib/components/primitives/Spinner.svelte";
  import { onDestroy, onMount } from "svelte";
  import { sourceStore } from "$lib/stores/source.js";
  import * as Treemap from "$lib/helpers/treemap/index.js";

  let treemap, unsubscribeSource;
  let hidden = true;
  
  onMount(() => {
    unsubscribeSource = sourceStore.subscribe( function ( _source ) {
      source = _source;
      Treemap.prepare( treemap );
      hidden = false;
    });
  });

  onDestroy(() => {
    unsubscribeSource();
  });
</script>


{#if hidden === true}
  <Spinner></Spinner>
{/if}

<svg 
  bind:this={treemap}
  class:hidden="{hidden === true}">
</svg>



<style>
  svg {
    flex: 1 1 auto;
    border: 1px solid #FFFFFF;
  }

  .hidden {
    display: none;
  }
</style>