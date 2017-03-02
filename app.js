'use strict';

var express = require('express');
var request = require('request');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.get('/', (req, res) => {
  res.send(process.env.test);
});

app.listen(app.get('port'), () => {
  console.log("Node app is running at localhost:" + app.get('port'));
});
