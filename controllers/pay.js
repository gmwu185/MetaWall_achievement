const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const Pay = require('../model/pay');
const User = require('../model/users');
const mongoose = require('mongoose');
const handleError = require('../handStates/handleError');
const { Merchant, CreditOneTimePayment } = require('node-ecpay-aio');
const dayjs = require('dayjs');
const randomId = require('../helps/randomId');
const appError = require('../customErr/appError');

module.exports = {
  createPay: handleError(async (req, res, next) => {
    const user = req.user.id; //form isAuth(token)
    const no = await randomId(10);
    const newPay = await Pay.create({
      tradeNo: `MWW${no}`,
      user: user,
    });
    // const orderUrl = process.env.ORDER_RESULT_URL + newPay.id;
    const merchant = new Merchant('Test', {
      MerchantID: process.env.ECPAY_MERCHANT_ID,
      HashKey: process.env.ECPAY_HASH_KEY,
      HashIV: process.env.ECPAY_HASH_IV,
      ReturnURL: process.env.ECPAY_RETURNN_URL,
      OrderResultURL: process.env.ECPAY_ORDER_RESULT_URL,
      ClientBackURL: process.env.ECPAY_CLIENT_BACK_URL,
    });
    const baseParams = {
      MerchantTradeNo: newPay.tradeNo,
      MerchantTradeDate: dayjs(newPay.createdAt).format('YYYY/MM/DD HH:mm:ss'),
      TotalAmount: newPay.totalAmount,
      TradeDesc: newPay.tradeDesc,
      ItemName: newPay.itemName,
      OrderResultURL: process.env.ECPAY_ORDER_RESULT_URL,
      ClientBackURL: process.env.ECPAY_CLIENT_BACK_URL,
    };
    const params = {
      // 皆為選填
      BindingCard: 1, // 記憶信用卡: 1 (記) | 0 (不記)
      MerchantMemberID: '2000132u001', // 記憶卡片需加註識別碼: MerchantId+廠商會員編號
      Language: 'undefined', // 語系: undefined(繁中) | 'ENG' | 'KOR' | 'JPN' | 'CHI'
      Redeem: 'Y', // 紅利折抵: undefined(不用) | 'Y' (使用)
      UnionPay: 2, // [需申請] 銀聯卡: 0 (可用, default) | 1 (導至銀聯網) | 2 (不可用)
    };
    const payment = await merchant.createPayment(
      CreditOneTimePayment,
      baseParams,
      params
    );
    const htmlRedirectPostForm = await payment.checkout();
    res.status(200).json({ resHTML: htmlRedirectPostForm });
    res.end();
  }),
  tradeConfirm: handleError(async (req, res, next) => {
    const { MerchantTradeNo, RtnMsg, RtnCode, TradeNo, TradeDate } = req.body;
    const updatePay = await Pay.findOneAndUpdate(
      {
        tradeNo: MerchantTradeNo,
      },
      {
        ecPayTradeNo: TradeNo,
        ecPayTradeDate: TradeDate,
        ecPayRtnMsg: RtnMsg,
        tradeStatus: RtnCode === '1' ? 0 : 1,
      },
      {
        new: true,
      }
    );
    await User.findByIdAndUpdate(updatePay.user.id, {
      premiumMember: {
        paid: 1,
        pay: updatePay.id,
        startAt: updatePay.createdAt,
      },
    });
    res.status(200).send('OK');
  }),
  tradeRedirect: handleError(async (req, res, next) => {
    res.redirect(process.env.FRONTEND_MEMBER_URL);
  }),
  getTradeResult: handleError(async (req, res, next) => {
    const user = req.user.id;
    const payId = req.params.id;

    if (!mongoose.isObjectIdOrHexString(payId)) {
      return next(appError(400, '無效id', next));
    }
    const payRecord = await Pay.findById(
      payId,
      'tradeNo tradeType totalAmount tradeDesc itemName tradeStatus ecPayRtnMsg user'
    );

    if (payRecord === null) {
      return next(appError(400, '查無資料', next));
    }

    const payUser = payRecord.user.id;
    if (payUser !== user) {
      return next(appError(400, '無權限查看', next));
    }

    res.status(200).json({
      status: 'success',
      data: payRecord,
    });
  }),
};
