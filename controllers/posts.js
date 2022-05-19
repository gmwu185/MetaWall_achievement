const handleSuccess = require('../handStates/handleSuccess');
const handleError = require('../handStates/handleError');
const Posts = require('../model/posts');

module.exports = {
  async getPosts(req, res) {
    /** #swagger.tags = ['posts (貼文)']
      *? #swagger.description = `
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
    const timeSort = req.query.timeSort === 'asc' ? 'createAt' : '-createAt';
    const q =
      req.query.q !== undefined ? { discussContent: new RegExp(req.query.q) } : {};
    /** 網址參數用法：
      * 參數名 timeSort 是否有 'asc' 值，有值有舊到新；沒值有新到舊
      * 參數名 q 用正則表達式以 JS 轉 mongDB 語法 .find( parName: /<查尋字串>/)，以物件包裝查找留言
    */
    const posts = await Posts.find(q).populate({
        path: "userData",
        select: "email userPhoto userName",
      }).sort(timeSort);
    handleSuccess(res, posts);
  },
  async createdPost(req, res) {
    /** #swagger.tags = ['posts (貼文)']
     ** #swagger.description = '新增單筆貼文'
     */
    try {
      const { body } = req;
      // console.log('body.user.id', body.user.id);
      if (body.userData) {
        console.log('body.userData', body.userData);
        /**
          ** #swagger.parameters['body'] = {
            in: "body",
            type: "object",
            required: true,
            description: `
              <ul>
                <li>資料格式查看必填欄位，點按下方 Model 切換後，屬性欄位名稱的後方紅色的 <code>*</code></li>
                <li>新增貼文需先有 user 資料 (<code>body.userData.id</code> 更換成 user ID)，透過 user 資料取 id (向 posts 的屬性欄位 <code>userData</code> 關連)。</li>
              </ul> `,
            schema: {
              "userData": "body.userData.id",
              "$discussContent": "外面看起來就超冷…\n\r我決定回被窩繼續睡…>.<-",
              "discussPhoto": "https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&h=350&q=80",
              "$tag": "標籤 string"
            }
          }
        */
        const newPost = await Posts.create({
          userData: body.userData,
          discussContent: body.discussContent,
          tag: body.tag
        });
        handleSuccess(res, newPost);
      } else {
        handleError(res);
      }
    } catch (err) {
      console.log(
        'POST err.name => ',
        err.name,
        'POST err.message => ',
        err.message
      );
      handleError(res, err);
    }
  },
  async delALL(req, res) {
    /** #swagger.tags = ['posts (貼文)']
      *! #swagger.description = '刪除所有貼文'
    */
    const delPosts = await Posts.deleteMany();
    handleSuccess(res, delPosts);
  },
  async delOne(req, res) {
    /** #swagger.tags = ['posts (貼文)']
     *! #swagger.description = '刪除單筆貼文'
    */
    try {
      /**
        *! #swagger.parameters['id'] = {
          in: 'path',
          type: 'string',
          required: true,
        }
      */
      const urlID = req.url.split('/').pop();
      const findByIdAndDeletePosts = await Posts.findByIdAndDelete({
        _id: urlID,
      });
      findByIdAndDeletePosts ? handleSuccess(res, urlID) : handleError(res);
    } catch (err) {
      console.log(
        'POST err.name => ',
        err.name,
        'POST err.message => ',
        err.message
      );
      handleError(res, err);
    }
  },
  async upDatePost(req, res) {
    /** #swagger.tags = ['posts (貼文)']
     ** #swagger.description = '更新單筆貼文'
     *! #swagger.parameters['id'] = {
          in: 'path',
          type: 'string',
          required: true,
        }
     */ 
    try {
      const { body } = req;
      const urlID = req.params.id;
      if (urlID) {
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
        const editPost = await Posts.findByIdAndUpdate(
          urlID,
          {
            tag: body.tag,
            discussContent: body.discussContent,
            discussPhoto: body.discussPhoto,
          },
          { returnDocument: 'after' }
        );
        editPost !== null ? handleSuccess(res, editPost) : handleError(res);
      } else {
        handleError(res);
      }
    } catch (err) {
      console.log(
        'POST err.name => ',
        err.name,
        'POST err.message => ',
        err.message
      );
      handleError(res, err);
    }
  },
};
