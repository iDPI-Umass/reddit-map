<script>
    import { onMount } from "svelte";
    import { collapseStore } from "$lib/stores/accordion-collapse.js";

    export let isDefault = false;
    export let isOpen = false;
    export let toggle;
    let open = false;
    export let id = null;
    let unsubscribeCollapse;

    if (isDefault || isOpen) {
        toggleDown();
    }

    function toggleDown() {
        open = !open;
        collapseStore.push( id )
    }



    onMount(() => {
        toggle.addEventListener( "click", toggleDown);
        toggle.addEventListener("sl-blur", () => {console.log("header blur")})
        unsubscribeCollapse = collapseStore.subscribe( function ( collapse ) {
            if ( collapse != id ) {
                open = false;
            }
            else {
                open = true;
            }
        });
    });


</script>

<div class="accordion-header">
        <sl-button bind:this={toggle} class="accordion-toggle" size="small" caret>
            <div class="accordion-title">
                <slot name="title" />
            </div>
        </sl-button>    

    {#if open}
        <slot/>
    {/if}
</div>

<style>
    .accordion-header {
        width: var(--accordion-width);
    }
    .accordion-toggle {
        width: 100%;
    }
    .accordion-toggle::part(base) {
        border-radius: 0px;
    }

</style>