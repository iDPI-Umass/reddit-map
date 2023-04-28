import Path from "node:path";
import FS from "node:fs/promises";
import * as _FS from "./fs.mjs";


const read = async function ( file ) {
  return ( await _FS.readText(file) ).content;
}

const storeData = async function ( file ) {
  const metadata = JSON.parse( await read(file) );

  for ( const key in metadata ) {
    const entry = metadata[ key ];
    const path = `data-api/metadata/${ key }.json`;
    await FS.writeFile( path, JSON.stringify(entry) );
  }
}

const prepare = async  function () {
  const files = await _FS.glob( "**/*", "react/data/subreddit_metadata" );
  for ( const file of files ) {
    await storeData( file );
  }
};

export {
  prepare
}