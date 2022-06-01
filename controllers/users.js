const bcrypt = require('bcryptjs'); // 密碼加密
const validator = require('validator'); // 格式驗證
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const handleSuccess = require('../handStates/handleSuccess');
const handleError = require('../handStates/handleError');
const { isAuth, generateSendJWT } = require('../handStates/auth');
const appError = require('../customErr/appError');

const User = require('../model/users');

module.exports = {
  // 列出全部會員 (後台)
  listUsers() {
    /** #swagger.tags = ['users (使用者)']
     * #swagger.description = '列出全部會員 (後台)',
     */
    return handleError(async (req, res, next) => {
      const allUser = await User.find();
      handleSuccess(res, allUser);
    });
  },
  // 新增單筆會員 (後台)
  createdUser() {
    /** #swagger.tags = ['users (使用者)']
     * #swagger.description = '新增單筆會員 (後台)',
     */
    return handleError(async (req, res, next) => {
      const data = req.body;
      const user = {
        userName: data.userName,
        userPhoto: data.userPhoto, // 頭像
        email: data.email,
        password: data.password,
        gender: data.gender, // 性別
      };
      if (user.userName == undefined)
        return next(appError(400, '你沒有填寫 userName 欄位', next));
      if (user.email == undefined)
        return next(appError(400, '你沒有填寫 email 欄位', next));
      if (user.password == undefined)
        return next(appError(400, '你沒有填寫 password 欄位', next));
      await User.create(user).then(async () => {
        const allUser = await User.find().sort(`-createAt`);
        handleSuccess(res, allUser);
      });
    });
  },
  // 取得登入者個人資訊
  ownProfile() {
    /**
    *? #swagger.tags = ['users (使用者)']
    * #swagger.description = `
      取得登入者個人資訊
      <ul>
        <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
      </ul>
    `,
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
          gender: 'male',
          premiumMember: {
            paid: 1,
            pay: '6296cbeb434714f163c88163',
            startAt: '2022-06-01T02:16:11.955Z'
        },
        }
      }
    }
  */
    return handleError(async (req, res, next) => {
      handleSuccess(res, req.user);
    });
  },
  // 註冊
  signUp() {
    /**
      ** #swagger.tags = ['users (使用者)']
      * #swagger.description = `
        註冊
        <ul>
          <li>密碼產生 Token 後至其他 users API 使用</li>
          <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
          <li>欄位 <code>"gender"</code> 只能接受 <code>"male"</code>、<code>"female"</code>、<code>""</code>。</li>
        </ul>
      `,
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
    return handleError(async (req, res, next) => {
      const { email, userName, userPhoto, password, gender } = req.body;
      const userData = {
        userName,
        userPhoto,
        email,
        password,
        gender,
      };
      if (userData.userName == undefined)
        return next(appError(400, '你沒有填寫 userName 欄位', next));
      if (userData.email == undefined)
        return next(appError(400, '你沒有填寫 email 欄位', next));
      if (userData.password == undefined)
        return next(appError(400, '你沒有填寫 password 欄位', next));

      const findUserByMail = await User.findOne({ email });
      if (findUserByMail) return appError(400, 'email 已註冊過', next);

      // 加密密碼
      userData.password = await bcrypt.hash(req.body.password, 12);
      const newUser = await User.create(userData);
      generateSendJWT(newUser, 201, res);
    });
  },
  // 登入
  login() {
    /** 
      ** #swagger.tags = ['users (使用者)']
      * #swagger.description = `
        登入
        <ul>
          <li>登入以 mail 為帳號</li>
          <li>忘記密碼就完蛋了 (去資料庫撈是加密的也沒用)，密碼由 Token 解密轉換</li>
          <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
        </ul>
      `,
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
    return handleError(async (req, res, next) => {
      const { email, password } = req.body;
      if (!email || !password) return appError(400, '帳號及密碼必填', next);

      const user = await User.findOne({ email }).select('+password');
      if (!user) return next(appError(400, '未註冊使用者帳號無法登入', next));

      /** auth
       * 需是已註冊 user 的 email 才能進行
       * 解密 password
       */
      const auth = await bcrypt.compare(password, user.password);
      if (!auth) return next(appError(400, '您的密碼不正確', next));
      generateSendJWT(user, 200, res);
    });
  },
  // 修改會員資料
  patchProfile() {
    /** 
      ** #swagger.tags = ['users (使用者)']
      * #swagger.description = `
        修改會員資料
        <ul>
          <li>帶入 user Token，格式 <code>Bearer ＜Token＞</code></li>
          <li>忘記密碼就完蛋了 (去資料庫撈是加密的也沒用)，密碼由 Token 解密轉換。</li>
          <li>欄位 <code>"gender"</code> 只能接受 <code>"male", "female"</code>。</li>
        </ul>
      `,
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
    return handleError(async (req, res, next) => {
      const { userName, userPhoto, gender } = req.body;
      const data = { userName, userPhoto, gender };
      if (!userName) return appError(400, 'userName 名稱必填', next);
      // req.user.id 登入後由 Token 解出 id
      const updateUser = await User.findByIdAndUpdate(req.user.id, data, {
        new: true, // 回傳更新後的資料, default: false
      });
      handleSuccess(res, updateUser);
    });
  },
  // 修改密碼
  updatePassword() {
    /** 
      ** #swagger.tags = ['users (使用者)']
      * #swagger.description = `
        修改會員資料
        <ul>
          <li>帶入 user Token，格式 <code>Bearer ＜Token＞</code></li>
          <li>忘記密碼就完蛋了 (去資料庫撈是加密的也沒用)，密碼由 Token 解密轉換。</li>
        </ul>
      `,
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
    return handleError(async (req, res, next) => {
      const { newPassword, confirmNewPassword } = req.body;
      if (newPassword !== confirmNewPassword)
        return appError(400, '密碼不一致', next);
      bcryptNewPassword = await bcrypt.hash(newPassword, 12); // 使用者由前台傳入的更新密碼轉碼
      const updateUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          password: bcryptNewPassword,
        },
        {
          new: true, // 回傳更新後的資料, default: false
        }
      );
      generateSendJWT(updateUser, 200, res);
    });
  },
};
