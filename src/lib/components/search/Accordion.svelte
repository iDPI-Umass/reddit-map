<script>
    import { onMount } from "svelte";

    export let accordion;
</script>

<div bind:this={accordion} class="accordion">
    <slot />
</div>

<style>
    .accordion {
        width: 47%;
        position:absolute;
        z-index: 3;
    }

</style>