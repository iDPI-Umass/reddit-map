import { hierarchyMapStore } from "../../../stores/hierarchy-map";
import { get } from "svelte/store";

const search = function ( search ) {
    const searchTerm = search.searchTerm;
    const nodeID = search.nodeID;
    const hierarchyMap = get( hierarchyMapStore );
    let node = hierarchyMap.get( searchTerm );
    if ( node === undefined ) {
      console.log("treemap node undefined", hierarchyMap.get( nodeID ), hierarchyMap)
      for (let [key, value] of hierarchyMap) {
        if (Number(key) == Number(key) && "Youth Games and TV Fandom" == value.data.taxonomy_label) {
          console.log(value.data.taxonomy_label, key, value)
        }
      
      }
        
      node = hierarchyMap.get( nodeID );
    }
    console.log("subreddit in search: ", node)
    this.parent = node.parent;
    this.isTopLevel = this.parent === this.data;
    this.view = this.parent.children;
    this.resetScale( this.parent );
    this.render();
};

  export { search }