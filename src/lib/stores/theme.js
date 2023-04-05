import { writable } from "svelte/store";
import { browser } from "$app/environment";
import * as LS from "$lib/helpers/local-storage.js";

const prefersDark = function () {
  return window.matchMedia( "(prefers-color-scheme: dark)" ).matches === true;
}

const createStore = function () {
  let theme;

  if ( browser ) {
    theme = LS.read( "gobo-theme" );

    if ( theme == null ) {
      if ( prefersDark() === true ) {
        theme = { 
          dark: true, 
          fontSize: "3"
        };
      } else {
        theme = { 
          dark: false,
          fontSize: "3" 
        };
      }
    
      LS.write( "gobo-theme", theme );
    }
  } else {
    theme = { dark: true };
  }
  
  const { subscribe, update } = writable( theme );

  return {
    subscribe,
    toggleDark: function () {
      update( function (theme) {
        theme.dark = !theme.dark;
        LS.write( "gobo-theme", theme );
        return theme;
      });
    },
    setDark: function () {
      update( function ( theme ) {
        theme.dark = true;
        LS.write( "gobo-theme", theme );
        return theme;
      });
    },
    setLight: function () {
      update( function ( theme ) {
        theme.dark = false;
        LS.write( "gobo-theme", theme );
        return theme; 
      });
    },
    setArial: function () {
      update( function ( theme ) {
        theme.arial = true;
        LS.write( "gobo-theme", theme );
        return theme;
      });
    },
    setRoboto: function () {
      update( function ( theme ) {
        theme.arial = false;
        LS.write( "gobo-theme", theme );
        return theme;
      });
    },
    setFontSize: function ( size ) {
      update( function ( theme ) {
        theme.fontSize = size;
        LS.write( "gobo-theme", theme );
        return theme;
      });
    }
  };
};


export const themeStore = createStore();
