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

module.exports = {
    getUsers,
    getUserByUsername,
    getUserByEmail,
    createUser,
    getUserLikedPosts
}