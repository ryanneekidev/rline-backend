const userRepository = require('../../repositories/users/user.repository.js');
const notificationsService = require('../notifications/notifications.service');

const getUserLikes = async (userId) => {
    try {
        const likes = await userRepository.getUserLikedPosts(userId);
        return { success: true, likes };
    } catch (error) {
        console.error("Error fetching user likes:", error);
        return { success: false, message: "Failed to fetch user likes" };
    }
};

const followUser = async (followerId, followingId) => {
    if (followerId === followingId) {
        return { success: false, badRequest: true, message: "You cannot follow yourself" };
    }
    try {
        const follow = await userRepository.followUser(followerId, followingId);

        await notificationsService.createNotification(followingId, followerId, 'FOLLOW');

        return { success: true, follow, message: "User followed successfully" };
    } catch (error) {
        console.error("Error following user:", error);
        return { success: false, message: "Failed to follow user" };
    }
};

const unfollowUser = async (followerId, followingId) => {
    try {
        const isFollowing = await userRepository.isFollowing(followerId, followingId);
        if (!isFollowing) {
            return { success: false, notFound: true, message: "You are not following this user" };
        }
        await userRepository.unfollowUser(followerId, followingId);
        return { success: true, message: "User unfollowed successfully" };
    } catch (error) {
        console.error("Error unfollowing user:", error);
        return { success: false, message: "Failed to unfollow user" };
    }
};

const getFollowers = async (userId) => {
    try {
        const followers = await userRepository.getFollowers(userId);
        return { success: true, followers };
    } catch (error) {
        console.error("Error getting followers:", error);
        return { success: false, message: "Failed to get followers" };
    }
};

const getFollowing = async (userId) => {
    try {
        const following = await userRepository.getFollowing(userId);
        return { success: true, following };
    } catch (error) {
        console.error("Error getting following:", error);
        return { success: false, message: "Failed to get following" };
    }
};

const isFollowing = async (followerId, followingId) => {
    try {
        const following = await userRepository.isFollowing(followerId, followingId);
        return { success: true, isFollowing: following };
    } catch (error) {
        console.error("Error checking follow status:", error);
        return { success: false, message: "Failed to check follow status" };
    }
};

const getFollowCounts = async (userId) => {
    try {
        const { followersCount, followingCount } = await userRepository.getFollowCounts(userId);
        return { success: true, followersCount, followingCount };
    } catch (error) {
        console.error("Error getting follow counts:", error);
        return { success: false, message: "Failed to get follow counts" };
    }
};

const getUserByUsername = async (username) => {
    try {
        const user = await userRepository.getUserByUsername(username);
        if (!user) {
            return { success: false, notFound: true, message: "User not found" };
        }
        const { password, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword };
    } catch (error) {
        console.error("Error fetching user:", error);
        return { success: false, message: "Failed to fetch user" };
    }
};

const countUserPosts = async (userId) => {
    try {
        const count = await userRepository.countUserPosts(userId);
        return { success: true, count };
    } catch (error) {
        console.error("Error counting posts:", error);
        return { success: false, message: "Failed to count posts" };
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
