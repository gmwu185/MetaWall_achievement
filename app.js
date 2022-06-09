const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const swaggerUI = require('swagger-ui-express');
const swaggerFilePath = `./swagger-output_${process.env.NODE_ENV}.json`;
const swaggerFile = require(swaggerFilePath);
const passport = require('passport');

const appError = require('./customErr/appError');
const { resErrorProd, resErrorDev } = require('./customErr/resErrors');

const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
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
app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerFile));
require('./config/passport')(passport);

// express 錯誤處理
app.use((req, res, next) => appError(404, '無此路由資訊'));
// 錯誤處理
app.use((err, req, res, next) => {
  // dev
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'dev') return resErrorDev(err, res);
  // production
  if (err.name === 'ValidationError') {
    err.message = '資料欄位未填寫正確，請重新輸入！';
    err.isOperational = true;
    return resErrorProd(err, res);
  }
  resErrorProd(err, res);
});

// 未捕捉到的 catch
process.on('unhandledRejection', (err, promise) =>
  console.error('未捕捉到的 rejection：', promise, '原因：', err)
);

module.exports = app;
