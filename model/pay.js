const mongoose = require('mongoose');

const paySchema = new mongoose.Schema({
  tradeNo: {
    type: String,
    required: [true, '交易id未填寫'],
  },
  tradeType: {
    type: String,
    required: [true, '請選擇交易方式'],
    lowercase: true,
    default: 'creditonetime',
  },
  totalAmount: {
    type: Number,
    required: [true, '交易金額未填寫'],
    default: 1000,
  },
  tradeDesc: {
    type: String,
    required: [true, '交易說明未填寫'],
    default: '會員費用',
  },
  itemName: {
    type: String,
    required: [true, '交易商品未填寫'],
    default: '會員費用',
  },
  tradeStatus: {
    type: Number,
    enum: [0, 1, 2],
    // 0=success, 1=fail, 2=other
    default: 2,
  },
  ecPayTradeNo: {
    //綠界的交易編號
    type: String,
  },
  ecPayTradeDate: {
    //訂單成立時間
    type: String,
  },
  ecPayRtnMsg: {
    //交易訊息
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: [true, 'user must belong to a user'],
  },
});

paySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'userName id',
  });

  next();
});
const Pay = mongoose.model('Pay', paySchema);

module.exports = Pay;
