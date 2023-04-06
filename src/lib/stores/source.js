import { writable } from "svelte/store";
import * as Cluster from "$lib/resources/cluster.js";

const createStore = function () {
  let source = null;

  const { subscribe, update } = writable( source );

  return {
    subscribe,
    push: async function ( name ) {
      const value = await Cluster.get( name );
      update( function () {
        return value;
      });
    }
  };
};


export const sourceStore = createStore();
