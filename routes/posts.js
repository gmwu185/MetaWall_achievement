var express = require('express');
var router = express.Router();

const appError = require('../customErr/appError');
const handleError = require('../handStates/handleError');

const { isAuth, generateSendJWT } = require('../handStates/auth');

const PostsControllers = require('../controllers/posts');

router.get('/', isAuth, PostsControllers.getPosts());
router.post('/', isAuth, PostsControllers.createdPost());
router.delete('/', isAuth, PostsControllers.delALLPost());
router.delete('/:id', isAuth, PostsControllers.delOnePost());
router.patch('/:id', isAuth, PostsControllers.upDatePost());
router.post('/:id/comment', isAuth, PostsControllers.createComment());
router.delete('/comment/:id', isAuth, PostsControllers.delOneComment());
router.get('/user/:id', PostsControllers.getComment());

module.exports = router;
