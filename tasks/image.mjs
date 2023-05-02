import fetch from "node-fetch";
import ProgressBar from "progress";
import * as It from "@dashkite/joy/iterable"
import * as S3 from "@dashkite/dolores/bucket";
import * as _FS from "./fs.mjs";


const getImage = async function ( name ) {
  const url = `https://ihopmeag.s3.us-east-2.amazonaws.com/reddit_images/${ name }.png`;
  const options = {
    method: "GET",
    headers: {
      Accept: "image/png"
    }
  };

  const response = await fetch( url, options );
  if ( response.status === 404 ) {
    return null;
  }
  
  const stream = response.body;
  const data = [];
  return new Promise( function( resolve, reject ) {
    stream.on( "data", function ( bytes ) {
      data.push( ...bytes );
    });

    stream.on( "close", function () {
      resolve( Buffer.from(data) );
    });
  });
};

const transferImage = async function ( file ) {
  const image = await getImage( file.name );
  if ( image == null ) {
    console.log(`image not found for ${file.name}`);
    return null;
  }
  
  await S3.putObject({
    Bucket: "data.redditmap.social",
    Key: `images/${ file.name }.png`,
    ContentType: "image/png",
    Body: image
  });
};


const transfer = async function () {
  const files = await _FS.glob( "**/*", "data-api/metadata" );
  
  const bar = new ProgressBar( "processing [:bar] :percent :current :rate/s :etas", {
    total: files.length,
    width: 40,
    complete: "=",
    incomplete: " "
  });

  const size = 50;

  for ( const batch of It.partition(size, files) ) {
    const promises = [];

    for ( const file of batch ) {
      promises.push( transferImage(file) );
    }

    await Promise.all( promises );
    bar.tick( size );
  }

};

export {
  transfer
}