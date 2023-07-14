<script>
    import "@shoelace-style/shoelace/dist/components/input/input.js";
    import "@shoelace-style/shoelace/dist/components/select/select.js";
    import { searchStore } from "$lib/stores/search.js";
    import { resizeStore } from "$lib/stores/resize.js";
    import { onMount } from "svelte";


    let subreddit;
    let unsubscribeResize;
    let width = window.innerWidth / 2;

    const handleSearchButton = function ( event ) {
        searchStore.push( {term: subreddit.value });

    };

    onMount(() => {
        unsubscribeResize = resizeStore.subscribe( function ( resize ) {
            if (resize != null && resize.width != null) {
                width = resize.width
            }
        });
    });
    
</script>

<div class="search" style:width={width}px>
    <sl-input bind:this={subreddit} placeholder="Search" size="medium" pill>
        
    </sl-input>
    <sl-button
        on:click={handleSearchButton}
        on:keypress={handleSearchButton}
        class="action"
        pill>
        Search
    </sl-button>
    

</div>



<style>
    div {
        display: flex;
        padding-top: 1em;
        padding-left: 1em;

    }
    div sl-input {
        width: 100%;
    }





</style>