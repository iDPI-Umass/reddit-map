import { writable } from "svelte/store";


const createStore = function () {
  let search = {};

  const { subscribe, update } = writable( search );

  return {
    subscribe,
    push: function ( search ) {
      update( function () {
        return search;
      });
    }
  };
};


export const searchStore = createStore();
