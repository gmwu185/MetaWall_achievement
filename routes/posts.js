var express = require('express');
var router = express.Router();
const PostsControllers = require('../controllers/posts');

router.get('/', PostsControllers.getPosts);
router.post('/', PostsControllers.createdPost);
router.delete('/', PostsControllers.delALL);
router.delete('/:id', PostsControllers.delOne);
router.patch('/:id', PostsControllers.upDatePost);

module.exports = router;
