var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  /** #swagger.tags = ['users (使用者)']
    *? #swagger.description = '取得所有使用者資料'
  */
  res.send('respond with a resource');
});

module.exports = router;
