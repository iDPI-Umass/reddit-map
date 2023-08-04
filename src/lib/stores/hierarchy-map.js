import { writable } from "svelte/store";


const createStore = function () {
  let hierarchyMap;

  const { subscribe, update } = writable( hierarchyMap );

  return {
    subscribe,
    push: function ( hierarchyMap ) {
      update( function () {
        return hierarchyMap;
      });
    }
  };
};


export const hierarchyMapStore = createStore();
