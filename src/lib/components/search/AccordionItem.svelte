<script>
    import { onMount } from "svelte";
    import { searchStore } from "$lib/stores/search.js";
    import "@shoelace-style/shoelace/dist/components/card/card.js";

    export let nodeID = null;
    let item;
    let searchTerm;
    let unsubscribeSearch;

    

    onMount(() => {
        item.addEventListener( "click", (event) => { 
            searchStore.push( {searchTerm: searchTerm.textContent, nodeID: nodeID} )
        });
    });


    
</script>

<sl-card bind:this={item} class="accordion-item" size="small">
    <div class="item-name" bind:this={searchTerm}>
        <slot name="item-name" ></slot>
    </div>
    <div class="item-badge">
        <slot name="item-badge" ></slot>
    </div>
</sl-card>


<style>
    .accordion-item {
        width: 100%;
    }
    .accordion-item::part(base) {
        border: solid 1px 	var(–sl-color-neutral-300);
        border-radius: 0;
    }
    .item-name {
        text-align: left;
    }
    .item-badge {
        text-align: left;
    }

</style>