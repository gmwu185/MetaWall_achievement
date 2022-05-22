function handleSuccess (res, data = "") {
  res.json({
    status: "success",
    data
  });
  res.end();
}
module.exports = handleSuccess;
