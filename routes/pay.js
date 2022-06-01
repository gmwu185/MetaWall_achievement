var express = require('express');
var router = express.Router();
const { isAuth } = require('../handStates/auth');

const PayController = require('../controllers/pay');

router.get('/', isAuth, PayController.createPay());

router.post('/tradeConfirm', PayController.tradeConfirm());

router.get('/tradeResult/:id', isAuth, PayController.getTradeResult());

module.exports = router;
