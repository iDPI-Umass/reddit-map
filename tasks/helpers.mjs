const getFlag = function ( name, config ) {
  const value = config.args[ name ];
  if ( value == null ) {
    throw new Error( `command flag \"${ name }\" is not set.` );
  }
  return value;
};

export {
  getFlag
}