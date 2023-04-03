import Path from "node:path";
import express from "express";


const run = function () {
  let port = 4173;
  let app = express();
  app.use( express.static( Path.resolve( "build" ),
   { extensions: [ "html" ] }
  ));

  app.get("/*", function (req, res) {
    res.sendFile( Path.resolve( "build", "index.html" ));
  })

  app.listen( port );
  
  console.log( `Preview server running on http://localhost:${port}` );  
};

export {
  run
}