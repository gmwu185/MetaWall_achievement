const jwt = require('jsonwebtoken');

const handleSuccess = require('../handStates/handleSuccess');
const handleError = require('../handStates/handleError');
const appError = require('../customErr/appError');

const User = require('../model/users');

const isAuth = handleError(async (req, res, next) => {
  // 確認 token 是否存在
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  )
    token = req.headers.authorization.split(' ')[1]; // 分割字串去除 'Bearer ' 取向資料庫內 Token 比對
  if (!token) return next(appError(401, '你尚未登入！', next));

  // 驗證 token 正確性
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        reject(next(appError(401, '驗證 token 發生問題或不一致', next)));
      } else {
        resolve(payload); // 正確流程將結果 payload 賦予到 decoded
      }
    });
  });
  const currentUser = await User.findById(decoded.id);
  req.user = currentUser; // 查找
  next();
});

// 產生 JWT token
const generateSendJWT = (user, statusCode, res) => {
  const token = jwt.sign(
    {
      id: user._id,
      userName: user.userName,
      userPhoto: user.userPhoto,
      gender: user.gender,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_DAY,
    }
  );
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    data: {
      token: token,
      wholeToken: `Bearer ${token}`,
      userName: user.userName,
      userPhoto: user.userPhoto,
      gender: user.gender,
    },
  });
};

module.exports = { isAuth, generateSendJWT };
