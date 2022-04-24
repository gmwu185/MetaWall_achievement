const mongoose = require('mongoose');

const PostRequiredFormat = {
  userName: {
    type: String,
    required: [true, '名稱必填'],
  },
  userPhoto: {
    type: String,
    default: '',
  },
  discussContent: {
    type: String,
    required: [true, '內容必填'],
  },
  discussPhoto: {
    type: String,
    default: '',
  },
  createAt: {
    type: Date,
    default: Date.now(),
    select: true,
    /** mongoos 自定時間搓
     * 寫入 db 時間轉成 UTC 時間（+0）
     * 從 db 拿回來的 UTC（+0）時間要轉回當地時間
     * 參考資料[JS] Date Time Method 日期時間 (https://pjchender.dev/javascript/js-date-time/)
     */
  },
};
const schemaOptions = {
  runSettersOnQuery: true,
  versionKey: false,
};
const PostSchema = new mongoose.Schema(PostRequiredFormat, schemaOptions);
const PostModel = mongoose.model('Post', PostSchema); // mongoose 'Post' => mongoDB posts

module.exports = PostModel;
