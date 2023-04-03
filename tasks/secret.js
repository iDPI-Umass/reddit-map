import prompts from "prompts";
import { confidential } from "panda-confidential";
import * as Secret from "@dashkite/dolores/secrets";
import * as h from "./helpers.js";

const Confidential = confidential();


const generate = async function ({ type, name, bundle }) {
  let result;

  switch ( type ) {
    case "random-16":
      return Confidential.convert({ from: "bytes", to: "base36" },
        ( await Confidential.randomBytes( 16 ) ) );
    case "encryption-keypair":
      return ( await Confidential.EncryptionKeyPair.create() )
        .to( "base64" );
    case "signature-keypair":
      return ( await Confidential.SignatureKeyPair.create() )
        .to( "base64" );
    case "environment":
      result = proces.env[ name ];
      if ( variable == null ) {
        throw new Error( `Secret [ ${ name } ] environment variable not set` );
      } else {
        return result;
      }
    case "prompt":
      result = await prompts({
        type: "password",
        name: "value",
        message: `Enter secret [ ${ name } ]:`
      });
      return result.value;
    case "bundle":
      result = {};
      for ( const config of bundle ) {
        result[ config.name ] = await generate( config );
      }
      return JSON.stringify( result );
    default:
      throw new Error( "unknown secret type" );
  }
};


// Verify that all secrets in config exist
const check = async function ( config ) {
  const secrets = config.secrets ?? [];
  const missing = [];
  for ( const secret of config.secrets ) {
    const exists = await Secret.hasSecret( secret.name );
    if ( !exists ) {
      missing.push( secret.name );
    }
  }

  if ( missing.length > 0 ) {
    for ( const name of missing ) {
      console.warn( `Secret [ ${ name } ] does not exist` );
    }
    throw new Error( "secrets: check failed" );
  }
};

const findEntry = function ( _name, secrets ) {
  let entry;
  const [ name, subName ] = Secret.parseSecretName( _name );
  
  if ( subName != null ) {
    entry = secrets.find( secret => secret.name === name );
    return entry.bundle.find( secret => secret.name === subName );
  } else {
    return secrets.find( secret  => secret.name === name )
  }
};

// Update a specific secret, creating if it doesn't yet exist.
const put = async function ( config ) {
  const name = h.getFlag( "name", config );
  const secrets = config.secrets ?? [];
  const entry  = findEntry( name, secrets );

  if ( entry == null ) {
    throw new Error( `secrets: put secret failed, [ ${ name } ] is not configured.` );
  } else {
    const secret = await generate( entry );
    await Secret.setSecret( name, secret );
  }
};

// Cycle through all secrets and update only if they do not yet exist.
const putAll = async function ( config ) {
  const missing = []
  for ( const entry of config.secrets ) {
    const exists = await Secret.hasSecret( entry.name );
    if ( exists === false ) {
      missing.push( entry );
    }
  }

  if ( missing.length > 0 ) {
    for ( const entry of missing ) {
      try {
        const secret = await generate( entry );
        await Secret.setSecret( entry.name, secret );
        console.log( `updated secret [ ${ entry.name } ]` );
      } catch ( error ) {
        console.error( error.message );
      }
    }
  }
};

// Fetch and display a given secret from secrets' storage.
const get = async function ( config ) {
  const name = h.getFlag( "name", config );
  console.log(`\n${ await Secret.getSecret( name )}\n`);
};

// Remove a given secret from secrets' storage.
const remove = async function ( config ) {
  const name = h.getFlag( "name", config );
  await Secret.deleteSecret( name );
  console.log(`secret: deleted secret [ ${ name } ]`);
}


export {
  check,
  put,
  putAll,
  get,
  remove
}