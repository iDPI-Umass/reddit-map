import { hierarchyMapStore } from "../../../stores/hierarchy-map";
import { get } from "svelte/store";

const search = function ( search ) {
    let node = this.hierarchyMap.get( search.searchTerm );
    if ( node === undefined ) {
      node = this.hierarchyMap.get( search.nodeID );
    }
    const parent_cluster = node.parent
    const parent_node_id = parent_cluster.data.node_id
    this.updateView( {subrootID: parent_node_id} );
};

  export { search }

