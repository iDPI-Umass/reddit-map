import { hierarchyMapStore } from "../../../stores/hierarchy-map";
import { get } from "svelte/store";

const search = function ( search ) {
    const searchTerm = search.searchTerm;
    const nodeID = search.nodeID;
    const hierarchyMap = get( hierarchyMapStore );
    let node = hierarchyMap.get( searchTerm );
    if ( node === undefined ) {
      node = hierarchyMap.get( nodeID );
    }
    this.parent = node.parent;
    this.isTopLevel = this.parent === this.data;
    this.view = this.parent.children;
    this.resetScale( this.parent );
    this.render();
};

  export { search }