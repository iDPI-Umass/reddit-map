import { writable } from "svelte/store";


const createStore = function () {
  let filter;

  const { subscribe, update } = writable( filter );

  return {
    subscribe,
    push: function ( filter ) {
      update( function () {
        return filter;
      });
    }
  };
};


export const filterStore = createStore();
