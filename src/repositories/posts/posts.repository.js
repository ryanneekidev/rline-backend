const prisma = require('../../db');

async function getAllPosts() {
    try {
        return await prisma.post.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function getPostById(postId) {
    try {
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
                        author: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                }
            },
        });
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function getExistingLike(userId, postId) {
    try {
        return await prisma.like.findUnique({
            where: {
                userId_postId: { userId, postId }
            }
        });
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function likePost(userId, postId) {
    try {
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
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function dislikePost(postId, likeId) {
    try {
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
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function createComment(content, userId, postId) {
    try {
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
    } catch (err) {
        console.error(err);
        throw err;
    }
}

async function createPost(title, content, authorId, postStatus) {
    try {
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
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = { getAllPosts, getPostById, getExistingLike, likePost, dislikePost, createComment, createPost };