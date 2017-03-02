'use strict';

var express = require('express');
var request = require('request');
var querystring = require('querystring');

var app = express();

var clientId = 'cd02dc9c9a0783ffb9f7';
var clientSecret = process.env.ghsecret;

app.set('port', (process.env.PORT || 5000));

app.get('/', (req, res) => {
  if (!req.query.code) return res.send('missing code');

  request.post({
    url:'https://github.com/login/oauth/access_token',
    formData: {
      client_id: clientId,
      client_secret: clientSecret,
      code: req.query.code
    }
  }, function(err, accessTokenResponse) {
    if (accessTokenResponse.statusCode !== 200) return res.status(accessTokenResponse.statusCode).send();

    var queryStringParts = querystring.parse(accessTokenResponse.body);

    if (queryStringParts.error) return res.status(500).send(queryStringParts.error_description);

    res.send(JSON.stringify(queryStringParts));
  });
});

app.listen(app.get('port'), () => {
  console.log("Node app is running at localhost:" + app.get('port'));
});
