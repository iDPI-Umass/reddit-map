import { writable, get } from "svelte/store";
import * as Cluster from "$lib/resources/cluster.js";

const createStore = function () {
  let source = null;

  const store = writable( source );
  const { subscribe, update } = store;

  return {
    subscribe,
    push: async function ( name ) {
      const current = get( store )
      if ( name === current?.name ) {
        return;
      }

      const data = await Cluster.get( name );
      update( function () {
        return { name, data };
      });
    }
  };
};


export const sourceStore = createStore();
