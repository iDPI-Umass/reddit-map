<script>
  import "@shoelace-style/shoelace/dist/components/select/select.js";
  import "@shoelace-style/shoelace/dist/components/option/option.js";
  import { onDestroy, onMount } from "svelte";
  import { sourceStore } from "$lib/stores/source";

  let select;
  let unsubscribeSource;

  let currentMonth = "2022-12";
  const availableMonths = [
    "2022-12",
    "2023-01",
    "2023-02"
  ];

  onMount(() => {
    unsubscribeSource = sourceStore.subscribe( function ( source ) {
      if ( source == null ) {
        return;
      }

      currentMonth = source.name;
    });

    select.addEventListener( "sl-change", function ( event ) {
      sourceStore.push( event.target.value );
    });
  });

  onDestroy(() => {
    unsubscribeSource();
  });
</script>




<div>
  <sl-select bind:this={select} value={currentMonth} pill>
    {#each availableMonths as month (month)}
      <sl-option value="{month}">Reddit Map for {month}</sl-option>
    {/each}
  </sl-select>
</div>




<style>
  div {
    width: 100%;
  }

  div sl-select {
    width: 100%;
  }
</style>