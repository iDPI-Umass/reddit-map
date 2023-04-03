import Path from "node:path";
import FS from "node:fs/promises";
import * as _FS from "./fs.js";

const read = async function ( root ) {
  const files = await _FS.glob( "**/*", root );
  console.log( files );
  process.exit();


  for ( const file of files ) {
    await _FS.readBinary( file );
    _FS.hash( file );
  }

  return files;
};

const copy = async function ({ source, destination }) {
  if ( !( await _FS.exists(destination))) {
    await FS.mkdir( destination, { recursive: true } );
  }

  const files = await _FS.glob( "**/*", source );
  for ( const file of files ) {
    await FS.copyFile(
      Path.join( file.root, file.path ),
      Path.join( destination, file.path )
    );
  }
};

export {
  read,
  copy
}