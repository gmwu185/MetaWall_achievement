const bcrypt = require('bcryptjs'); // 密碼加密
const validator = require('validator'); // 格式驗證
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const handleSuccess = require('../handStates/handleSuccess');
const handleError = require('../handStates/handleError');
const { generateSendJWT } = require('../handStates/auth');
const appError = require('../customErr/appError');
const mongoose = require('mongoose');

const User = require('../model/users');

module.exports = {
  // 列出全部會員 (後台)
  listUsers: handleError(async (req, res, next) => {
    const allUser = await User.find();
    handleSuccess(res, allUser);
  }),
  // 列出單筆會員 (後台)
  getUser: handleError(async (req, res, next) => {
    const userID = req.params.id;
    if (!mongoose.isObjectIdOrHexString(userID)) {
      return next(appError(400, '無效id', next));
    }
    const userInfo = await User.findById(userID, 'id userName userPhoto');

    if (userInfo == null) return next(appError(400, '查無資料', next));

    handleSuccess(res, userInfo);
  }),
  // 新增單筆會員 (後台)
  createdUser: handleError(async (req, res, next) => {
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
  }),
  // 使用者註冊
  signUp: handleError(async (req, res, next) => {
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
  }),
  // 使用者登入
  login: handleError(async (req, res, next) => {
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
  }),
  // 更新token
  refreshToken: handleError(async (req, res, next) => {
    const userID = req.user.id;
    if (!userID) return appError(400, 'user id 未帶入', next);
    const user = await User.findById(userID);
    if (user == null) return next(appError(400, '查無資料', next));
    generateSendJWT(user, 200, res);
  }),
  // 取得登入者個人資訊
  ownProfile: handleError(async (req, res, next) => {
    const userID = req.user;
    if (!userID) return appError(400, 'user id 未帶入', next);
    handleSuccess(res, userID);
  }),
  // 修改會員資料
  patchProfile: handleError(async (req, res, next) => {
    const { userName, userPhoto, gender } = req.body;
    const data = { userName, userPhoto, gender };
    if (!userName) return appError(400, 'userName 名稱必填', next);
    // req.user.id 登入後由 Token 解出 id
    const ProfileUser = await User.findByIdAndUpdate(req.user.id, data, {
      new: true, // 回傳更新後的資料, default: false
    });
    handleSuccess(res, ProfileUser);
  }),
  // 修改密碼
  updatePassword: handleError(async (req, res, next) => {
    const { newPassword, confirmNewPassword } = req.body;
    if (newPassword !== confirmNewPassword)
      return appError(400, '密碼不一致', next);
    bcryptNewPassword = await bcrypt.hash(newPassword, 12); // 使用者由前台傳入的更新密碼轉碼
    const updatePasswordUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        password: bcryptNewPassword,
      },
      {
        new: true, // 回傳更新後的資料, default: false
      }
    );
    generateSendJWT(updatePasswordUser, 200, res);
  }),
  // 新增追蹤
  addFollow: handleError(async (req, res, next) => {
    if (req.params.id === req.user.id)
      return next(appError(401, '您無法追蹤自己', next));

    const checkFollowUser = await User.find({
      _id: req.params.id,
    });
    if (checkFollowUser.length === 0) {
      return appError(401, `${req.params.id} 無此 user ID`, next);
    } else {
      const following = await User.updateOne(
        {
          _id: req.user.id,
          'following.userData': { $ne: req.params.id },
        },
        {
          $addToSet: { following: { userData: req.params.id } },
        }
      );
      // 有更新 modifiedCount: 1 / 沒更新 modifiedCount: 0
      if (following.modifiedCount == 0)
        return next(appError(401, `正在追蹤 ${req.params.id} 已加入過`, next));

      const followers = await User.updateOne(
        {
          _id: req.params.id,
          'followers.userData': { $ne: req.user.id },
        },
        {
          $addToSet: { followers: { userData: req.user.id } },
        }
      );
      // 有更新 modifiedCount: 1 / 沒更新 modifiedCount: 0
      if (followers.modifiedCount == 0)
        return next(appError(401, `追蹤對象 ${req.params.id} 已加入過`, next));

      handleSuccess(res, { message: `您已成功將 ${req.params.id} 加入追蹤！` });
    }
  }),
  // 取消追蹤
  unFollow: handleError(async (req, res, next) => {
    if (req.params.id === req.user.id)
      return next(appError(401, '您無法取消追蹤自己', next));

    const checkFollowUser = await User.find({
      _id: req.params.id,
    });
    if (checkFollowUser.length === 0) {
      return appError(401, `${req.params.id} 無此 user ID`, next);
    } else {
      const following = await User.updateOne(
        {
          _id: req.user.id,
        },
        {
          $pull: { following: { userData: req.params.id } },
        }
      );
      // 有更新 modifiedCount: 1, / 沒更新 modifiedCount: 0,
      if (following.modifiedCount == 0)
        return next(
          appError(401, `追蹤對象 ${req.params.id} 不在列表中`, next)
        );

      const followers = await User.updateOne(
        {
          _id: req.params.id,
        },
        {
          $pull: { followers: { userData: req.user.id } },
        }
      );
      // 有更新 modifiedCount: 1, / 沒更新 modifiedCount: 0,
      if (followers.modifiedCount == 0)
        return next(
          appError(401, `追蹤對象 ${req.params.id} 不在列表中`, next)
        );

      handleSuccess(res, { message: `您已成功將 ${req.params.id} 取消追蹤！` });
    }
  }),
  // 取得使用者追蹤名單
  getFollows: handleError(async (req, res, next) => {
    const followUsers = await User.find({ _id: req.user.id })
      .populate({
        path: 'followers.userData',
        select: 'userPhoto userName createAt',
      })
      .populate({
        path: 'following.userData',
        select: 'userPhoto userName createAt',
      });
    handleSuccess(res, {
      followers: followUsers[0].followers,
      following: followUsers[0].following,
    });
  }),
};
