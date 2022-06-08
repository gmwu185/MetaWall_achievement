const User = require('../model/users');
const bcrypt = require('bcryptjs');
const randomId = require('./randomId');

const findOrCreateUser = async (tpType, profile) => {
  // tpType: 'google', 'facebook'
  const { name, email, sub, id } = profile;

  const existEmail = await User.findOne({ email: email });
  if (existEmail) {
    switch (tpType) {
      case 'google':
        if (existEmail.thirdParty.googleID === sub) {
          return existEmail;
        } else {
          const updateUser = await User.findByIdAndUpdate(
            existEmail.id,
            {
              thirdParty: {
                googleID: sub,
              },
            },
            { new: true }
          );
          return updateUser;
        }
      case 'facebook':
        if (existEmail.thirdParty.facebookID === id) {
          return existEmail;
        } else {
          const updateUser = await User.findByIdAndUpdate(
            existEmail.id,
            {
              thirdParty: {
                facebookID: id,
              },
            },
            { new: true }
          );
          return updateUser;
        }
      default:
        break;
    }
  }
  // 加密密碼
  password = await bcrypt.hash(randomId(8), 12);
  console.log('email', email, 'password', password, 'name', name, "id", id);
  const newUser = await User.create({
    email: email,
    password: password,
    userName: name,
    thirdParty: {
      googleID: sub || 0,
      facebookID: id || 0,
    },
  });
  return newUser;
};

module.exports = findOrCreateUser;
