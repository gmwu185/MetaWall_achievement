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
  /** #swagger.tags = ['users (使用者)']
   ** #swagger.description = '新增使用者'
   */
  // 全列使用者 (後台)
  async listUsers(req, res, next) {
    const allUser = await User.find();
    handleSuccess(res, allUser);
  },
  // 新增使用者 (後台)
  async createdUser(req, res, next) {
    /**
      ** #swagger.parameters['body'] = {
        in: "body",
        type: "object",
        required: true,
        description: "資料格式查看必填欄位，點按下方 Model 切換後，屬性欄位名稱的後方紅色的*",
        schema: {
          "$userName": "邊綠小杰",
          "$email": "aa@mail.com",
          "$password": "123456",
          "userPhoto": "https://unsplash.it/500/500/?random=4"
          }
      }
    */
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
  },
  // 註冊
  async signUp(req, res, next) {
    const data = req.body;
    const { email, userName, password } = data;
    const userData = {
      userName,
      email,
      password,
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
  },
  // 登入
  async login(req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) return appError(400, '帳號及密碼必填', next);
    const user = await User.findOne({ email }).select('+password');

    /** auth
     * 需是已註冊 user 的 email 才能進行
     * 解密 password
     */
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) return next(appError(400, '帳號錯誤或尚未註冊', next));
    generateSendJWT(user, 200, res);
  },
  // 修改會員資料
  async patchProfile(req, res, next) {
    const { userName, userPhoto, gender } = req.body;
    const data = { userName, userPhoto, gender };
    if (!userName) return appError(400, 'userName 名稱必填', next);
    // req.user.id 登入後由 Token 解出 id
    const updateUser = await User.findByIdAndUpdate(req.user.id, data, {
      new: true, // 回傳更新後的資料, default: false
    });
    handleSuccess(res, updateUser);
  },
  // 修改密碼
  async updatePassword(req, res, next) {
    const { newPassword, confirmNewPassword } = req.body;
    if (newPassword !== confirmNewPassword)
      return appError(400, '密碼不一致', next);
    bcryptNewPassword = await bcrypt.hash(newPassword, 12);
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
  },
};
