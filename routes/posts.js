var express = require('express');
var router = express.Router();

const appError = require('../customErr/appError');
const handleError = require('../handStates/handleError');

const { isAuth, generateSendJWT } = require('../handStates/auth');

const PostsControllers = require('../controllers/posts');

router.get('/', isAuth, PostsControllers.getPosts());
router.post('/', isAuth, PostsControllers.createdPost());
router.delete('/', isAuth, PostsControllers.delALL());
router.delete('/:id', isAuth, PostsControllers.delOne());
router.patch('/:id', isAuth, PostsControllers.upDatePost());

module.exports = router;
