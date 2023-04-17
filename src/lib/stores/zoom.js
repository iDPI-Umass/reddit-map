import { writable } from "svelte/store";


const createStore = function () {
  let zoom = null;

  const { subscribe, update } = writable( zoom );

  return {
    subscribe,
    push: function ( zoom ) {
      update( function () {
        return zoom;
      });
    }
  };
};


export const zoomStore = createStore();
