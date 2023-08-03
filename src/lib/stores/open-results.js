import { writable } from "svelte/store";


const createStore = function () {
  let openResults;

  const { subscribe, update } = writable( openResults );

  return {
    subscribe,
    push: function ( openResults ) {
      update( function () {
        return openResults;
      });
    }
  };
};


export const openResultsStore = createStore();
