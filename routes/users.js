var express = require('express');
var router = express.Router();

const { isAuth, generateSendJWT } = require('../handStates/auth');
const UsersControllers = require('../controllers/users');

router.get(
  '/admin/listUsers',
  isAuth,
  /** #swagger.summary = '列出全部會員 (後台)',
    * #swagger.description = '列出全部會員 (後台)',
    * #swagger.tags = ['users (使用者)'],
    * #swagger.security = [{
      'apiKeyAuth': []
    }],
   */
  (req, res, next) => UsersControllers.listUsers(req, res, next)
);
router.post('/admin/createdUser', isAuth, (req, res, next) =>
  /** #swagger.summary = '新增單筆會員 (後台)',
    * #swagger.description = '新增單筆會員 (後台)',
    * #swagger.tags = ['users (使用者)'],
    * #swagger.security = [{
      'apiKeyAuth': []
    }],
   */
  UsersControllers.createdUser(req, res, next)
);
router.post('/login', (req, res, next) =>
  /** #swagger.summary = '使用者登入',
    * #swagger.description = `
      <ul>
        <li>登入以 mail 為帳號</li>
        <li>忘記密碼就完蛋了 (去資料庫撈是加密的也沒用)，密碼由 Token 解密轉換</li>
        <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
      </ul>
    `,
    * #swagger.tags = ['users (使用者)']
    * #swagger.parameters['body'] = {
      in: "body",
      type: "object",
      required: "success",
      description: ``,
      schema: {
        "$email": "min-@mail.com",
        "$password": "12345678"
      }
    },
    * #swagger.responses[200] = {
      description: '登入資訊',
      schema: {
        status: 'success',
        data: {
          "token": "Token",
          "name": "王小明",
          "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
        }
      }
    },
  */
  UsersControllers.login(req, res, next)
);
router.post('/signUp', (req, res, next) =>
  /** #swagger.summary = '使用者註冊"
    #swagger.description = `
      <ul>
        <li>密碼產生 Token 後至其他 users API 使用</li>
        <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
        <li>欄位 <code>"gender"</code> 只能接受 <code>"male"</code>、<code>"female"</code>、<code>""</code>。</li>
      </ul>
    `,
    * #swagger.tags = ['users (使用者)'],
    * #swagger.parameters['body'] = {
      in: "body",
      type: "object",
      required: "success",
      description: ``,
      schema: {
        "$userName": "小明",
        "$email": "min-@mail.com",
        "$password": "12345678",
        "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
        "gender": "male",
      }
    },
    * #swagger.responses[200] = {
      description: '註冊資訊',
      schema: {
        "status": "success",
        "data": {
          "token": "token",
          "userName": "小明"
        }
      }
    }
  */
  UsersControllers.signUp(req, res, next)
);
router.get(
  '/ownProfile',
  isAuth,
  /** #swagger.summary = '取得登入者個人資訊'
    #swagger.description = `
      <ul>
        <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
      </ul>
    `,
    * #swagger.tags = ['users (使用者)']
    * #swagger.security = [{
      'apiKeyAuth': []
    }],
    * #swagger.responses[200] = {
      description: 'user 資訊',
      schema: {
        status: 'success',
        data: {
          _id: '123123123',
          name: '王小明',
          photo: '',
          gender: 'male'
        }
      }
    }
  */
  (req, res, next) => UsersControllers.ownProfile(req, res, next)
);
router.patch(
  '/patchProfile',
  isAuth,
  /** #swagger.summary = '修改會員資料',
    #swagger.description = `
    <ul>
      <li>帶入 user Token，格式 <code>Bearer ＜Token＞</code></li>
      <li>忘記密碼就完蛋了 (去資料庫撈是加密的也沒用)，密碼由 Token 解密轉換。</li>
      <li>欄位 <code>"gender"</code> 只能接受 <code>"male", "female"</code>。</li>
    </ul>
    `,
    * #swagger.tags = ['users (使用者)']
    * #swagger.security = [{
      'apiKeyAuth': []
    }],
    * #swagger.parameters['body'] = {
      in: 'body',
      type: 'object',
      required: "success",
      description: '資料格式',
      schema: {
        $userName: '大明',
        "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
        "gender": "male",
      }
    },
    * #swagger.responses[200] = {
      description: '修改資訊',
      schema: {
        status: "success",
        data: {
          "id": "id",
          "name": "王小明",
          "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
          "gender": "male"
        }
      }
    },
  */
  (req, res, next) => UsersControllers.patchProfile(req, res, next)
);
router.patch('/updatePassword', isAuth, (req, res, next) =>
  /** #swagger.summary = '修改會員密碼',
    #swagger.description = `
      <ul>
        <li>帶入 user Token，格式 <code>Bearer ＜Token＞</code></li>
        <li>忘記密碼就完蛋了 (去資料庫撈是加密的也沒用)，密碼由 Token 解密轉換。</li>
      </ul>
    `,
    * #swagger.tags = ['users (使用者)']
    * #swagger.security = [{
      'apiKeyAuth': []
    }],
    * #swagger.parameters['body'] = {
      in: 'body',
      type: 'object',
      required: true,
      description: '資料格式',
      schema: {
        $newPassword: '11223344',
        $confirmNewPassword: '11223344'
      }
    },
    * #swagger.responses[200] = {
      description: '修改資訊',
      schema: {
        status: "success",
        data: {
          "token": "token",
          "name": "王小明",
          "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
        }
      }
    },
  */
  UsersControllers.updatePassword(req, res, next)
);

module.exports = router;
