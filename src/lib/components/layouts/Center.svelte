<main>
  <slot></slot>
</main>

<style>
  main {
    flex: 1 1 0;
    min-height: 0;
    max-width: 100vw;
    margin: 1rem;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    overflow-y: scroll;
  }
</style>