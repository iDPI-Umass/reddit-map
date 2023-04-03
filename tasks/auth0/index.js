import FS from "node:fs/promises";
import Path from "node:path";
import fetch from "node-fetch";
import * as Secret from "@dashkite/dolores/secrets";

const getManagementToken = async function ( bundle ) {
  const url = `${ bundle.tenant }/oauth/token`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: bundle.client,
      client_secret: bundle.secret,
      audience: `${ bundle.tenant }/api/v2/`
    }).toString()
  };

  const response = await fetch( url, options );
  if ( response.status !== 200 ) {
    console.error( response.status, await response.text() );
    throw new Error( "non 200 response while fetching Auth0 Management API Token");
  }

  const json = await response.json();
  return json.access_token;
};


const readTemplate = async function () {
  const path = Path.resolve( "tasks", "auth0", "login.liquid" );
  return await FS.readFile( path, "utf8" );
};

const putTemplate = async function ({ bundle, token, template }) {
  const url = `${ bundle.tenant }/api/v2/branding/templates/universal-login`;
  const options = {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${ token }`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ template })
  };

  const response = await fetch( url, options );
  if ( (response.status !== 201) && (response.status !== 204) ) {
    console.error( response.status, await response.text() );
    throw new Error( "unexpected response status while updating Universal Login Page Liquid template");
  }
};


const updateLogin = async function ( config ) {
  const secret = await Secret.getSecret( config.auth0Login.bundle );
  if ( secret == null ) {
    throw new Error( "the secret bundle specified in auth0Login.bundle is not found" );
  }

  const bundle = JSON.parse( secret );
  const token = await getManagementToken( bundle );
  const template = await readTemplate();
  await putTemplate({ bundle, token, template });
};

export {
  updateLogin
}