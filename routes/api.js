var aimServer = 'http://aim.whatcomtrans.net';
var listenPort = 3001;

var express = require('express');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});
var router = express.Router();

router.get('/', function (req, res) {
	proxy.web(req, res, { target: aimServer });
});

module.exports = router;