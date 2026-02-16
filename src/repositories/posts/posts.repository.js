const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllPosts() {
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
                        author: true,
                        parentPost: true
                    }
                }
            },
        });
    } catch (err) {
        console.log(err)
    }
}

module.exports = { getAllPosts, getPostById };