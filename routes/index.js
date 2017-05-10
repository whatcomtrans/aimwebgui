var express = require('express');
var router = express.Router();
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Monitor Configuration'});
});

router.get('/:id', function(req, res, next) {
	//server side logic here
	var id = req.params.id;
	res.render('index', {user: id, title: 'Monitor Configuration'});
});

router.get('/api', function (req, res) {
	proxy.web(req, res, { target: aimServer });
});

module.exports = router;