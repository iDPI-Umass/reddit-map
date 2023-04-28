// TODO: Move to configuration.
const baseURL = "https://data.redditmap.social";


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


const get = async function ( subreddit ) {
  const path = `metadata/${ subreddit }.json`;
  return await getJSON( path );
};

export {
  get
}

