import { writable } from "svelte/store";


const createStore = function () {
  let collapse;

  const { subscribe, update } = writable( collapse );

  return {
    subscribe,
    push: function ( collapse ) {
      update( function () {
        return collapse;
      });
    }
  };
};


export const collapseStore = createStore();
