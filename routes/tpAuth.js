const express = require('express');
const router = express.Router();
const passport = require('passport');
const AuthController = require('../controllers/tpAuth');

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
  /** #swagger.summary = 'google登入',
   * #swagger.description = 'google登入，前端頁面需有一頁接回傳的token',
   * #swagger.tags = ['tp-auth (第三方登入)'],
   */
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  /** #swagger.summary = 'google登入後callback url',
   * #swagger.description = 'google callback後會將資料寫進user表',
   * #swagger.tags = ['tp-auth (第三方登入)'],
   * #swagger.ignore = true
   */
  AuthController.googleCallback
);

// Facebook OAuth
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['public_profile', 'email'] })
  /** #swagger.summary = 'facebook登入',
   * #swagger.description = 'facebook登入，前端頁面需有一頁接回傳的token',
   * #swagger.tags = ['tp-auth (第三方登入)'],
   */
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: '/sign_in',
  }),
  /** #swagger.summary = 'facebook登入後callback url',
   * #swagger.description = 'facebook callback後會將資料寫進user表',
   * #swagger.tags = ['tp-auth (第三方登入)'],
   * #swagger.ignore = true
   */
  AuthController.facebookCallback
);

module.exports = router;
