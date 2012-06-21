#!/usr/local/bin/node
(function() {
  var defaultString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()_+~-=`[]{}\\:;'\"";
  function randomString(length, candidates) {
    var ret = ''
      , range
      ;
    candidates = (candidates || defaultString).split('');
    range = candidates.length;
    while (length--) {
      ret += candidates[Math.floor(Math.random() * range)];
    }
    return ret;
  }

  String.random = randomString;
}());

var app = require("express").createServer()
  , io = require("socket.io").listen(app)
  , crypto = require("crypto")
  , clients = {}
  , host = '175.41.196.117'
  , port = 8800
  ;

app.get("/:id", function(req, res) {
  var client = clients[req.params.id];
  if (!client) {
    setTimeout(function() {
      res.end('Requested id doesn\'t exist.');
    }, 3000);
    return;
  }
  res.end("reload " + req.params.id);
  client.send("reload now!");
});

io.sockets.on("connection", function(client) {
  var r = String.random(16)
    , t = Date.now()
    , id = client.id
    , connectionId = crypto.createHash('md5')
                     .update(id + t + r)
                     .digest('base64')
                     .replace(/\//g, '_')
                     .replace(/=+$/, '')
    ;
  clients[connectionId] = client;
  client.on('disconnect', function() {
    delete clients[connectionId];
  });
  client.send('http://' + host + ':' + port + '/' + connectionId);
});

app.listen(port);
