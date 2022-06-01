const bcrypt = require('bcryptjs'); // 密碼加密
const validator = require('validator'); // 格式驗證
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const handleSuccess = require('../handStates/handleSuccess');
const handleError = require('../handStates/handleError');
// const { isAuth, generateSendJWT } = require('../handStates/auth');
const appError = require('../customErr/appError');

const Posts = require('../model/posts');
const Comment = require('../model/comments');
// const User = require('../model/users');

module.exports = {
  getPosts: handleError(async (req, res, next) => {
    const { q, timeSort, pageNum, pageSize } = req.query;
    const filterQuery = q ? { discussContent: new RegExp(q) } : {};
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
    const currentPageLimit = isPositiveInteger(pageSize) ? pageSize : 0;
    // console.log('currentPageLimit', currentPageLimit);

    const currentPageSkip =
      isPositiveInteger(pageNum) && currentPageLimit > 0
        ? Number(pageSize) * Number(pageNum)
        : 0;
    // console.log('currentPageSkip', currentPageSkip);

    const posts = await Posts.find(filterQuery)
      .populate({
        path: 'comments',
        select: 'comment commentUser createAt',
      })
      .populate({
        path: 'userData',
        select: 'email userPhoto userName createAt',
      })
      .populate('likes')
      .limit(currentPageLimit) // 筆數長度
      .skip(currentPageSkip) // 筆數位置開始計算
      .sort(filterTimeSort);

    let postsLength = posts.length;
    // console.log('postsLength', postsLength);

    handleSuccess(res, {
      postsLength: postsLength,
      posts,
    });
  }),
  getPost: handleError(async (req, res, next) => {
    if (!req.params.id || req.params.id === '')
      return next(appError(400, '未帶入 post id 或其他錯誤', next));
    const findOnePost = await Posts.findOne({
      _id: req.params.id,
    })
      .populate({
        path: 'comments',
        select: 'comment commentUser createAt',
      })
      .populate({
        path: 'userData',
        select: 'email userPhoto userName createAt',
      })
      .populate('likes')
      .catch((err) => appError(400, '無此 id 或 id 長度不足', next));
    if (findOnePost == null) return appError(400, '查無此 post id 貼文', next);
    handleSuccess(res, findOnePost);
  }),
  createdPost: handleError(async (req, res, next) => {
    const userID = req.user.id;
    const { discussContent, discussPhoto, tag } = req.body;

    if (!discussContent) return next(appError(400, '內容必填', next));
    if (!tag) return next(appError(400, '標籤必填', next));

    const newPost = await Posts.create({
      userData: userID,
      discussContent,
      discussPhoto,
      tag,
      like: [],
    });
    handleSuccess(res, newPost);
  }),
  delALLPost: handleError(async (req, res, next) => {
    if (req.originalUrl === '/posts/')
      return next(appError(404, '無此網站路由', next));
    handleSuccess(res, await Posts.deleteMany());
  }),
  delOnePost: handleError(async (req, res, next) => {
    const postID = req.params.id;
    if (!postID || postID === '')
      return next(appError(400, '未帶入刪除的 post id 或其他錯誤', next));
    const deletePost = await Posts.findByIdAndDelete({
      _id: postID,
    }).catch((err) => appError(400, '無此 id 或 id 長度不足', next));
    if (!deletePost) return next(appError(400, '刪除失敗，查無此id', next));
    handleSuccess(res, `刪除 commen id ${postID} 成功`);
  }),
  upDatePost: handleError(async (req, res, next) => {
    const { discussContent, discussPhoto, tag } = req.body;
    const postID = req.params.id;

    if (!discussContent) return appError(400, '更新失敗，貼文內容必填', next);

    const editPost = await Posts.findByIdAndUpdate(
      postID,
      {
        discussContent,
        discussPhoto,
        tag,
      },
      { returnDocument: 'after' }
    )
      .populate({
        path: 'comments',
        select: 'comment commentUser createAt',
      })
      .populate({
        path: 'userData',
        select: 'email userPhoto userName createAt',
      })
      .populate('likes');
    if (!editPost)
      return appError(400, '更新失敗，查無此 id 或欄位格式錯誤', next);
    handleSuccess(res, editPost);
  }),
  addLike: handleError(async (req, res, next) => {
    const postID = req.params.id;
    const userID = req.user.id;
    // 以不同 user id 寫入 DB 集合中
    const updateLike = await Posts.findOneAndUpdate(
      { _id: postID },
      {
        $addToSet: { likes: userID },
      },
      { new: true } // 回傳最新改過的資料
    )
      .populate('likes')
      .exec((err, likes) => {
        if (err)
          return appError(
            400,
            `新增失敗，查無此 ${postID} id 或欄位格式錯誤`,
            next
          );
        handleSuccess(res, likes);
      });
  }),
  delLike: handleError(async (req, res, next) => {
    const postID = req.params.id;
    const userID = req.user.id;
    const delLike = await Posts.findOneAndUpdate(
      { _id: postID },
      { $pull: { likes: userID } },
      { new: true } // 回傳最新改過
    )
      .populate('likes')
      .exec((err, likes) => {
        if (err) return appError(400, `刪除失敗，請查無此 ${postID} ID`, next);
        handleSuccess(res, likes);
      });
  }),
  toggleLike: handleError(async (req, res, next) => {
    console.log('toggleLike');
    const postID = req.params.id;
    const userID = req.user.id;
    // console.log('userID', userID, 'postID', postID);
    const findPost = await Posts.findById({
      _id: postID,
    }).catch((err) => appError(400, `無此貼文 ${postID} ID`, next));
    // console.log('findPost', findPost);
    // 判斷貼文按讚欄位與值判斷
    if (findPost.like) return appError(400, `此貼文沒有 likes 欄位`, next);
    // 貼文按讚的 user id 判斷
    if (findPost.likes.includes(userID)) {
      const pullLike = await Posts.findOneAndUpdate(
        { _id: postID },
        {
          $pull: { likes: userID },
        },
        { new: true } // 回傳最新改過
      )
        .populate('likes')
        .exec((err, likes) => {
          if (err)
            return appError(400, `刪除失敗，請查明貼文 ${postID} ID`, next);
          handleSuccess(res, likes);
        });
    } else {
      const newLike = await Posts.findOneAndUpdate(
        { _id: postID },
        {
          $push: { likes: userID },
        },
        { new: true } // 回傳最新改過
      )
        .populate('likes')
        .exec((err, likes) => {
          if (err)
            return appError(400, `新增失敗，請查明貼文 ${postID} ID`, next);
          handleSuccess(res, likes);
        });
    }
  }),
  createComment: handleError(async (req, res, next) => {
    const userID = req.user.id;
    const postID = req.params.id;
    const { comment } = req.body;
    // console.log('postID', postID);
    if (!comment) return next(appError(404, 'comment 欄位未帶上', next));
    const newComment = await Comment.create({
      post: postID,
      commentUser: userID,
      comment,
    }).catch((err) =>
      next(appError(404, '貼文或留言 user 資料格式有誤', next))
    );
    handleSuccess(res, { comments: newComment });
  }),
  delOneComment: handleError(async (req, res, next) => {
    const commentID = req.params.id;
    console.log('commentID', commentID);
    if (!commentID || commentID === '')
      return next(appError(400, '未帶入刪除的 commen id 或其他錯誤', next));
    const deleteComment = await Comment.findByIdAndDelete({
      _id: commentID,
    }).catch((err) => appError(400, '無此 id 或 id 長度不足', next));
    if (!deleteComment) return next(appError(400, '刪除失敗，查無此id', next));
    handleSuccess(res, `刪除 commen id ${commentID} 成功`);
  }),
  getComment: handleError(async (req, res, next) => {
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
  }),
};
