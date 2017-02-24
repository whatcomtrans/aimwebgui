// Simple web server to host static client files (see html) and proxy API requests to AIM server

var aimServer = 'http://aim.whatcomtrans.net';
var listenPort = 80;


var app = require('express')();
var httpProxy = require('http-proxy');
//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

app.use(express.static('html'));

app.get('/api', function (req, res) {
  proxy.web(req, res, { target: aimServer });
})

app.listen(listenPort, function () {
  console.log('Example app listening on port ' + listenPort.toString() + '!')
})