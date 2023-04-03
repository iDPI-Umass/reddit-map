import Path from "node:path";
import * as Text from "@dashkite/joy/text";
import * as Type from "@dashkite/joy/type";
import * as Route53 from "@dashkite/dolores/route53";
import * as CF from "@dashkite/dolores/stack";
import * as Distro from "@dashkite/dolores/cloudfront";
import _Templates from "@dashkite/template";
const Templates = _Templates.default;


const getStackName = function ( config ) {
  const namespace = config.namespace;
  const name = config.edge.name;
  const environment = config.environment;

  return `${ namespace }-${ environment }-${ name }`;
};

const getDescription = function ({ namespace, environment, edge }) {
  if ( edge.description != null ) {
    return edge.description;
  } else {
    return Text.titleCase( `${ namespace } ${ edge.name } ${ environment }` );
  }
};

const getTLD = function ( string ) {
  return string
    .split( "." )
    .slice( -2 )
    .join( "." );
};

const awsCase = function ( string ) {
  string = Text.normalize( string );
  string = Text.titleCase( string );
  string = Text.camelCase( string );
  string = Text.capitalize( string );
  return string;
};

const getAliases = function ( aliases ) {
  const results = [];
  for ( const alias of aliases ) {
    if ( Type.isString( alias ) ) {
      results.push({ domain: alias });
    } else {
      results.push( alias );
    }
  }
  return results;
};

const getOrigins = function ( origins ) {
  const results = [];
  for ( const origin of origins ) {
    const _origin = {
      domain: origin.domain,
      custom: {}
    };

    _origin.custom.httpPort = origin.httpPort || origin.port || 80;
    _origin.custom.httpsPort = origin.httpsPort || origin.port || 443;

    if ( origin.protocol === "http" ) {
      _origin.custom.https = false;
    } else {
      _origin.custom.https = true;
    }

    results.push( _origin );
  }

  return results;
}

const getCertificateAliases = function ( aliases ) {
  const result = {};
  for ( const alias of aliases ) {
    const tld = getTLD( alias.domain );
    if ( result[ tld ] == null ) {
      result[ tld ] = `*.${ tld }`;
    }
  }
  return Object.values( result );
};

const getDNSEntries = async function ( aliases ) {
  const result = {};
  for ( const alias of aliases ) {
    const tld = getTLD( alias.domain );
    if ( result[ tld ] == null ) {
      result[ tld ] = {
        tld: tld,
        zone: await Route53.getHostedZoneID( tld ),
        aliases: []
      };
    }
    result[ tld ].aliases.push( alias.domain );
  }
  return Object.values( result );
};

const getCache = function ( edge ) {
  const ttl = edge.ttl || {};
  const headers = edge.headers || [ "Authorization", "Host" ];

  const options = {
    ttl: {
      default: 0,
      min: 0,
      max: 31536000 // One year
    },
    compress: true,
    headers: headers,
    queries: "all"
  };

  if ( ttl.default != null ) {
    options.ttl.default = ttl.default;
  }

  if ( ttl.min != null ) {
    options.ttl.min = ttl.min;
  }

  if ( ttl.max != null ) {
    options.ttl.max = ttl.max;
  }

  return options;
};


const deploy = async function ( config ) {
  const templates = Templates.create( Path.resolve( "tasks", "edge", "templates" ));
  templates._.h.registerHelper({ awsCase });

  let name, namespace, environment, edge, aliases, origins;

  edge = config.edge;
  if ( edge.name == null ) {
    name = "edge";
  } else {
    name = edge.name;
  }
  namespace = config.namespace;
  environment = config.environment;
  aliases = getAliases( edge.aliases );
  origins = getOrigins( edge.origins );

  const options = {
    name: name,
    namespace: namespace,
    environment: environment,
    aliases: aliases,
    dns: await getDNSEntries( aliases ),
    cache: getCache( edge ),
    certificate: {
      verification: edge.certificate.verification,
      aliases: getCertificateAliases( aliases )
    }, 
    origins: origins,
    description: getDescription({ namespace, environment, edge })
  };

  const yaml = await templates.render( "cloudfront.yaml", options );
  await CF.deployStack( getStackName(config), yaml );
};

const teardown = async function ( config ) {
  const name = getStackName( config );
  await CF.deleteStack( name );
};


const invalidate = async function ( config ) {
  await Distro.invalidatePaths({
    domain: config.edge.aliases[0],
    paths: [ "/*" ]
  });
}

export {
  deploy,
  teardown,
  invalidate
}