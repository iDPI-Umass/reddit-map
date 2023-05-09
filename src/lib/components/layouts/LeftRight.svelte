<div class="panels">
  <main class="left-panel">
    <slot name="left"></slot>
  </main>
  
  <aside class="right-panel">
    <slot name="right"></slot>
  </aside>
</div>

<style>
  .panels {
    height: 100%;
    margin: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }

  .left-panel {
    flex: 1 1 50%;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    margin: 0;
    padding: 4px;
  }

  .right-panel {
    flex: 1 1 50%;
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0;
    padding: 4px;
  }

  @media ( min-width: 750px ) {
    .right-panel {
      display: flex;
    }
  }  
</style>