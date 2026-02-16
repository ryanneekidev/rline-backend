const postsController = require('../../controllers/posts/posts.controller');
const router = require('express').Router();

router.get("/all", postsController.getAllPosts);
router.get("/:postId", postsController.getPostById);

module.exports = router;