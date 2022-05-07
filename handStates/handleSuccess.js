function handleSuccess (res, data) {
  /** 傳入的 res 參數
    * 是由 /routes/xxx.js 所傳入使用。
    * 經 express 包裝過非 Node.js 原生方法參數
   */
  //
  
  // 寫法一：使用 .json() 方法
  res.json({
    status: true,
    data
  });
  res.end();

  /** 寫法二：使用 .send() 方法
    * 依傳入型別決定回傳格式
    * String 回傳 HTML 結構與內容
    * Array or Object 回傳 JSON 格式
    * 預設回傳 res.end() 回傳結束，若不放心連接中斷在使用 .end() 鍊方法再接於 .send() 後方。
   */
  // res.send({
  //   status: true,
  //   data
  // });
}
module.exports = handleSuccess;
