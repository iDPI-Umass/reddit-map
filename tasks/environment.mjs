import Path from "node:path";
import FS from "node:fs/promises";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import YAML from "js-yaml";

const args = yargs( hideBin( process.argv )).argv;

const check = async function () {
  const environments = YAML.load( await FS.readFile( Path.resolve( "ensemble.yaml" )));
  const config = environments[ args.environment ];
  if ( config == null ) {
    throw new Error( "Environment is not defined." );
  }

  console.log(process.env.AWS_ACCESS_KEY_ID);
  console.log(process.env.AWS_SECRET_ACCESS_KEY);

  config.environment = args.environment;
  config.args = args;

  if ( config.buckets == null ) {
    config.buckets = [];
  }

  return config;
};

export {
  check
}