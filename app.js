const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerFilePath = `./swagger-output_${process.env.NODE_ENV}.json`;
const swaggerFile = require(swaggerFilePath);
const passport = require('passport');

const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const indexRouter = require('./routes/index');
const payRouter = require('./routes/pay');
const tpAuthRouter = require('./routes/tpAuth');

const app = express();
require('./connections');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/pay', payRouter);
app.use('/tp-auth', tpAuthRouter);
app.use('/', indexRouter);
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerFile));
require('./config/passport')(passport);

// 404 錯誤
app.use(function (req, res, next) {
  res.status(404).json({
    status: 'error',
    message: '無此路由資訊',
  });
});

// express 錯誤處理
// 自己設定的 err 錯誤
const resErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
    });
  } else {
    // log 紀錄
    console.error('出現重大錯誤', err);
    // 送出罐頭預設訊息
    res.status(500).json({
      status: 'error',
      message: '系統錯誤，請恰系統管理員',
    });
  }
};
// 開發環境錯誤
const resErrorDev = (err, res) => {
  /** 錯誤發生時的順序
   * 套件錯誤印出
   * DB 錯誤印出
   */
  res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

// 錯誤處理
app.use(function (err, req, res, next) {
  // dev
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'dev') {
    return resErrorDev(err, res);
  }
  // production
  if (err.name === 'ValidationError') {
    err.message = '資料欄位未填寫正確，請重新輸入！';
    err.isOperational = true;
    return resErrorProd(err, res);
  }
  resErrorProd(err, res);
});

// 未捕捉到的 catch
process.on('unhandledRejection', (err, promise) => {
  console.error('未捕捉到的 rejection：', promise, '原因：', err);
});

module.exports = app;
