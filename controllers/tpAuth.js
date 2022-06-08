const { generateRedirectJWT } = require('../handStates/auth');
const findOrCreateUser = require('../helps/findOrCreateUser');
const handleError = require('../handStates/handleError');

const auth = {
  googleCallback: handleError(async (req, res) => {
    const user = await findOrCreateUser('google', req.user._json);
    generateRedirectJWT(user, res);
  }),
  facebookCallback: handleError(async (req, res) => {
    const user = await findOrCreateUser('facebook', req.user._json);
    generateRedirectJWT(user, res);
  }),
};
module.exports = auth;
