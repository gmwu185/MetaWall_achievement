const bcrypt = require('bcryptjs'); // 密碼加密
const validator = require('validator'); // 格式驗證
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const handleSuccess = require('../handStates/handleSuccess');
const handleError = require('../handStates/handleError');
const { isAuth, generateSendJWT } = require('../handStates/auth');
const appError = require('../customErr/appError');

const Posts = require('../model/posts');

module.exports = {
  getPosts() {
    /** 
      *? #swagger.tags = ['posts (貼文)'],
      * #swagger.security = [{
        'apiKeyAuth': []
      }],
      * #swagger.description = `
          <p>取得所有貼文。</p>
          參數用法：
          <ul>
            <li><code>timeSort</code> 參數：
              <ol>
                <li>預設新到舊</li>
                <li>是否有 <code>'asc'</code> 值？，有值有舊到新；沒值有新到舊。</li>
              </ol>
            </li>
            <li><code>q</code> 參數：
              <ol>
                <li>查找物件中的留言 <code>discussContent</code>。</li>
                <li>用正則表達式以 JS 轉 mongDB 語法 <code>.find( parName: /<查尋字串>/)</code>。</li>
              </ol>
            </li>
          </ul>
        `,
      *? #swagger.responses[200] = {
        description: `
          取得全部貼文
          `,
        schema: {
          "status": true,
          "data": [
            {
              "_id": "6284f91e51cc73dad4255eb3",
              "userData": {
                "_id": "6283dc5a60d07bddfa09e3a2",
                "userName": "aa",
                "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
                "email": "aa@mail.com"
              },
              "discussContent": "外面看起來就超冷…\n\n我決定回被窩繼續睡…>.<-33",
              "discussPhoto": "",
              "tag": "標籤",
              "likes": 0,
              "comments": 0,
              "createAt": "2022-05-18T13:48:14.766Z"
            },
          ]
        }
      }
    */

    return handleError(async (req, res, next) => {
      const timeSort = req.query.timeSort === 'asc' ? 'createAt' : '-createAt';
      const q =
        req.query.q !== undefined
          ? { discussContent: new RegExp(req.query.q) }
          : {};
      /** 網址參數用法：
       * 參數名 timeSort 是否有 'asc' 值，有值有舊到新；沒值有新到舊
       * 參數名 q 用正則表達式以 JS 轉 mongDB 語法 .find( parName: /<查尋字串>/)，以物件包裝查找留言
       */
      const posts = await Posts.find(q)
        .populate({
          path: 'userData',
          select: 'email userPhoto userName',
        })
        .sort(timeSort);
      handleSuccess(res, posts);
    });
  },
  createdPost() {
    /** 
      ** #swagger.tags = ['posts (貼文)'],
      * #swagger.security = [{
        'apiKeyAuth': []
      }],
      * #swagger.description = '新增單筆貼文',
      * #swagger.parameters['body'] = {
        in: "body",
        type: "object",
        required: true,
        description: `
          <ul>
            <li>資料格式查看必填欄位，點按下方 Model 切換後，屬性欄位名稱的後方紅色的 <code>*</code></li>
            <li>新增貼文需先有 user.id 登入取得 Tokne</li>
            <li>透過 user.id 向 posts 的屬性欄位 <code>userData</code> 關連。</li>
          </ul> `,
        schema: {
          "$discussContent": "外面看起來就超冷…\n\r我決定回被窩繼續睡…>.<-",
          "discussPhoto": "https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&h=350&q=80",
          "$tag": "標籤 string"
        }
      }
     */
    
      return handleError(async (req, res, next) => {
      const user = req.user.id;
      const { discussContent, discussPhoto, tag } = req.body;

      if (!discussContent) return next(appError(400, '內容必填', next));
      if (!tag) return next(appError(400, '標籤必填', next));

      const newPost = await Posts.create({
        userData: user,
        discussContent,
        discussPhoto,
        tag,
      });
      handleSuccess(res, newPost);
    });
  },
  delALL() {
    /** #swagger.tags = ['posts (貼文)']
     *! #swagger.description = '刪除所有貼文'
    */
    
    return async (req, res, next) => {
      if (req.originalUrl === '/posts/')
        return next(appError(404, '無此網站路由', next));
      handleSuccess(res, await Posts.deleteMany());
    };
  },
  delOne() {
    /** #swagger.tags = ['posts (貼文)']
     *! #swagger.description = '刪除單筆貼文'
     */
    /**
      *! #swagger.parameters['id'] = {
        in: 'path',
        type: 'string',
        required: true,
      }
    */
    
    return async (req, res, next) => {
      if (!req.params.id || req.params.id === '')
        return next(appError(400, '未帶入刪除的資料 id 或其他錯誤', next));
      const deletePost = await Posts.findByIdAndDelete({
        _id: req.params.id,
      }).catch((err) => appError(400, '無此 id 或 id 長度不足', next));
      if (!deletePost) return next(appError(400, '刪除失敗，查無此id', next));
      handleSuccess(res, req.params.id);
    };
  },
  upDatePost() {
    /** #swagger.tags = ['posts (貼文)']
     ** #swagger.description = '更新單筆貼文'
     *! #swagger.parameters['id'] = {
          in: 'path',
          type: 'string',
          required: true,
        }
    */
    /**
      ** #swagger.parameters['body'] = {
        in: "body",
        type: "object",
        required: true,
        description: "Body 資料格式",
        schema: {
          "tag": "string-PATCH",
          "$discussContent": "string-PATCH",
          "discussPhoto": "https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&h=350&q=80"
        },
      }
    */
    return async (req, res, next) => {
      const { discussContent, discussPhoto, tag } = req.body;
      const paramsID = req.params.id;

      if (!discussContent) return appError(400, '更新失敗，貼文內容必填', next);

      const editPost = await Posts.findByIdAndUpdate(
        paramsID,
        {
          discussContent,
          discussPhoto,
          tag,
        },
        { returnDocument: 'after' }
      );
      if (!editPost)
        return appError(400, '更新失敗，查無此 id 或欄位格式錯誤', next);
      handleSuccess(res, editPost);
    };
  },
};
