import Child, { spawn } from "node:child_process";


const run = function ( command ) {
  const [ main, ...args ] = command.split( /\s+/ );

  return new Promise( function ( resolve ) {
    const spawnObject = Child.spawn( main, args, { 
      stdio: [ "ignore", "inherit", "inherit" ]
    });
    
    spawnObject.on( "close", function ( code ) {
      resolve( code );
    });
  });
};

export {
  run
}
