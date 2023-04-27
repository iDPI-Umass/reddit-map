import { writable } from "svelte/store";


const createStore = function () {
  let resize = null;
  let timer;

  const { subscribe, update } = writable( resize );

  const triggerResize = value => {
    return () => update ( () => value );
  }

  const debouncedUpdate = function ( value ) {
    clearTimeout( timer );
    timer = setTimeout( triggerResize(value), 250 );
  };

  return {
    subscribe,
    push: function ( value ) {
      debouncedUpdate( value );
    }
  };
};


export const resizeStore = createStore();
