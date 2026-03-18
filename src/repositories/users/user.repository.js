const prisma = require('../../db');

async function getUserByUsername(username) {
    try {
        return await prisma.user.findUnique({
            where: {
                username: username
            },
            select: {
                id: true,
                username: true,
                email: true,
                password: true,
                joinedAt: true,
                role: true
            }
        });
    } catch (err) {
        console.error("Error fetching user by username:", err);
        throw err;
    }
}

async function getUserByEmail(email) {
    try {
        return await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                id: true,
                username: true,
                email: true,
                password: true,
                joinedAt: true,
                role: true
            }
        });
    } catch (err) {
        console.error("Error fetching user by email:", err);
        throw err;
    }
}

async function createUser(username, email, password) {
    try {
        return await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: password
            }
        });
    } catch (err) {
        console.error("Error creating user:", err);
        throw err;
    }
}

async function getUserLikedPosts(userId) {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                like: true
            }
        });
        if (!user) {
            console.warn(`User with id ${userId} not found`);
            return null;
        }
        return user.like;
    } catch (err) {
        console.error("Error fetching user liked posts:", err);
        throw err;
    }
}

async function followUser(followerId, followingId) {
    try {
        return await prisma.follow.create({
            data: {
                followerId: followerId,
                followingId: followingId
            }
        });
    } catch (err) {
        console.error("Error following user:", err);
        throw err;
    }
}

async function unfollowUser(followerId, followingId) {
    try {
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: followerId,
                    followingId: followingId
                }
            }
        });
    } catch (err) {
        console.error("Error unfollowing user:", err);
        throw err;
    }
}

async function getFollowers(userId) {
    try {
        const followers = await prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: { id: true, username: true }
                }
            }
        });
        return followers.map(f => f.follower);
    } catch (err) {
        console.error("Error fetching followers:", err);
        throw err;
    }
}

async function getFollowing(userId) {
    try {
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: { id: true, username: true }
                }
            }
        });
        return following.map(f => f.following);
    } catch (err) {
        console.error("Error fetching following:", err);
        throw err;
    }
}

async function isFollowing(followerId, followingId) {
    try {
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: followerId,
                    followingId: followingId
                }
            }
        });
        return follow !== null;
    } catch (err) {
        console.error("Error checking follow status:", err);
        throw err;
    }
}

async function getFollowCounts(userId) {
    try {
        const [followersCount, followingCount] = await Promise.all([
            prisma.follow.count({ where: { followingId: userId } }),
            prisma.follow.count({ where: { followerId: userId } })
        ]);
        return { followersCount, followingCount };
    } catch (err) {
        console.error("Error fetching follow counts:", err);
        throw err;
    }
}

async function countUserPosts(userId) {
    try {
        return await prisma.post.count({
            where: { authorId: userId }
        });
    } catch (err) {
        console.error("Error counting user posts:", err);
        throw err;
    }
}

module.exports = {
    getUserByUsername,
    getUserByEmail,
    createUser,
    getUserLikedPosts,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    isFollowing,
    getFollowCounts,
    countUserPosts
}