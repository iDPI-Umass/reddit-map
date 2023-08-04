import { writable } from "svelte/store";


const createStore = function () {
  let labels;

  const { subscribe, update } = writable( labels );

  return {
    subscribe,
    push: function ( labels ) {
      update( function () {
        return labels;
      });
    }
  };
};


export const labelsStore = createStore();
