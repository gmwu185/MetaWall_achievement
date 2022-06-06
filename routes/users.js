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
router.get(
  '/admin/getUser/:id',
  isAuth,
  /** #swagger.summary = '列出單筆會員 (後台)',
    * #swagger.description = '列出單筆會員 (後台)',
    * #swagger.tags = ['users (使用者)'],
    * #swagger.security = [{
      'apiKeyAuth': []
    }],
    * #swagger.parameters['id'] = {
        in: 'path',
        type: 'string',
        description: `
          <ul>
            <li>Params Path Variables <code>:id</code> (user ID)</li>
          </ul>
        `,
      },
   */
  UsersControllers.getUser
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
          "gender": "male",
          "premiumMember": true
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
router.post(
  '/refreshToken',
  isAuth,
  /** #swagger.summary = '更新token'
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
      description: '同登入的資訊',
      schema: {
        status: 'success',
        data: {
          "token": "Token",
          "name": "王小明",
          "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
          "gender": "male",
          "premiumMember": true
        }
      }
    },
  */
  UsersControllers.refreshToken
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
          "premiumMember": {
            "paid": 1,
            "pay": "629727dce2cc9e17f4edaf7d",
            "startAt": "2022-06-01T08:48:28.701Z"
          },
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
router.post(
  '/:id/follow',
  isAuth,
  /** #swagger.summary = '新增追蹤',
    * #swagger.tags = ['users (追蹤)'],
    * #swagger.security = [{
      'apiKeyAuth': []
    }],
    * #swagger.description = `取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。`,
    * #swagger.parameters['id'] = {
      description: `網址參數 <code>:id</code> 指定追蹤對象的 <code>user.id</code>。`
    },
    * #swagger.responses[200] = {
      schema: {
        "status": "success",
        "data": {
          "message": "您已成功將 628a629b1c4b458a51db745b 加入追蹤！"
        }
      }
    }
   */
  (req, res, next) => UsersControllers.addFollow(req, res, next)
);
router.delete(
  '/:id/follow',
  isAuth,
  /** #swagger.summary = '取消追蹤',
    * #swagger.tags = ['users (追蹤)'],
    * #swagger.security = [{
        'apiKeyAuth': []
      }],
    * #swagger.description = `取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。`,
    * #swagger.parameters['id'] = {
        description: `網址參數 <code>:id</code> 指定追蹤對象的 <code>user.id</code>。`
      },
    * #swagger.responses[200] = {
        schema: {
          "status": "success",
          "data": {
            "message": "您已成功將 628a629b1c4b458a51db745b 取消追蹤！"
          }
        }
      }
  */
  (req, res, next) => UsersControllers.unFollow(req, res, next)
);
router.get(
  '/follow',
  isAuth,
  /** #swagger.summary = '取得使用者追蹤名單',
  * #swagger.tags = ['users (追蹤)'],
  * #swagger.security = [{
      'apiKeyAuth': []
    }],
  * #swagger.description = `取得 JWT 使用者的追蹤 (<code>following</code>) 與被追蹤對象 (<code>followers</code>)`,
  * #swagger.responses[200] = {
      schema: {
        "status": "success",
        "data": {
          "followers": [
            {
              "userData": {
                "_id": "628a629b1c4b458a51db745b",
                "createAt": "2022-05-22T16:19:39.136Z",
                "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
                "userName": "大明一"
              },
              "_id": "6299b7b3896e3dab06e506ba",
              "createdAt": "2022-06-03T07:26:43.382Z"
            }
          ],
          "following": [
            {
              "userData": {
                "_id": "628a629b1c4b458a51db745b",
                "createAt": "2022-05-22T16:19:39.136Z",
                "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
                "userName": "大明一"
              },
              "_id": "6299bac06b06dd973601fc85",
              "createdAt": "2022-06-03T07:39:44.356Z"
            }
          ]
        }
      }
    }
  */
  (req, res, next) => UsersControllers.getFollows(req, res, next)
);

module.exports = router;
