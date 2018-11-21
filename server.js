const express = require("express");
const app = express();

var fs = require('fs'),
  path = require('path')


app.use(express.static("dist"));

app.get()

app.get("*", (req, res) => {
  res.sendFile(`${__dirname}/dist/index.html`);
});

const port = process.env.PORT || 9000;

app.listen(port, () => {
  console.log("server listening on port: ", port);
});
