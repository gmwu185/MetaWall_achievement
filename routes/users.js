var express = require('express');
var router = express.Router();

const appError = require('../customErr/appError');
const UsersControllers = require('../controllers/users');

router.get('/', UsersControllers.listUsers); // 列出全部會員
router.post('/', UsersControllers.createdUser); // 新增單筆會員
router.post('/signUp', UsersControllers.signUp); // 註冊
router.post('/login', UsersControllers.login); // 登入
router.patch('/patchProfile', UsersControllers.patchProfile); // 修改會員資料
router.patch('/updatePassword', UsersControllers.updatePassword); // 修改密碼

module.exports = router;
