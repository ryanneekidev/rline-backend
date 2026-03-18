const usersController = require('../../controllers/users/users.controller.js');
const auth = require('../../middleware/auth.js');
const router = require('express').Router();

router.get('/username/:username', usersController.getUserByUsername);
router.get('/:userId/likes', usersController.getUserLikes);
router.get('/:userId/followers', usersController.getFollowers);
router.get('/:userId/following', usersController.getFollowing);
router.get('/:userId/is-following', auth, usersController.isFollowing);
router.get('/:userId/follow-counts', usersController.getFollowCounts);
router.get('/:userId/posts/count', usersController.countUserPosts);
router.post('/follow', auth, usersController.followUser);
router.post('/unfollow', auth, usersController.unfollowUser);

module.exports = router;
