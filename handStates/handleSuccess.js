function handleSuccess (res, data = "") {
  res.json({
    status: true,
    data
  });
  res.end();
}
module.exports = handleSuccess;
