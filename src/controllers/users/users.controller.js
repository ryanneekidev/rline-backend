const usersService = require('../../services/users/users.service.js');

const getUserLikes = async (req, res) => {
    const { userId } = req.params;
    const result = await usersService.getUserLikes(userId);
    if (result.success) {
        res.status(200).json(result.likes);
    } else {
        res.status(500).json({ message: result.message });
    }
};

const followUser = async (req, res) => {
    const followerId = req.user.id;
    const { followingId } = req.body;
    const result = await usersService.followUser(followerId, followingId);
    if (result.success) {
        res.status(200).json({ follow: result.follow, message: result.message });
    } else {
        res.status(result.badRequest ? 400 : 500).json({ message: result.message });
    }
};

const unfollowUser = async (req, res) => {
    const followerId = req.user.id;
    const { followingId } = req.body;
    const result = await usersService.unfollowUser(followerId, followingId);
    if (result.success) {
        res.status(200).json({ message: result.message });
    } else if (result.notFound) {
        res.status(404).json({ message: result.message });
    } else {
        res.status(500).json({ message: result.message });
    }
};

const getFollowers = async (req, res) => {
    const { userId } = req.params;
    const result = await usersService.getFollowers(userId);
    if (result.success) {
        res.status(200).json(result.followers);
    } else {
        res.status(500).json({ message: result.message });
    }
};

const getFollowing = async (req, res) => {
    const { userId } = req.params;
    const result = await usersService.getFollowing(userId);
    if (result.success) {
        res.status(200).json(result.following);
    } else {
        res.status(500).json({ message: result.message });
    }
};

const isFollowing = async (req, res) => {
    const followerId = req.user.id;
    const followingId = req.params.userId;
    const result = await usersService.isFollowing(followerId, followingId);
    if (result.success) {
        res.status(200).json(result.isFollowing);
    } else {
        res.status(500).json({ message: result.message });
    }
};

const getFollowCounts = async (req, res) => {
    const { userId } = req.params;
    const result = await usersService.getFollowCounts(userId);
    if (result.success) {
        res.status(200).json({ followersCount: result.followersCount, followingCount: result.followingCount });
    } else {
        res.status(500).json({ message: result.message });
    }
};

const getUserByUsername = async (req, res) => {
    const { username } = req.params;
    const result = await usersService.getUserByUsername(username);
    if (result.success) {
        res.status(200).json({ user: result.user });
    } else {
        res.status(result.notFound ? 404 : 500).json({ message: result.message });
    }
};

const countUserPosts = async (req, res) => {
    const { userId } = req.params;
    const result = await usersService.countUserPosts(userId);
    if (result.success) {
        res.status(200).json(result.count);
    } else {
        res.status(500).json({ message: result.message });
    }
};

module.exports = {
    getUserLikes,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    isFollowing,
    getFollowCounts,
    getUserByUsername,
    countUserPosts
};
