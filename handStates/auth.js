const jwt = require('jsonwebtoken');

const handleSuccess = require('../handStates/handleSuccess');
const handleError = require('../handStates/handleError');
const appError = require('../customErr/appError');

const User = require('../model/users');

// 產生 JWT token
const generateSendJWT = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    user: {
      token,
      userName: user.userName,
    },
  });
};

module.exports = { generateSendJWT };
