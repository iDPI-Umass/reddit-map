const parse = function ( page ) {
  const { url, params } = page;

  const query = {};
  for ( const [ key, value ] of url.searchParams ) {
    query[ key ] = value;
  }

  return { 
    bindings: {
      ...params,
      ...query
    }
  };
}


const Oxygen = { parse };

export default Oxygen; 