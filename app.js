'use strict';

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var request = require('request');
var bodyParser = require('body-parser');
var xhub = require('express-x-hub');
var querystring = require('querystring');

var clientId = 'cd02dc9c9a0783ffb9f7';
var clientSecret = process.env.ghsecret;
var webHookSecret = process.env.ghsecret;

io.sockets.on('connection', (socket) => {
  console.log('socket connected!');
  socket.on('room', (room) => {
    console.log('socked joined room', room);
    socket.join(room);
  });
});

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

app.post('/subscribe', bodyParser.json(), (req, res) => {
  let repo = req.body.repo;
  let token = req.body.token;

  var fullUrl = req.protocol + '://' + req.get('host') + '/hook';

  request.post({
    url: `https://api.github.com/repos/${repo}/hooks`,
    headers: {
      Authorization: `token ${token}`,
      'User-Agent': 'User boblauer, Application GitHub Event Stream'
    },
    json: {
      name: 'web',
      active: true,
      events: ['*'],
      config: {
        url: fullUrl,
        content_type: 'json',
        secret: webHookSecret
      }
    }
  }).pipe(res);
});

app.post('/hook', xhub({ algorithm: 'sha1', secret: webHookSecret }), (req, res) => {
  if (!req.isXHubValid()) return res.status(404).send();

  var room = 'ifit/ifit'; // get room from req object
  var payload = { data: true }; // get data from req object.
  io.sockets.in(room).emit('message', payload);

  res.status(204).send();
});

server.listen(app.get('port'), () => console.log(`Node app is running on port: ${app.get('port')}`));
