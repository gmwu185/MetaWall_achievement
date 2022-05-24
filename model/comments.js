const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: [true, 'comment can not be empty!'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    require: [true, 'user must belong to a post.'],
  },
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'post',
    require: [true, 'comment must belong to a post.'],
  },
});
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user', // 指定留言者 ID Document
    select: 'userName userPhoto email _id createdAt', // 取得該留言者 Document 欄位資料
  });

  next();
});
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
