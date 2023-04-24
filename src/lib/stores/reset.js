import { writable } from "svelte/store";

const createStore = function () {
  let event = null;

  const { subscribe, update } = writable( event );

  return {
    subscribe,
    push: function ( value ) {
      update( function () {
        return value;
      });
    }
  };
};


export const resetStore = createStore();