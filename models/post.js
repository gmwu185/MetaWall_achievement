const mongoose = require('mongoose');

const PostRequiredFormat = {
  userName: {
    type: String,
    required: [true, '名稱必填'],
  },
  userPhoto: String,
  discussContent: {
    type: String,
    required: [true, '內容必填'],
  },
  discussPhoto: String,
  createAt: {
    type: Date,
    default: Date.now(),
  },
};
const schemaOptions = {
  toObject: {
    getters: true,
    virtuals: true,
    versionKey: false,
  },
  toJSON: {
    getters: true,
    virtuals: true,
    versionKey: false,
  },
  runSettersOnQuery: true,
  versionKey: false,
};
const PostSchema = new mongoose.Schema(PostRequiredFormat, schemaOptions);
const PostModel = mongoose.model('Post', PostSchema); // mongoose 'Post' => mongoDB posts

module.exports = PostModel;
