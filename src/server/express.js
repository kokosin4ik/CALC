import express from "express";
import { diretoryTreeToObj } from "./utils";

//================WS================

const server = require("http").createServer();
const io = require("socket.io")(server);
let clients = [];

io.on("connection", client => {
  client.on("subscribeToTimer", interval => {
    console.log("client is subscribing to timer with interval ", interval);
    // setInterval(() => {
    //   client.emit('timer', new Date());
    // }, interval);
  });
});

server.listen(3000, function(err) {
  if (err) throw err;
  console.log("WS listening on port 3000");
});
//==================================

const serv = express();

const webpack = require("webpack");
const config = require("../../config/webpack.dev.js")(
  {},
  { mode: "development" }
);
const compiler = webpack(config);

const webpackDevMiddleware = require("webpack-dev-middleware")(
  compiler,
  config.devServer
);

const webpackHotMiddleware = require("webpack-hot-middleware")(compiler);

/**
 * Use correct order for middlewares
 */
serv.use(webpackDevMiddleware);
serv.use(webpackHotMiddleware);

const staticMiddleware = express.static("dist");

serv.use(staticMiddleware);

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
// router.get('/', function(req, res) {
//   res.json({ message: 'hooray! welcome to our api!' });
// });

router.get("/files", function(req, res) {
  var dirTree = "./bin_generator";

  diretoryTreeToObj(dirTree, function(err, data) {
    if (err) console.error(err);
    // console.log(__di);
    res.json({ message: data });
  });
});

router.get("/script", function(req, res) {
  const exec = require("child_process").exec;
  const testscript = exec(
    "./run.sh",
    {
      cwd: "./bin_generator"
    },
    (err, stdout) => {
      let hashes = stdout
        .split("USEFULL")[1]
        .split("\n")
        .filter(str => str.length !== 0);

      var dirTree = "./bin_generator/out";

      diretoryTreeToObj(dirTree, function(err, data) {
        if (err) console.error(err);
        // console.log(__di);
        res.json({
          hashes,
          files: data
        });
      });
    }
  );
  // console.log(testscript)
  // res.json({ message : 'adsadad'})
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
serv.use("/api", router);

// =============================================================================
serv.get("/", (req, res) => {});

serv.listen(8080, () => {
  console.log("Server is listening");
});
