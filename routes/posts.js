var express = require('express');
var router = express.Router();

const appError = require('../customErr/appError');
const handleError = require('../handStates/handleError');

const { isAuth, generateSendJWT } = require('../handStates/auth');

const PostsControllers = require('../controllers/posts');

router.get(
  '/',
  isAuth,
  /** #swagger.description = `取得所有貼文。
      <p>參數用法：</p>
      <ul>
        <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
        <li><code>postsLength</code> 在相關網址參數運算下，執行後回傳資料長度。</li>
      </ul>
    `,
    *? #swagger.tags = ['posts (貼文)'],
    * #swagger.security = [{
      'apiKeyAuth': []
    }],
    * #swagger.parameters['timeSort'] = {
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
    * #swagger.parameters['q'] = {
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
    * #swagger.parameters['pageNum'] = {
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
    * #swagger.parameters['pageSize'] = {
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
    * #swagger.responses[200] = {
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
              "likes": [],
              "createAt": "2022-05-28T05:51:42.777Z",
              "comments": [],
              "id": "6291b86e52362496781068cc"
            },
          ]
        }
      }
    }
  */
  (req, res, next) => PostsControllers.getPosts(req, res, next)
);
router.get(
  '/:id',
  isAuth,
  /** #swagger.description = `取得單筆貼文
      <ul>
        <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
        <li>網址路由以 <code>:id</code> 傳入參數，直接針對 Posts 中的 document id 進行取得資料。</li>
      </ul>
    `,
    * #swagger.tags = ['posts (貼文)']
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
          "likes": [],
          "createAt": "2022-05-28T05:51:54.236Z",
          "id": "6291b87a52362496781068d5"
        }
      }
    }
   */
  (req, res, next) => PostsControllers.getPost(req, res, next)
);
router.post(
  '/',
  isAuth,
  /** * #swagger.description = `新增單筆貼文
    <ul>
      <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
      <li>新增貼文需先有 user.id 登入取得 Tokne</li>
      <li>資料格式查看必填欄位，點按下方 Model 切換後，屬性欄位名稱的後方紅色的 <code>*</code></li>
      <li>透過 user.id 向 posts 的屬性欄位 <code>userData</code> 關連。</li>
    </ul>
    `,
    ** #swagger.tags = ['posts (貼文)'],
    * #swagger.security = [{
      'apiKeyAuth': []
    }],
    
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
  (req, res, next) => PostsControllers.createdPost(req, res, next)
);
router.patch(
  '/:id',
  isAuth,
  /** #swagger.description = `更新單筆貼文
    <ul>
      <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
    </ul>
    `,
    ** #swagger.tags = ['posts (貼文)'],
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
  (req, res, next) => PostsControllers.upDatePost(req, res, next)
);
router.delete(
  '/',
  isAuth,
  /** #swagger.description = '刪除所有貼文',
   * #swagger.tags = ['posts (貼文)'],
   * #swagger.security = [{
      'apiKeyAuth': []
    }],
  */
  (req, res, next) => PostsControllers.delALLPost(req, res, next)
);
router.delete(
  '/:id',
  isAuth,
  /** #swagger.description = `刪除單筆貼文
    <ul>
      <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
      <li>網址路由以 <code>:id</code> 傳入參數，直接針對 Posts 中的 document id 進行刪除。</li>
    </ul>
  `,
    * #swagger.tags = ['posts (貼文)'],
    * #swagger.security = [{
      'apiKeyAuth': []
    }],
    * #swagger.parameters['id'] = {
      in: 'path',
      type: 'string',
      required: true,
    }
   */
  (req, res, next) => PostsControllers.delOnePost(req, res, next)
);
router.post(
  '/:id/likes',
  isAuth,
  /** #swagger.description = `新增單筆貼文按讚
    <ul>
      <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
      <li>網址路由以 <code>:id</code> 傳入參數，直接針對 Posts 中的 postID 進行新增按讚。</li>
    </ul>
  `,
  *? #swagger.tags = ['posts (貼文按讚)'],
  * #swagger.security = [{
    'apiKeyAuth': []
  }],
  * #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    required: true,
  }
 */
  (req, res, next) => PostsControllers.addLike(req, res, next)
);
router.delete(
  '/:id/likes',
  isAuth,
  /** #swagger.description =`刪除單筆貼文按讚
    <ul>
      <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
      <li>網址路由以 <code>:id</code> 傳入參數，直接針對 Posts 中的 userID 進行刪除按讚。</li>
    </ul>
    `,
    *! #swagger.tags = ['posts (貼文按讚)']
    * #swagger.security = [{
      'apiKeyAuth': []
    }],
    * #swagger.parameters['id'] = {
      in: 'path',
      type: 'string',
      required: true,
    }
   */
  (req, res, next) => PostsControllers.delLike(req, res, next)
);
router.patch(
  '/:id/likes',
  isAuth,
  /** #swagger.description = `新增與移除單筆貼文按讚
    <ul>
      <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
      <li>網址路由以 <code>:id</code> 傳入參數，直接針對 Posts 中的 postID 進行新增或移除按讚。</li>
    </ul>
  `,
  * #swagger.tags = ['posts (貼文按讚)'],
  * #swagger.security = [{
    'apiKeyAuth': []
  }],
  * #swagger.parameters['id'] = {
    in: 'path',
    type: 'string',
    required: true,
  },
  * #swagger.responses[200] = {
    description: `
      新增與移除單筆貼文按讚資料格式
    `,
    schema: {
      "status": "success",
      "data": {
        "_id": "62930bf5f09683041ecd0b3a",
        "userData": "6290f87ed5f22368e79e666e",
        "discussContent": "測試github方面",
        "discussPhoto": "",
        "tag": "標籤 string",
        "likes": [
          {
            "_id": "628a53f86e242867112a2321",
            "userName": "大明123",
            "userPhoto": "https://avatars.githubusercontent.com/u/42748910?v=4",
            "email": "min-@mail.com",
            "gender": "male"
          }
        ],
        "createAt": "2022-05-29T06:00:21.753Z",
        "id": "62930bf5f09683041ecd0b3a"
      }
    }
  }
 */
  (req, res, next) => PostsControllers.toggleLike(req, res, next)
);
router.post(
  '/:id/comment',
  isAuth,
  /** #swagger.description = `新增貼文留言功能
    <ul>
      <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
      <li>Heders Token 指定留言 user (<code>commentUser</code>)。</li>
      <li>網址路由 <code>:id</code> 傳入 post id 在特定貼文中留言。</li>
      <li>成功留言將資料寫入 <code>Comment</code> collection 中建出 document。</li>
    </ul>
    `,
    * #swagger.tags = ['posts (貼文留言)']
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
  (req, res, next) => PostsControllers.createComment(req, res, next)
);
router.delete(
  '/comment/:id',
  isAuth,
  /** #swagger.description = `刪除單筆貼文留言
      <ul>
        <li>取得 Token 至上方 Authorize 按鈕以格式 <code>Bearer ＜Token＞</code> 加入設定，swagger 文件中鎖頭上鎖表示登入，可使用登入權限。</li>
      </ul>
    `,
    * #swagger.tags = ['posts (貼文留言)'],
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
  (req, res, next) => PostsControllers.delOneComment(req, res, next)
);
router.get(
  '/user/:id',
  /** #swagger.description = `取得特定使用者的所有貼文，關連留言訊息。
      <ul>
        <li>不帶 Token 在可對外查看。</li>
      </ul>
    `,
    * #swagger.tags = ['posts (貼文留言)']
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
            "likes": [],
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
  (req, res, next) => PostsControllers.getComment(req, res, next)
);

module.exports = router;
