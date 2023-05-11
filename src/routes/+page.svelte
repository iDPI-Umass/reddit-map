<script>
  import "@shoelace-style/shoelace/dist/components/alert/alert.js";
  import "@shoelace-style/shoelace/dist/components/icon/icon.js";
  import "@shoelace-style/shoelace/dist/components/button/button.js";
  import MainHeader from "$lib/components/MainHeader.svelte";
  import Treemap from "$lib/components/Treemap.svelte";
  import Bubblemap from "$lib/components/Bubblemap.svelte";
  import { sourceStore } from "$lib/stores/source.js";
  import { zoomStore } from "$lib/stores/zoom.js";
  import { resizeStore } from "$lib/stores/resize.js";
  import { onDestroy, onMount } from "svelte";

  let unsubscribeResize;
  let left, right, alert;

  sourceStore.push( "2022-12" );


  // For mobile devices, we can't rely on 100vh sizing, with downstream effects
  // for treemap and bubblemap sizing. Use window.innerWidth to always get the
  // visible viewport.
  const handleResize = function () {
    let width, height;

    if ( window.innerWidth > 750 ) {
      //                            main's pad   midline gutter
      width = ( window.innerWidth - ( 16 * 2 ) - ( 16 * 1 ) ) / 2;
    } else {
      //                          main's pad
      width = window.innerWidth - ( 16 * 1 );
    }
   
    
    //                            header       main's vertical padding
    height = window.innerHeight - ( 16 * 4 ) - ( 16 * 1 );


    left.style.width = `${ width }px`;
    left.style.height = `${ height }px`;
    right.style.width = `${ width }px`;
    right.style.height = `${ height }px`;
    
    return { width, height };
  };


  onMount( function () {
    handleResize();

    if ( window.innerWidth < 750 ) {
      alert.toast();
    }

    unsubscribeResize = resizeStore.subscribe( function ( event ) {
      const { width, height } = handleResize();
      if ( event != null && event.width == null ) {
        resizeStore.push({
          id: event.id,
          width: width,
          height: height
        });
      }
    });
  });

  onDestroy( function () {
    unsubscribeResize();
  });

</script>

<sl-alert
  bind:this={alert}
  variant="primary"
  duration="10000"
  closable>
  <sl-icon slot="icon" src="/icons/info-circle.svg"></sl-icon>
  For the best experience, we recommend viewing RedditMap on a large screen.
</sl-alert>

<MainHeader></MainHeader>

<main>

  <section bind:this={left} class="left">
    <Treemap></Treemap>
  </section>

  <section bind:this={right} class="right">
    <Bubblemap></Bubblemap>
  </section>
  
</main>


<style>
  main {
    position: relative;
    flex: 1 0 auto;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: stretch;
    padding: 0.5rem;
    height: calc( 100vh - 4rem );
  }

  main .left {
    flex: 1 1 50%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
  }

  main .right {
    display: none;
  }

  @media( min-width: 750px ) {
    main {
      padding: 1rem;
    }

    main .left {
      margin-right: 1rem;
      max-height: 100%;
    }

    main .right {
      flex: 1 1 50%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      padding-right: 1rem;
      max-height: 100%;
    }
  }
 
</style>