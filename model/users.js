const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, '名字必填'],
    },
    userPhoto: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: [true, 'email 必填'],
      // unique: true, // 獨有
    },
    password: {
      type: String,
      required: [true, 'password 必填'],
      minlength: 8,
      select: false,  // 預設不顯示
    },
    gender: {
      type: String,
      required: false,
      enum: ["male", "female"],
    },
    createAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  { versionKey: false }
);
const User = mongoose.model('user', userSchema);

module.exports = User;
