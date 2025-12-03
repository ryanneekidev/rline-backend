const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUsers() {
    return await prisma.user.findMany()
}

async function getUserByUsername(username) {
    try {
        return await prisma.user.findUnique({
            where: {
                username: username
            },
            include: {
                posts: true,
                comments: true,
                like: true
            }
        })
    } catch (err) {
        if (err instanceof PrismaClient.PrismaClientKnownRequestError) {
            res.status(400).json({
                message: error.message,
                code: error.code,
                pass: false
            })
        }
    }
}

async function getUserByEmail(email) {
    return await prisma.user.findUnique({
        where: {
            email: email
        },
        include: {
            posts: true,
            comments: true,
            like: true
        }
    })
}

async function createUser(username, email, password) {
    await prisma.user.create({
        data: {
            username: username,
            email: email,
            password: password
        }
    })
}

async function getUserLikedPosts(userId) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        select: {
            like: true
        }
    })
    return user.like
}

async function likePost(userId, postId) {
    const [like] = await prisma.$transaction([
        prisma.like.create({
            data: {
                userId: userId,
                postId: postId
            }
        }),
        prisma.post.update({
            where: {
                id: postId
            },
            data: {
                likes: { increment: 1 }
            }
        })
    ])
    return like;
}

async function dislikePost(userId, postId, likeId) {
    await prisma.$transaction([
        prisma.like.delete({
            where: {
                id: likeId
            }
        }),
        prisma.post.update({
            where: {
                id: postId
            },
            data: {
                likes: { decrement: 1 }
            }
        })
    ])
}

async function createComment(content, userId, postId) {
    console.log(content + userId + postId)
    await prisma.comment.create({
        data: {
            content: content,
            author: {
                connect: {
                    id: userId
                }
            },
            parentPost: {
                connect: {
                    id: postId
                }
            }
        }
    })
}

async function getPosts() {
    try {
        return await prisma.post.findMany({
            include: {
                author: true,
                comments: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    } catch (err) {
        console.log(err)
    }
}

async function getPost(postId) {
    return await prisma.post.findUnique({
        where: {
            id: postId
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            },
            comments: {
                include: {
                    author: true,
                    parentPost: true
                }
            }
        },
    });
}

async function createPost(title, content, authorId, postStatus) {
    await prisma.post.create({
        data: {
            title: title,
            content: content,
            author: {
                connect: {
                    id: authorId
                }
            },
            postStatus: postStatus
        }
    })
}

async function followUser(followerId, followingId) {
    const follow = await prisma.follow.create({
        data: {
            followerId: followerId,
            followingId: followingId
        }
    })
    return follow;
}

async function unfollowUser(followerId, followingId) {
    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId: followerId,
                followingId: followingId
            }
        }
    })
}

// Get followers of a user (people who follow them)
async function getFollowers(userId) {
    const followers = await prisma.follow.findMany({
        where: {
            followingId: userId
        },
        include: {
            follower: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            }
        }
    })
    return followers.map(f => f.follower);
}

// Get following of a user (people they follow)
async function getFollowing(userId) {
    const following = await prisma.follow.findMany({
        where: {
            followerId: userId
        },
        include: {
            following: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            }
        }
    })
    return following.map(f => f.following);
}

// Check if a user is following another user
async function isFollowing(followerId, followingId) {
    const follow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: followerId,
                followingId: followingId
            }
        }
    })
    return follow !== null;
}

// Get follower/following counts
async function getFollowCounts(userId) {
    const [followersCount, followingCount] = await Promise.all([
        prisma.follow.count({ where: { followingId: userId } }),
        prisma.follow.count({ where: { followerId: userId } })
    ])
    return { followersCount, followingCount };
}

module.exports = {
    getUsers,
    getUserByUsername,
    getUserByEmail,
    createUser,
    getPosts,
    createPost,
    likePost,
    dislikePost,
    getUserLikedPosts,
    createComment,
    getPost,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    isFollowing,
    getFollowCounts
}