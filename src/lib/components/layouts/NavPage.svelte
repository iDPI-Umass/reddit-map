<script>
  import LeftNav from "$lib/components/headers/LeftNav.svelte";
  export let current;
</script>

<div class="panels">
  <LeftNav {current} ></LeftNav>
  
  <main class="main">
    <slot></slot>
  </main>
</div>

<style>
  .panels {
    flex: 1 1 0%;
    min-height: 0;
    margin: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
  }

  main {
    flex: 1 1 100%;
    margin: 0;
    overflow-y: scroll;
    padding: 4px;
  }
</style>