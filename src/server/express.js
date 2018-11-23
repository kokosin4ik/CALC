import express from "express";
import { diretoryTreeToObj } from "./utils";
const fs = require("fs");
//================WS================

const server = require("http").createServer();
const io = require("socket.io")(server);
let clients = [];

io.on("end", function() {
  io.disconnect(0);
});
io.on("connection", client => {
  client.on("executeTask", async userTask => {
    const exec = require("child_process").exec;
    console.log(`curl http://127.0.0.1:8080/ipfs/${userTask} > taskbin`)
    exec(
      `curl http://127.0.0.1:8080/ipfs/${userTask} > taskbin`,
      {
        cwd: __dirname
      },
      (err, stdout) => {
        console.log(err);
        client.emit("execStatus", { status: "EXECUTE" });
        exec(
          `chmod +x taskbin`,
          {
            cwd: __dirname
          },
          (err, stdout) => {
            exec(
              `./taskbin`,
              {
                cwd: __dirname
              },
              (err, stdout) => {
                exec(
                  `cat result.txt`,
                  {
                    cwd: __dirname
                  },
                  (err, stdout) => {
                    client.emit("execStatus", {
                      status: "COMPLETE",
                      result: stdout
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  });

  client.on("checkTasks", async data => {
    let hashes = data.map(item => item.hash);
    let results = data.map(item => item.result);
    console.log(results);
    console.log(hashes);
    const execSync = require("child_process").execSync;
    var downloadPromises = [];
    let i = 0;
    console.log("START DOWNLOAD")
    for (i = 0; i < hashes.length; i++) {
      execSync(
        `curl http://127.0.0.1:8080/ipfs/${hashes[i]} > check_${i}`,
        {
          cwd: __dirname
        }
      );
      console.log(i)
      execSync(
        `chmod +x check_${i}`,
        {
          cwd: __dirname
        }
      );
      fs.writeFileSync(`${__dirname}/res_${i}.txt`, results[i]);
    }
    console.log("START EXEC");
    client.emit("checkStatus", { status: "EXECUTE" });
    let resultOfCheck = [];
    
    const exec = require("child_process").exec;
    const spawnSync = require("child_process").spawnSync;
    // let promisesArr = [];
    
    for (i = 0; i < results.length; i++) {
      console.log(i);
      const j = i;
      
      let output = spawnSync(`./check_${j}`,[`"$(cat res_${j}.txt)"`], {
        cwd: __dirname
      });
      
      resultOfCheck.push({
        hash: hashes[i],
        result: 1
      })
    }
    client.emit("checkStatus", { status: "COMPLETE", result: resultOfCheck });
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
        .slice(stdout.indexOf("%") + 1)
        .split("\n")
        .filter(str => str.length > 0)
        .map(str => str.split("\t"));

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
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
serv.use("/api", router);

// =============================================================================
serv.get("/", (req, res) => {});

serv.listen(8000, () => {
  console.log("Server is listening");
});
