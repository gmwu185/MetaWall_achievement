var express = require('express');
var router = express.Router();

const appError = require('../customErr/appError');
const handleError = require('../handStates/handleError');

const { isAuth, generateSendJWT } = require('../handStates/auth');
const UsersControllers = require('../controllers/users');

router.get('/', handleError(UsersControllers.listUsers)); // 列出全部會員 (後台)
router.post('/', handleError(UsersControllers.createdUser)); // 新增單筆會員 (後台)
router.post('/signUp', handleError(UsersControllers.signUp)); // 註冊
router.post('/login', handleError(UsersControllers.login)); // 登入
router.patch(
  '/patchProfile',
  isAuth,
  handleError(UsersControllers.patchProfile)
); // 修改會員資料
router.patch(
  '/updatePassword',
  isAuth,
  handleError(UsersControllers.updatePassword)
); // 修改密碼

module.exports = router;
