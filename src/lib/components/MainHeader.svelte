<script>
  import "@shoelace-style/shoelace/dist/components/button/button.js";
  import "@shoelace-style/shoelace/dist/components/icon/icon.js";
</script>

<header>
  <nav>
    <sl-button href="/">
        <img slot="prefix" src="/favicon.png" alt="">
        RedditMap
    </sl-button>

    <sl-button href="/about">
      About
    </sl-button>
  </nav>
</header>

<style>
  header {
    padding: 1rem;
    background: var(--gobo-color-panel);
    border-bottom: var(--gobo-border-panel);
    height: 4rem;
  }

  nav {
    height: 2rem;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }

  nav > sl-button {
    margin: 0 var(--gobo-width-spacer-half);
    height: 2rem;
  }

  nav > sl-button:first-of-type {
    margin-left: 0;
  }

  nav > sl-button::part(base) {
    height: 2rem;
    padding: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    background: var(--gobo-color-panel);
    color: var(--gobo-color-text-menu);
    border: none;
  }

  nav > sl-button::part(label) {
    padding: 0;
    font-size: 1.125rem;
    font-weight: var(--gobo-font-weight-bold);
  }

  header sl-button img {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 0.5rem;
  }
</style>