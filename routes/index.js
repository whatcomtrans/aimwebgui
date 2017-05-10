var express = require('express');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'Monitor Configuration'});
});

router.get('/:id', function(req, res, next) {
	//server side logic here
	var id = req.params.id;
	res.render('index', {user: id, title: 'Monitor Configuration'});
});

module.exports = router;