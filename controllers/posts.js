const bcrypt = require('bcryptjs'); // 密碼加密
const validator = require('validator'); // 格式驗證
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const handleSuccess = require('../handStates/handleSuccess');
const handleError = require('../handStates/handleError');
const { isAuth, generateSendJWT } = require('../handStates/auth');
const appError = require('../customErr/appError');

const Posts = require('../model/posts');
const Comment = require('../model/comments');
const User = require('../model/users');

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
            <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
            <li><code>postsLength</code> 在相關網址參數運算下，執行後回傳資料長度。</li>
          </ul>
        `,
    */

    return handleError(async (req, res, next) => {
      const { q, timeSort, pageNum, pageSize } = req.query;
      /** * #swagger.parameters['timeSort'] = {
          in: 'query',
          type: 'string',
          required: false,
          description: `
            <code>timeSort</code> 參數：
            <ul>
              <li>預設新到舊</li>
              <li>是否有 <code>asc</code> 值？，有值有舊到新；沒值有新到舊。</li>
            </ul>
          `,
        },
      */
      const filterQuery = q ? { discussContent: new RegExp(q) } : {};
      /** * #swagger.parameters['q'] = {
          in: 'query',
          type: 'string',
          required: false,
          description: `
            <code>q</code> 參數：
            <ul>
              <li>查找物件中的留言 <code>discussContent</code>。</li>
              <li>用正則表達式以 JS 轉 mongDB 語法 <code>.find( parName: /<查尋字串>/)</code>。</li>
            </ul>
          `,
        },
      */
      const filterTimeSort = timeSort === 'asc' ? 'createAt' : '-createAt';

      function isPositiveInteger(str) {
        if (typeof str === 'number') {
          if (Number.isInteger(str) && str > 0) return true;
          return false;
        }

        if (typeof str !== 'string') return false;
        const num = Number(str);

        if (Number.isInteger(num) && num > 0) return true;
        return false;
      }
      /** * #swagger.parameters['pageNum'] = {
          in: 'query',
          type: 'string',
          required: false,
          description: `
            <code>pageNum</code> 參數：取頁面資料筆數長度 (目前分頁數 <code>0</code> 為第一頁)
            <ul>
              <li>判斷網址參數 <code>pageSize</code> 是否有值，若無值會段 <code>0</code> 取出所有資料。</li>
              <li>參數以 <code>1</code> 累計。</li>
            </ul>
          `,
        },
      */
      /** * #swagger.parameters['pageSize'] = {
          in: 'query',
          type: 'string',
          required: false,
          description: `
            <code>pageSize</code> 參數：取頁面資料區間 (分頁中每頁的資料筆數)
            <ul>
              <li>由第 <code>0</code> 筆數位置做為 <code>1</code> 開始計算。</li>
              <li>參數以由 <code>1</code> 以累計。</li>
              <li>網址參數 <code>pageSize * pageNum = 頁面數</code> 做為計算結果。</li>
            </ul>
          `,
        },
      */
      const currentPageLimit = isPositiveInteger(pageSize) ? pageSize : 0;
      console.log('currentPageLimit', currentPageLimit);

      const currentPageSkip =
        isPositiveInteger(pageNum) && currentPageLimit > 0
          ? Number(pageSize) * Number(pageNum)
          : 0;
      console.log('currentPageSkip', currentPageSkip);

      const posts = await Posts.find(filterQuery)
        .populate({
          path: 'comments',
          select: 'comment commentUser createAt',
        })
        .populate({
          path: 'userData',
          select: 'email userPhoto userName createAt',
        })
        .limit(currentPageLimit) // 筆數長度
        .skip(currentPageSkip) // 筆數位置開始計算
        .sort(filterTimeSort);

      let postsLength = posts.length;
      console.log('postsLength', postsLength);

      handleSuccess(res, {
        postsLength: postsLength,
        posts,
      });
      /** #swagger.responses[200] = {
        description: `
          取得全部貼文
        `,
        schema: {
          "status": "success",
          "data": {
            "postsLength": 4,
            "posts": [
              {
                "_id": "6291b86e52362496781068cc",
                "userData": {
                  "_id": "628a629b1c4b458a51db745b",
                  "email": "min-@mail.com",
                  "createAt": "2022-05-22T16:19:39.136Z",
                  "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
                  "userName": "大明一"
                },
                "discussContent": "index_09__外面看起來就超冷…\n\r我決定回被窩繼續睡…>.<-大明二",
                "discussPhoto": "",
                "tag": "標籤 string",
                "likes": 0,
                "createAt": "2022-05-28T05:51:42.777Z",
                "comments": [],
                "id": "6291b86e52362496781068cc"
              },
            ]
          }
        }
      }
      */
    });
  },
  getPost() {
    /**
      ** #swagger.tags = ['posts (貼文)']
      * #swagger.description = `
        取得單筆貼文
        <ul>
          <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
          <li>網址路由以 <code>:id</code> 傳入參數，直接針對 Posts 中的 document id 進行取得資料。</li>
        </ul>
      `,
      * #swagger.security = [{
        'apiKeyAuth': []
      }],
      * #swagger.parameters['id'] = {
        in: 'path',
        type: 'string',
        required: true,
      },
      #swagger.responses[200] = {
        description: `取得單筆貼文`,
        schema: {
          "status": "success",
          "data": {
            "_id": "6291b87a52362496781068d5",
            "userData": "628a629b1c4b458a51db745b",
            "discussContent": "index_12__外面看起來就超冷…\n\r我決定回被窩繼續睡…>.<-大明二",
            "discussPhoto": "",
            "tag": "標籤 string",
            "likes": 0,
            "createAt": "2022-05-28T05:51:54.236Z",
            "id": "6291b87a52362496781068d5"
          }
        }
      }
     */
    return handleError(async (req, res, next) => {
      if (!req.params.id || req.params.id === '')
        return next(appError(400, '未帶入刪除的 post id 或其他錯誤', next));
      const findOnePost = await Posts.findOne({
        _id: req.params.id,
      }).catch((err) => appError(400, '無此 id 或 id 長度不足', next));
      handleSuccess(res, findOnePost);
    });
  },
  createdPost() {
    /** 
      ** #swagger.tags = ['posts (貼文)'],
      * #swagger.security = [{
        'apiKeyAuth': []
      }],
      * #swagger.description = `
        新增單筆貼文
        <ul>
          <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
          <li>新增貼文需先有 user.id 登入取得 Tokne</li>
          <li>資料格式查看必填欄位，點按下方 Model 切換後，屬性欄位名稱的後方紅色的 <code>*</code></li>
          <li>透過 user.id 向 posts 的屬性欄位 <code>userData</code> 關連。</li>
        </ul>
        `,
      * #swagger.parameters['body'] = {
        in: "body",
        type: "object",
        required: true,
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
  delALLPost() {
    /** #swagger.tags = ['posts (貼文)']
     *! #swagger.description = '刪除所有貼文',
     * #swagger.security = [{
        'apiKeyAuth': []
      }],
    */

    return handleError(async (req, res, next) => {
      if (req.originalUrl === '/posts/')
        return next(appError(404, '無此網站路由', next));
      handleSuccess(res, await Posts.deleteMany());
    });
  },
  delOnePost() {
    /**
      *! #swagger.tags = ['posts (貼文)']
      * #swagger.description = `
        刪除單筆貼文
        <ul>
          <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
          <li>網址路由以 <code>:id</code> 傳入參數，直接針對 Posts 中的 document id 進行刪除。</li>
        </ul>
      `,
      * #swagger.security = [{
        'apiKeyAuth': []
      }],
      * #swagger.parameters['id'] = {
        in: 'path',
        type: 'string',
        required: true,
      }
     */

    return handleError(async (req, res, next) => {
      if (!req.params.id || req.params.id === '')
        return next(appError(400, '未帶入刪除的 post id 或其他錯誤', next));
      const deletePost = await Posts.findByIdAndDelete({
        _id: req.params.id,
      }).catch((err) => appError(400, '無此 id 或 id 長度不足', next));
      if (!deletePost) return next(appError(400, '刪除失敗，查無此id', next));
      handleSuccess(res, `刪除 commen id ${req.params.id} 成功`);
    });
  },
  upDatePost() {
    /** 
      ** #swagger.tags = ['posts (貼文)']
      * #swagger.description = `
        更新單筆貼文
        <ul>
          <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
        </ul>
      `
      * #swagger.parameters['id'] = {
          in: 'path',
          type: 'string',
          required: true,
        }
      * #swagger.security = [{
        'apiKeyAuth': []
      }],
      * #swagger.parameters['body'] = {
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
    return handleError(async (req, res, next) => {
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
    });
  },
  createComment() {
    /** 
      ** #swagger.tags = ['posts (貼文留言)']
      * #swagger.description = `
        新增貼文留言功能
        <ul>
          <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
          <li>Heders Token 指定留言 user (<code>commentUser</code>)。</li>
          <li>網址路由 <code>:id</code> 傳入 post id 在特定貼文中留言。</li>
          <li>成功留言將資料寫入 <code>Comment</code> collection 中建出 document。</li>
        </ul>
      `
      * #swagger.parameters['id'] = {
          in: 'path',
          type: 'string',
          required: true,
          description: `Params path Variables <code>:id</code> (posts ID)`
        }
      * #swagger.security = [{
        'apiKeyAuth': []
      }],
      * #swagger.parameters['body'] = {
        in: "body",
        type: "object",
        required: true,
        description: `Body 資料格式`,
        schema: {
          "$comment": "這是留言在貼文裡的一段話"
        },
      },
      #swagger.responses[200] = {
        description: `新增貼文留言功能`,
        schema: {
          "status": "success",
          "data": {
            "comments": {
              "comment": "這是留言在貼文裡的一段話 - swagger",
              "commentUser": "628a629b1c4b458a51db745b",
              "post": "628c367b714bc9f6a8e17857",
              "_id": "628c6607e6b23dcb0832041d",
              "createAt": "2022-05-24T04:58:47.058Z",
              "__v": 0
            }
          }
        }
      }
    */
    return handleError(async (req, res, next) => {
      const user = req.user.id;
      const post = req.params.id;
      const { comment } = req.body;
      // console.log('post', post);
      if (!comment) return next(appError(404, 'comment 欄位未帶上', next));
      const newComment = await Comment.create({
        post,
        commentUser: user,
        comment,
      }).catch((err) =>
        next(appError(404, '貼文或留言 user 資料格式有誤', next))
      );
      handleSuccess(res, { comments: newComment });
    });
  },
  delOneComment() {
    /**
      *! #swagger.tags = ['posts (貼文留言)']
      * #swagger.description = `
        刪除單筆貼文留言
        <ul>
          <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
        </ul>
      `,
      * #swagger.security = [{
        'apiKeyAuth': []
      }],
      * #swagger.parameters['id'] = {
        in: 'path',
        type: 'string',
        required: true,
        description: `
          <ul>
            <li>取得特定使用者的所有貼文，關連留言訊息資料格式。</li>
            <li>Params Path Variables <code>:id</code> (comment ID)</li>
          </ul>
        `,
      }
     */
    return handleError(async (req, res, next) => {
      if (!req.params.id || req.params.id === '')
        return next(appError(400, '未帶入刪除的 commen id 或其他錯誤', next));
      const deleteComment = await Comment.findByIdAndDelete({
        _id: req.params.id,
      }).catch((err) => appError(400, '無此 id 或 id 長度不足', next));
      if (!deleteComment)
        return next(appError(400, '刪除失敗，查無此id', next));
      handleSuccess(res, `刪除 commen id ${req.params.id} 成功`);
    });
  },
  getComment() {
    /** 
      ** #swagger.tags = ['posts (貼文留言)']
      * #swagger.description = `
        取得特定使用者的所有貼文，關連留言訊息。
        <ul>
          <li>不帶 Token 在可對外查看。</li>
        </ul>
      `
      * #swagger.parameters['id'] = {
          in: 'path',
          type: 'string',
          description: `
            <ul>
              <li>取得特定使用者的所有貼文，關連留言訊息資料格式。</li>
              <li>Params Path Variables <code>:id</code> (user ID)</li>
            </ul>
          `,
        },
      #swagger.responses[200] = {
        description: `取得貼文留言格式`,
        schema: {
          "status": "success",
          "results": 1,
          "posts": [
            {
              "_id": "post ID",
              "discussContent": "外面看起來就超冷…\n\r我決定回被窩繼續睡…>.<-大明",
              "discussPhoto": "",
              "tag": "標籤 string",
              "likes": 0,
              "userData": {
                "_id": "userData ID",
                "userName": "大明",
                "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
                "email": "min-@mail.com",
                "createAt": "2022-05-23T07:10:18.697Z"
              },
              "comments": [
                {
                  "_id": "628c5951d08d3db9169f958b",
                  "comment": "這是留言在貼文裡的一段話 for swagger",
                  "commentUser": {
                    "_id": "628a629b1c4b458a51db745b",
                    "email": "min-@mail.com",
                    "createAt": "2022-05-22T16:19:39.136Z",
                    "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
                    "userName": "大明"
                  },
                  "post": "post ID",
                  "createAt": "2022-05-24T04:04:33.889Z"
                },
                {
                  "_id": "628c59c3d08d3db9169f9593",
                  "comment": "這是留言在貼文裡的一段話 for swagger min-@mail.com",
                  "commentUser": {
                    "_id": "628b335a5509d304d26e9c70",
                    "userName": "大明",
                    "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
                    "email": "min-@mail.com",
                    "createAt": "2022-05-23T07:10:18.697Z"
                  },
                  "post": "post ID",
                  "createAt": "2022-05-24T04:06:27.159Z"
                }
              ],
              "id": "post ID"
            }
          ]
        }
      }
    */
    return handleError(async (req, res, next) => {
      const userID = req.params.id;

      const posts = await Posts.find({ userData: userID })
        .populate({
          path: 'comments',
          select: 'comment commentUser createAt',
        })
        .populate({
          path: 'userData',
          select: 'email userPhoto userName createAt',
        });

      res.status(200).json({
        status: 'success',
        results: posts.length,
        posts,
      });
    });
  },
};
