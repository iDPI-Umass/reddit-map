import Path from "node:path";
import * as Task from "./tasks/index.js";


const build = async function () {
  await Task.Shell.run( "react-scripts build" );
  await Task.Directory.copy({
    source: Path.resolve( "src", "data" ),
    destination: Path.resolve( "data-api" )
  });
};

const deploy = async function () {
  const config = await Task.Environment.check();
  await Task.Bucket.deploy( config );
  await Task.Edge.deploy( config );
};

const teardown = async function () {
  const config = await Task.Environment.check();
  await Task.Edge.teardown( config );
  await Task.Bucket.teardown( config );
};

const publish = async function () {
  const config = await Task.Environment.check();
  const files = await Task.Directory.read( "data-api" );
  await Task.Bucket.check( config );
  await Task.Bucket.sync( config, files );

  // Only cache invalidate for environments that use caching.
  if ( config.edge.ttl.default > 0 ) {
    await Task.Edge.invalidate( config );
  }
};


export {
  build,

  deploy,
  teardown,
  publish
}