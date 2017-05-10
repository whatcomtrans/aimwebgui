var aimServer = 'http://aim.whatcomtrans.net';

var express = require('express');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function(req, res) {
  proxy.web(req, res, { target: aimServer });
});
 
console.log("listening on port 5050")
server.listen(5050);

var router = express.Router();

router.get('/', function (req, res, next) {
	proxy.web(req, res, { target: aimServer });
});

module.exports = router;