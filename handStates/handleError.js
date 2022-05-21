const handleErrorAsync = (func) => {
  // func 先將 async fun 帶入參數儲存
  /** middleware
   * 先接住 router 資料
   * 再執行函式，async 可再用 catch 統一捕捉
   */
  return function (req, res, next) {
    func(req, res, next).catch(function (error) {
      return next(error);
    });
  };
};

module.exports = handleErrorAsync;
