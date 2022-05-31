const mongoose = require('mongoose');

const PostRequiredFormat = {
  userData: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: [true, 'ID 需填寫'],
  },
  discussContent: {
    type: String,
    required: [true, '內容必填'],
  },
  discussPhoto: {
    type: String,
    default: '',
  },
  tag: {
    type: String,
    default: '',
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "user", // id 要去找 user 的那張表的 ID
    },
  ],
  createAt: {
    type: Date,
    default: Date.now,
    select: true,  // 設定回傳時間呈現
    /** mongoos 自定時間搓
     * 寫入 db 時間轉成 UTC 時間（+0）
     * 從 db 拿回來的 UTC（+0）時間要轉回當地時間
     * 參考資料[JS] Date Time Method 日期時間 (https://pjchender.dev/javascript/js-date-time/)
     */
  },
};
const schemaOptions = {
  // runSettersOnQuery: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

const postsSchema = new mongoose.Schema(PostRequiredFormat, schemaOptions);
postsSchema.virtual('comments', {
  ref: 'Comment', // 指向 Comment Model
  foreignField: 'post', // 指向 DB posts collection 
  localField: '_id',
});
const posts = mongoose.model('Post', postsSchema);

module.exports = posts;
