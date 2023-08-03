<script>
    import Accordion from "./Accordion.svelte";
    import AccordionHeader from "./AccordionHeader.svelte";
    import AccordionItem from "./AccordionItem.svelte";
    import { onMount, onDestroy } from "svelte";
    import { get } from "svelte/store";
    import { hierarchyMapStore } from "$lib/stores/hierarchy-map.js";
    import { openResultsStore } from "$lib/stores/open-results.js";
    import { collapseStore } from "$lib/stores/accordion-collapse.js"; 
    import { sourceStore } from "$lib/stores/source.js";
    import "@shoelace-style/shoelace/dist/components/input/input.js";
    import { head_selector, validate_each_argument } from "svelte/internal";
    import { filterStore } from "$lib/stores/filter.js";
    import { searchStore } from "$lib/stores/search.js";


    export let data = new Map();
    let unsubscribeHierarchyMap;
    let unsubscribeSearch;
    let unsubscribeSource;
    let search;
    let accordion;
    let subreddits = [];
    let clusters = [];
    let nsfwSubreddits = [];
    let openResults = false;
    openResultsStore.push(openResults);
    let headerToResults = { "Subreddits": [], "Clusters": [], "NSFW Subreddits": [] }
    let headerToId = { "Subreddits": 1, "Clusters": 2, "NSFW Subreddits": 3 }
    let foundDefault = false;

    function randomSearchSelection ( results ) {
        if ( results.length > 5 ) {
            let randomSearchResults = []
            let randomIndexSet = new Set();
            let randomIndex;;
            for (let i = 0; i < 5; i++) {
                while ( randomIndex === undefined || randomIndexSet.has( randomIndex ) ) {
                    randomIndex = Math.floor( Math.random() * results.length);
                }
                randomIndexSet.add( randomIndex );
                randomSearchResults.push( results[randomIndex] )
            }   
            
            return randomSearchResults

        }

        return results

    }

    // function searchFilter ( input ) {
    //     headerToResults["Subreddits"] = randomSearchSelection( subreddits.filter((subreddit) => input.length !== 0 && subreddit.toLowerCase().startsWith(input.toLowerCase())) )
    //     headerToResults["Clusters"] = clusters.filter((cluster) => input.length !== 0 && cluster.toLowerCase().startsWith(input.toLowerCase()))
    //     headerToResults["NSFW Subreddits"] = nsfwSubreddits.filter((nsfwSubreddit) => input.length !== 0 && nsfwSubreddit.toLowerCase().startsWith(input.toLowerCase()))
    // }

    function searchFilter ( input ) {
        headerToResults["Subreddits"] = randomSearchSelection( subreddits.filter((subreddit) => {
            return input.length !== 0 && subreddit.data.subreddit != undefined && subreddit.data.subreddit.toLowerCase().startsWith(input.toLowerCase())
        }))
        headerToResults["Clusters"] = randomSearchSelection( clusters.filter((cluster) => input.length !== 0 && cluster.data.taxonomy_label.toLowerCase().includes(input.toLowerCase())) )
        headerToResults["NSFW Subreddits"] = randomSearchSelection( nsfwSubreddits.filter((nsfwSubreddit) => input.length !== 0 && nsfwSubreddit.data.subreddit.toLowerCase().startsWith(input.toLowerCase())) )
    }

    function clearResults () {
        headerToResults["Subreddits"] = []
        headerToResults["Clusters"] = []
        headerToResults["NSFW Subreddits"] = []
    }

    function getIsDefault ( header ) {
        if ( header === "Subreddits" && headerToResults["Subreddits"].length > 0 ) {
            return true;
        }
        return false;
    }

    function getIsOpen ( header ) {
        console.log("is open: ", header)
        const subredditIsDefault = getIsDefault( "Subreddits" );
        if ( header === "Subreddits" ) {
            console.log(subredditIsDefault)
            if ( subredditIsDefault ) {
                collapseStore.push(headerToId["Subreddits"])
            }
            return subredditIsDefault
        }
        if ( !subredditIsDefault ) {
            if ( header === "Clusters" && headerToResults["Clusters"].length > 0 ) {
                console.log(true)
                collapseStore.push(headerToId["Clusters"])
                return true;
            }
            else if ( header === "NSFW Subreddits" && headerToResults["Clusters"].length === 0 && headerToResults["NSFW Subreddits"].length > 0 ) {
                console.log(true)
                collapseStore.push(headerToId["NSFW Subreddits"])
                return true;
            }
        }
        console.log(false)
        return false;
    }

    function getBadgeColor ( node ) {
        if ( node.data.type === "banned" || node.data.type === "quarantine" ) {
            return "danger"
        }
        if ( node.data.type === "nsfw" ) {
            return "warning"
        }
    }

    function getBadgeName ( node ) {
        if ( node.data.type === "banned" ) {
            return "Banned"
        }
        else if ( node.data.type === "quarantine" ) {
            return "Quarantined"
        }
        else if ( node.data.type === "nsfw" ) {
            return "NSFW"
        }
    }

    function isFilterOn( node ) {
        const filter = get( filterStore );
        if ( !filter || !( filter.key in node.data ) || node.data[filter.key] != filter.value ) {
            return false
        }
        return true
    }

    function searchInput( search ) {
        if ( search.length > 0 ) {
            searchFilter ( search );
            console.log("search filter results clusters: ", headerToResults["Clusters"])
            if ( headerToResults["Subreddits"].length > 0 ||
                headerToResults["Clusters"].length > 0 ||
                headerToResults["NSFW Subreddits"].length > 0 ) {
                openResults = true;
            }
            else {
                openResults = false;
            }
        }
        else {
            openResults = false
            clearResults();
        }
        openResultsStore.push(openResults);
    }

    onMount(() => {

        search.addEventListener("sl-input", () => {
            searchInput( search.value );
        })

        search.addEventListener("sl-clear", () => {
            openResults = false;
            openResultsStore.push(openResults);
            clearResults();
        })

        window.addEventListener("click", function(event) {
            if (search != undefined && (search.contains(event.target) && 
                ( headerToResults["Subreddits"].length > 0 ||
                headerToResults["Clusters"].length > 0 ||
                headerToResults["NSFW Subreddits"].length > 0 )) || accordion.contains(event.target)) {
                openResults = true;
                openResultsStore.push(openResults);
            }
            else {
                openResults = false;
                openResultsStore.push(openResults);
                if ( search.input.length === 0 ) {
                    clearResults();
                }
            }
        })


        unsubscribeSearch = searchStore.subscribe( function ( search ) {
            openResults = false;
            openResultsStore.push(openResults);
        });


        // unsubscribeHierarchyMap = hierarchyMapStore.subscribe( function ( hierarchyMap ) {
        //     console.log("in unsubscribeHierarchyMap")
        //     const filter = get(filterStore);
        //     data = new Map();
        //     clusters = [];
        //     subreddits = [];
        //     nsfwSubreddits = [];
        //     for (let [key, value] of new Map(hierarchyMap)) {
        //         if (Number(key) && value.data.taxonomy_label.length > 0) {
        //             data.set(value.data.taxonomy_label, value);
        //             clusters.push(value.data.taxonomy_label)
        //         }
        //         else {
        //             data.set(key, value);
        //             if (value.data.type === "nsfw") {
        //                 nsfwSubreddits.push(key)
        //             } 
        //             else if (value.data.type != "private" || ( !filter || !( filter.key in value.data ) || value.data[filter.key] != filter.value )) {
        //                 subreddits.push(key)
        //             }
        //         }
        //     }
        //     console.log("results: ", data)
        // });

        unsubscribeHierarchyMap = hierarchyMapStore.subscribe( function ( hierarchyMap ) {
            console.log("NEW HIERARCHY")
            const filter = get(filterStore);
            clusters = [];
            subreddits = [];
            nsfwSubreddits = [];
            for (let [key, value] of new Map(hierarchyMap)) {
                if (Number(key) && value.data.taxonomy_label.length > 0) {
                    if (value.data.taxonomy_label == "Youth Games and TV Fandom") {
                            console.log("YOUTH node id: ", value.data.node_id)
                    }
                    clusters.push(value)
                }
                else {
                    if (value.data.type === "nsfw") {
                        nsfwSubreddits.push(value)
                    } 
                    else if (value.data.type != "private" || ( !filter || !( filter.key in value.data ) || value.data[filter.key] != filter.value )) {
                        subreddits.push(value)
                    }
                }
            }
            searchInput(search.value)
        });
        
    });

    onDestroy(() => {
        unsubscribeHierarchyMap();
        unsubscribeSearch();
    });
</script>



<!-- <div class="search" tabindex=-1>
    <sl-input bind:this={ search } 
        placeholder="Search" 
        size="medium" 
        class="search-input" clearable></sl-input>
    <Accordion bind:accordion={accordion}>
        {#if openResults}
            {#each Object.entries(headerToResults) as [header, results]}
                <AccordionHeader isDefault={ getIsDefault( header ) }>
                    <div slot="title">{header}</div>
                    {#if results.length > 0 }
                        {#each results as result}
                            {#if data !== undefined}
                                {#if data.get( result ).data.type != "private" && !isFilterOn( data.get( result ) ) }
                                    {#if data.get( result ).data.type == "public" || data.get( result ).data.type == "protest" || data.get( result ).data.type == null}
                                        <AccordionItem slot="item" nodeID={data.get( result ).data.node_id}>
                                            <div slot="item-name">{ result }</div>
                                        </AccordionItem>
                                    {:else}
                                        <AccordionItem slot="item" nodeID={data.get( result ).data.node_id}>
                                            <div slot="item-name">{ result }</div>
                                            <div slot="item-badge"><sl-badge variant={getBadgeColor( data.get( result ) )}>{getBadgeName( data.get( result ) )}</sl-badge></div>
                                        </AccordionItem>
                                    {/if}
                                {/if}
                            {/if}
                            
                        {/each}
                    {/if}
                </AccordionHeader>
            {/each}
        {/if}
    </Accordion>
        
</div> -->

<div class="search" tabindex=-1>
    <sl-input bind:this={ search } 
        placeholder="Search" 
        size="medium" 
        class="search-input" clearable></sl-input>
    <Accordion bind:accordion={accordion}>
        {#if openResults}
            {#each Object.entries(headerToResults) as [header, results]}
                <AccordionHeader isDefault={ getIsDefault( header ) } isOpen={ getIsOpen( header ) } id={ headerToId[header] }>
                    <div slot="title">{header}</div>
                        {#each results as result}
                            {#if result.data.type != "private" && !isFilterOn(result)}
                                {#if result.data.type == null }
                                    <AccordionItem slot="item" nodeID={result.data.node_id}>
                                        <div slot="item-name">{ result.data.taxonomy_label }</div>
                                    </AccordionItem>
                                {:else if result.data.type == "public" }
                                    <AccordionItem slot="item" nodeID={result.data.node_id}>
                                        <div slot="item-name">{ result.data.subreddit }</div>
                                    </AccordionItem>
                                {:else if result.data.type == "protest"}
                                    <AccordionItem slot="item" nodeID={result.data.node_id}>
                                        <div slot="item-name">{ result.data.subreddit }</div>
                                    </AccordionItem>
                                {:else}
                                    <AccordionItem slot="item" nodeID={result.data.node_id}>
                                        <div slot="item-name">{ result.data.subreddit }</div>
                                        <div slot="item-badge"><sl-badge variant={getBadgeColor( result )}>{getBadgeName( result )}</sl-badge></div>
                                    </AccordionItem>
                                {/if}
                            {/if}
                            
                        {/each}
                </AccordionHeader>
            {/each}
        {/if}
    </Accordion>
        
</div>



<style>
    .search-input {
        width: 100%;
    }
  

</style>