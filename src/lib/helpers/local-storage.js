export const read = function ( name ) {
  const string = window.localStorage.getItem( name );
  if ( string != null ) {
    return JSON.parse( string );
  } else {
    return null;
  }
}

export const write = function ( name, object ) {
  window.localStorage.setItem( name, JSON.stringify( object ));
}

export const remove = function ( name ) {
  window.localStorage.removeItem( name );
}