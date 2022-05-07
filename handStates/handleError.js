const handleError = (res, err) => {
  let message = '';
  if (err) {
    console.log('handleError if err', err);
    message = err.message;
  } else {
    message = "欄位未填寫正確或無此 id";
  }
  res.status(400).json({
    status: "false",
    message
  }).end();
}
module.exports = handleError;
