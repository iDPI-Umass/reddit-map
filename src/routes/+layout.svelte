<script>
  // Base themes and fonts for project.
  import "$lib/styles/themes.css";
  import "@shoelace-style/shoelace/dist/themes/light.css";
  import "$lib/styles/fonts.css";

  // Pull in more application specific CSS stylings.
  import "$lib/styles/reset.css";
  import "$lib/styles/main-child.css";
  import "$lib/styles/copy.css";
  import "$lib/styles/divider.css";
  import "$lib/styles/form.css";
  import "$lib/styles/radio-button.css";
  import "$lib/styles/brand.css";
  import "$lib/styles/keyword-table.css";
  import "$lib/styles/switches.css";
  import "$lib/styles/buttons.css";

  // Now we can setup the store stuff with Svelte
  import { beforeUpdate, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { resizeStore } from "$lib/stores/resize.js";

  if ( browser ) {
    let unsubscribeTheme;
    
    beforeUpdate( function() {
      window.addEventListener( "resize", function () {
        resizeStore.push({ id: ( new Date ).toISOString() });
      });
    });

    onDestroy( function () {

    });

  }
</script>

<div class="page-wrapper">
  <slot></slot>
</div>


<style>
</style>