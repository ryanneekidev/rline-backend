const notificationsRepository = require('../../repositories/notifications/notifications.repository');

const createNotification = async (recipientId, actorId, type, postId = null) => {
    if (recipientId === actorId) return;
    try {
        await notificationsRepository.createNotification(recipientId, actorId, type, postId);
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

const getNotifications = async (userId) => {
    try {
        const notifications = await notificationsRepository.getNotificationsForUser(userId);
        return { success: true, notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { success: false, message: "Failed to fetch notifications" };
    }
};

const markAsRead = async (notificationId, userId) => {
    try {
        const notification = await notificationsRepository.getNotificationById(notificationId);
        if (!notification) {
            return { success: false, notFound: true, message: "Notification not found" };
        }
        if (notification.recipientId !== userId) {
            return { success: false, unauthorized: true, message: "Not your notification" };
        }
        await notificationsRepository.markAsRead(notificationId);
        return { success: true };
    } catch (error) {
        console.error("Error marking notification as read:", error);
        return { success: false, message: "Failed to mark notification as read" };
    }
};

const markAllAsRead = async (userId) => {
    try {
        await notificationsRepository.markAllAsRead(userId);
        return { success: true };
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        return { success: false, message: "Failed to mark all notifications as read" };
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead
};
