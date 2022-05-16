var express = require('express');
var router = express.Router();

var router = express.Router();
const UsersControllers = require('../controllers/users');

router.post('/', UsersControllers.createdUser);

module.exports = router;
