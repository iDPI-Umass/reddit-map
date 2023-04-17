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

// Preprocess returned data to assist the engine's calculations. Takes an array
// to go through children, so we need to also place the root into one temporarily.
const decorate = function ( children ) {
  for ( const child of children ) {
    child.data.displayLabel = child.data.subreddit ?? child.data.taxonomy_label;

    const color = child.data.color ?? "#FFFFFF";
    child.data.colorLeaf = `${ color }80`;
    child.data.colorBubble = `${ color }40`;

    if ( child.data.tsne_x != null ) {
      child.data.tsne_x = Number( child.data.tsne_x );
    }
    if ( child.data.tsne_y != null ) {
      child.data.tsne_y = Number( child.data.tsne_y );
    }
    if ( child.data.subreddit_count != null ) {
      child.data.subreddit_count = Number( child.data.subreddit_count );
    }

    if ( child.children != null ) {
      decorate( child.children );
    }
  }
};

const get = async function ( date ) {
  const path = `RC_${ date }_KMeans_Agglom_100_Clusters_Updated_Mapping.json`;
  const data = d3.hierarchy( await getJSON( path ));
  decorate([ data ]);
  return data; 
};

export {
  get
}

