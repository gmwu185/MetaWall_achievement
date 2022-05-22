var express = require('express');
var router = express.Router();

const appError = require('../customErr/appError');
const handleError = require('../handStates/handleError');

const { isAuth, generateSendJWT } = require('../handStates/auth');
const UsersControllers = require('../controllers/users');

// 列出全部會員 (後台)
// router.get('/', UsersControllers.listUsers());
// 新增單筆會員 (後台)
// router.post('/', UsersControllers.createdUser());
// 取得登入者個人資訊
router.get('/ownProfile', isAuth, UsersControllers.ownProfile());
// 註冊
router.post('/signUp', UsersControllers.signUp());
// 登入
router.post('/login', UsersControllers.login());
// 修改會員資料
router.patch('/patchProfile', isAuth, UsersControllers.patchProfile());
// 修改密碼
router.patch('/updatePassword', isAuth, UsersControllers.updatePassword());

module.exports = router;
