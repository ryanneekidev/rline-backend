const prisma = require('../../db');

async function createNotification(recipientId, actorId, type, postId = null) {
    try {
        return await prisma.notification.create({
            data: {
                recipientId,
                actorId,
                type,
                postId
            }
        });
    } catch (err) {
        console.error("Error creating notification:", err);
        throw err;
    }
}

async function getNotificationsForUser(userId) {
    try {
        return await prisma.notification.findMany({
            where: { recipientId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                actor: {
                    select: { id: true, username: true }
                },
                post: {
                    select: { id: true, title: true }
                }
            }
        });
    } catch (err) {
        console.error("Error fetching notifications:", err);
        throw err;
    }
}

async function markAsRead(notificationId) {
    try {
        return await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
    } catch (err) {
        console.error("Error marking notification as read:", err);
        throw err;
    }
}

async function markAllAsRead(userId) {
    try {
        await prisma.notification.updateMany({
            where: { recipientId: userId, read: false },
            data: { read: true }
        });
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        throw err;
    }
}

async function getNotificationById(notificationId) {
    try {
        return await prisma.notification.findUnique({
            where: { id: notificationId }
        });
    } catch (err) {
        console.error("Error fetching notification:", err);
        throw err;
    }
}

module.exports = {
    createNotification,
    getNotificationsForUser,
    markAsRead,
    markAllAsRead,
    getNotificationById
};
