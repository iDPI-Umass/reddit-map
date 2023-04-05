import { writable } from "svelte/store";


const getSize = function () {
  return `${ window.innerHeight }::${ window.innerWidth }`;
};

const createStore = function () {
  let resize = getSize();
  let timer;

  const { subscribe, update } = writable( resize );

  const triggerResize = () => update ( getSize );

  const debouncedUpdate = function () {
    clearTimeout( timer );
    timer = setTimeout( triggerResize, 500 );
  };

  return {
    subscribe,
    resize: function () {
      debouncedUpdate();
    }
  };
};


export const resizeStore = createStore();
