const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const Pay = require('../model/pay');
const User = require('../model/users');
const mongoose = require('mongoose');
const handleError = require('../handStates/handleError');
const { Merchant, CreditOneTimePayment } = require('node-ecpay-aio');
const dayjs = require('dayjs');
const randomId = require('../service/randomId');
const appError = require('../customErr/appError');

module.exports = {
  createPay() {
    /**
        *? #swagger.tags = ['pay (綠界)'],
        #swagger.summary = '產生訂單並要求付款'
        * #swagger.security = [{
          'apiKeyAuth': []
        }],
        * #swagger.description = `
            <p>在資料庫先新增pay的紀錄，再向綠界產生訂單，並取得form data導向付款頁面</p>
            參數用法：
            <ul>
              <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
            </ul>
            流程用法：
            <ul>
              <li>取得form data後，用html觸發form submit</li>
              <li>測試卡號:4311-5922-2222-2222；安全碼:222；有效年月:大於當下的年月(e.g.07/28)</li>
            </ul>
          `,
      */
    return handleError(async (req, res, next) => {
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
        OrderResultURL: process.env.ORDER_RESULT_URL,
        ClientBackURL: process.env.ORDER_RESULT_URL,
      });
      const baseParams = {
        MerchantTradeNo: newPay.tradeNo,
        MerchantTradeDate: dayjs(newPay.createdAt).format(
          'YYYY/MM/DD HH:mm:ss'
        ),
        TotalAmount: newPay.totalAmount,
        TradeDesc: newPay.tradeDesc,
        ItemName: newPay.itemName,
        OrderResultURL: process.env.ORDER_RESULT_URL,
        ClientBackURL: process.env.ORDER_RESULT_URL,
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
      res.status(200).send(htmlRedirectPostForm);
      res.end();
      /*
      * #swagger.responses[200] = {
        description: `
          取得form data
        `,
          schema:"1"
      }
      */
    });
  },
  tradeConfirm() {
    /**
        *? #swagger.tags = ['pay (綠界)'],
        * #swagger.summary = '提供綠界回傳的url'
        * #swagger.description = `
            <p>提供綠界回傳的url</p>
            <p>取得交易結果，且更新document Users 和 Pays</p>
          `,
      */
    return handleError(async (req, res, next) => {
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
    });
  },
  getTradeResult() {
    /**
        *? #swagger.tags = ['pay (綠界)'],
        * #swagger.summary = '取得付款結果'
        * #swagger.description = `
            <p>取得付款結果</p>
          `,
        * #swagger.security = [{
            'apiKeyAuth': []
          }],
        * #swagger.parameters['id'] = {
            in: 'path',
            description:'pay id',
            type: 'string',
            required: true,
          },
        #swagger.responses[200] = {
          description: `取得單筆付款結果`,
          schema: {
              "status": "success",
              "data": {
                  "_id": "629719ace801357b6d843506",
                  "tradeNo": "MWW6zvo77p3m0",
                  "tradeType": "creditonetime",
                  "totalAmount": 1000,
                  "tradeDesc": "會員費用",
                  "itemName": "會員費用",
                  "tradeStatus": 0,
                  "user": {
                      "_id": "628a53f86e242867112a2321",
                      "userName": "大明123"
                  },
                  "ecPayRtnMsg": "交易成功"
              }
          }
      }
      */
    return handleError(async (req, res, next) => {
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
    });
  },
};
