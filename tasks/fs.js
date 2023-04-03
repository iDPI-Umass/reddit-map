import FS from "node:fs/promises";
import Path from "node:path";
import { createHash } from "node:crypto";
import fglob from "fast-glob";
import mime from "mime";

// Filesystem substrate improvements to aid infrastructure tasks.
const parse = function( path ) {
  const { dir, name, ext } = Path.parse( path );
  return {
    path: path,
    directory: dir,
    name: name,
    extension: ext,
    type: mime.getType( ext )
  };
};

const glob = async function( pattern, root ) {
  const paths = await fglob( pattern, {
    cwd: root
  });

  const files = [];
  for ( const path of paths ) {
    files.push({
      root,
      ...parse( path )
    });
  }

  return files;
};

const readText = async function ( file ) {
  const { root, path } = file;
  file.content = await FS.readFile( Path.join( root, path ), "utf8" );
  return file;
};

const readBinary = async function ( file ) {
  const { root, path } = file;
  file.content = await FS.readFile( Path.join( root, path ), null );
  return file;
};

const computeHash = function( input ) {
  const _hash = createHash( "md5" );
  // see: https://nodejs.org/api/buffer.html#buffers-and-character-encodings
  _hash.update( input, "binary" );
  return _hash.digest( "hex" );
};

const hash = function ( file ) {
  file.hash16 = computeHash( file.content );
  file.hash64 = Buffer.from( file.hash16, "hex" ).toString( "base64" );
  return file;
}

const exists = async function ( path ) {
  try {
    await FS.stat( path );
    return true;
  } catch ( error ) {
    return false;
  }
};




export {
  parse,
  glob,
  readText,
  readBinary,
  computeHash,
  hash,
  exists
};