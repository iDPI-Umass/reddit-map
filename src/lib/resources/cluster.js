// TODO: Move to configuration.
import * as d3 from "d3";
import { Library } from "@observablehq/stdlib";

const baseURL = "https://data.redditmap.social";
const library = new Library();


const getJSON = async function ( name ) {
  const url = `${ baseURL }/${ name }`;
  const options = {
    method: "GET",
    mode: "cors",
    redirect: "follow",
    headers: {
      Accept: "application/json"
    }
  };

  const response = await fetch( url, options );

  if ( response.status === 200 ) {
    return await response.json();
  }

  if ( response.status === 404 ) {
    console.warn( `JSON file ${ name } not found` );
    return null;
  }

  throw new Error( `Unexpected response status ${ response.status }` );
};

// Preprocess returned data to assist the engine's calculations.
const _decorate = function ( child, boundaries, counts ) {
  child.data.displayLabel = child.data.subreddit ?? child.data.taxonomy_label;

  const color = child.data.color ?? "#FFFFFF";
  child.data.colorHalf = `${ color }80`;
  child.data.colorQuarter = `${ color }40`;

  if ( child.data.tsne_x != null ) {
    child.data.tsne_x = Number( child.data.tsne_x );
  }
  if ( child.data.tsne_y != null ) {
    child.data.tsne_y = Number( child.data.tsne_y );
  }
  if ( child.data.comment_count != null ) {
    child.data.comment_count = Number( child.data.comment_count );
  }

  if ( child.data.subreddit != null ) {
    const { tsne_x, tsne_y, comment_count } = child.data;
    counts.push(comment_count);

    if ( tsne_x < boundaries[0] ) {
      boundaries[0] = tsne_x;
    }
    if ( tsne_x > boundaries[1] ) {
      boundaries[1] = tsne_x;
    }
    if ( tsne_y < boundaries[2] ) {
      boundaries[2] = tsne_y;
    }
    if ( tsne_y > boundaries[3] ) {
      boundaries[3] = tsne_y;
    }

    if ( comment_count < boundaries[4] ) {
      boundaries[4] = comment_count
    }
    if ( comment_count > boundaries[5] ) {
      boundaries[5] = comment_count
    }
  }


  if ( child.children != null ) {
    for ( const _child of child.children ) {
      _decorate( _child, boundaries, counts );
    }
  }
};

// const bin = function ( ax, boundaries ) {
//   const start = boundaries[4];
//   const end = boundaries[5];
//   const range = end - start;
//   const bucketCount = Math.round( Math.sqrt( ax.length ) );
//   const bucketWidth = range / bucketCount;
//   console.log( bucketCount, range, bucketWidth );

//   const buckets = new Array( bucketCount );
//   buckets.fill( 0, 0 );
//   for ( const value of ax ) {
//     let i = Math.floor( (value - start) / bucketWidth );
//     if ( i > 99) {
//       i =  99;
//     }
//     buckets[i]++;
//   }

//   console.log(buckets);
// }

const decorate = function ( root ) {
  const boundaries = [
    1E6, 0,
    1E6, 0,
    1E6, 0,
  ];

  const counts = []

  _decorate( root, boundaries, counts );

  // bin( counts, boundaries )

  root.boundaries = boundaries;
  return root;
};

const get = async function ( date ) {
  const path = `RC_${ date }_KMeans_Agglom_100_Clusters_Updated_Mapping.json`;
  const data = d3.hierarchy( await getJSON( path ));
  return decorate( data )
};

export {
  get
}

