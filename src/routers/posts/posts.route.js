const postsController = require('../../controllers/posts/posts.controller');
const auth = require('../../middleware/auth.js');
const { createPostValidators, createCommentValidators } = require('../../middleware/validators/posts.validators');
const router = require('express').Router();

router.get("/all", postsController.getAllPosts);
router.get("/:postId", postsController.getPostById);
router.post("/:postId/like", auth, postsController.likePost);
router.post("/:postId/dislike", auth, postsController.dislikePost);
router.post("/:postId/comments/new", auth, createCommentValidators, postsController.createComment);
router.patch("/:postId/comments/:commentId", auth, createCommentValidators, postsController.updateComment);
router.delete("/:postId/comments/:commentId", auth, postsController.deleteComment);
router.post("/new", auth, createPostValidators, postsController.createPost);
router.patch("/:postId", auth, createPostValidators, postsController.updatePost);
router.delete("/:postId", auth, postsController.deletePost);

module.exports = router;