var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/posts', function (req, res, next) {
  console.log('/posts req.url', req.url);
  res.json({ title: 'json' });
  res.end();
});

module.exports = router;
