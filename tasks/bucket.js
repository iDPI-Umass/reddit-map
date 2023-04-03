import * as S3 from "@dashkite/dolores/bucket";

const checkBucket = async function ( bucket ) {
  const exists = await S3.hasBucket( bucket.name );

  if ( exists !== true ) {
    throw new Error( `Bucket ${ bucket.name } is not configured.` );
  }
};

const check = async function ( config ) {
  for ( const bucket of config.buckets ) {
    await checkBucket( bucket );
  }
};


const deployBucket = async function ( bucket ) {
  await S3.putBucket( bucket.name );

  // Place the bucket into website mode.
  await S3.putBucketPolicy( bucket.name, {
    Version: "2012-10-17",
    Statement: [{
      Sid: "Web Site Access",
      Effect: "Allow",
      Principal: "*",
      Action: "s3:GetObject",
      Resource: `arn:aws:s3:::${ bucket.name }/*`
    }]
  });

  if ( bucket.website != null ) {
    await S3.putBucketWebsite( bucket.name, bucket.website );
  } else if ( bucket.redirect != null ) {
    await S3.putBucketRedirect( bucket.name, bucket.redirect );
  }
};

const deploy = async function ( config ) {
  for ( const bucket of config.buckets ) {
    await deployBucket( bucket );
  }
};


const teardownBucket = async function ( bucket ) {
  await S3.emptyBucket( bucket.name );
  await S3.deleteBucket( bucket.name );
};

const teardown = async function ( config ) {
  for ( const bucket of config.buckets ) {
    await teardownBucket( bucket );
  }
};


// Peforms an optimized sync with the site's S3 bucket. This will target differences
// in the S3 bucket relative to the local directory. Local directory is authoritative.
const sync = async function( config, files ) {
  const bucket = config.buckets[0].name
  const operations = [];

  // first, get a dictionary of published items
  const published = {};
  const objects = await S3.listObjects( bucket );
  for ( const object of objects ) {
    published[ object.Key ] = Object.assign( object, {
      ETag: JSON.parse( object.ETag )
    });
  }
  
  
  // next, iterate thru the filesystem looking for differences.
  for ( const file of files ) {
    const key = file.path;
    const remote = published[ key ];
    if ( remote == null) {
      operations.push({ type: "add", key, file });
      delete published[ key ];
    } else if ( file.hash16 != remote.ETag ) {
      operations.push({ type: "update", key, file });
      delete published[ key ];
    } else {
      delete published[ key ];
    }
  }


  // anything left in published has no local counterpart, so delete it
  for ( const key in published ) {
    operations.push({ type: "delete", key });
  }

  
  // Process operations
  if (operations.length > 0 ) {  
    for ( const operation of operations ) {  
      if ( operation.type === "add" ) {
        console.log( `... add [ ${ operation.key } ]` );

        await S3.putObject({
          Bucket: bucket,
          Key: operation.key,
          ContentMD5: operation.file.hash64,
          ContentType: operation.file.type,
          Body: operation.file.content
        });

      } else if ( operation.type === "update" ) {
        console.log( `... update [ ${ operation.key } ]` );

        await S3.putObject({
          Bucket: bucket,
          Key: operation.key,
          ContentMD5: operation.file.hash64,
          ContentType: operation.file.type,
          Body: operation.file.content
        });
      
      } else if ( operation.type === "delete" ) {
        console.log( `... delete [ ${ operation.key } ]` );
        await S3.deleteObject( bucket, operation.key );
      }
    }
  } else {
    console.log( "No file sync required." );
  }

};

export {
  check,
  deploy,
  teardown,
  sync
}