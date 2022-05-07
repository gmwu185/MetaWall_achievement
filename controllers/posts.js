const handleSuccess = require('../handStates/handleSuccess');
const handleError = require('../handStates/handleError');
const Posts = require('../model/posts');

module.exports = {
  async getPosts(req, res) {
    const timeSort = req.query.timeSort === 'asc' ? 'createAt' : '-createAt';
    const q =
      req.query.q !== undefined ? { discussContent: new RegExp(req.query.q) } : {};
    /** 網址參數用法：
      * 參數名 timeSort 是否有 'asc' 值，有值有舊到新；沒值有新到舊
      * 參數名 q 用正則表達式以 JS 轉 mongDB 語法 .find( parName: /<查尋字串>/)，以物件包裝查找留言
    */
    const allPosts = await Posts.find(q).sort(timeSort);
    handleSuccess(res, allPosts);
  },
  async createdPost(req, res) {
    try {
      const { body } = req;

      if (body.userName) {
        const newPost = await Posts.create({
          userName: body.userName,
          userPhoto: body.userPhoto,
          discussContent: body.discussContent,
          discussPhoto: body.discussPhoto,
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
    const delPosts = await Posts.deleteMany();
    handleSuccess(res, delPosts);
  },
  async delOne(req, res) {
    try {
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
    try {
      const { body } = req;
      const urlID = req.url.split('/').pop();
      if (body.userName) {
        const editPost = await Posts.findByIdAndUpdate(
          urlID,
          {
            userName: body.userName,
            userPhoto: body.userPhoto,
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
