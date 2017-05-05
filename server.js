// Simple web server to host static client files (see html) and proxy API requests to AIM server

var aimServer = 'http://aim.whatcomtrans.net';
var listenPort = 80;

var express = require('express');
var app = express();
var httpProxy = require('http-proxy');
//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

app.use(express.static('html'));
app.use(express.static('lib'));
app.use(express.static('bower_components'));

app.get('/api', function (req, res) {
  console.log(req.url);
  proxy.web(req, res, { target: aimServer });
});

app.listen(listenPort, function () {
  console.log('Example app listening on port ' + listenPort.toString() + '!')
});