module.exports = {
  // 自己設定的 err 錯誤
  // 正式環境錯誤
  resErrorProd: (err, res) => {
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
  },
  // 開發環境錯誤
  resErrorDev: (err, res) => {
    /** 錯誤發生時的順序
     * 套件錯誤印出
     * DB 錯誤印出
     */
    res.status(err.statusCode).json({
      message: err.message,
      error: err,
      stack: err.stack,
    });
  },
};
