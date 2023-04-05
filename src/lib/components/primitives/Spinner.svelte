<script>
  import "@shoelace-style/shoelace/dist/components/spinner/spinner.js";
  export let size = "3rem";
</script>

<div class="spinner-box">
  <sl-spinner style="--size:{size};"></sl-spinner>
</div>

<style>
  .spinner-box {
    max-width:  36rem;
    display: flex;
    justify-content: center;
    margin: var(--gobo-height-spacer-flex) var(--gobo-width-spacer-flex);
  }

  .spinner-box > sl-spinner {
    font-size: var(--size, 3rem);
  }
</style>