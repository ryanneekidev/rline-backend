const notificationsService = require('../../services/notifications/notifications.service');

const getNotifications = async (req, res) => {
    const userId = req.user.id;
    const result = await notificationsService.getNotifications(userId);
    if (result.success) {
        res.status(200).json(result.notifications);
    } else {
        res.status(500).json({ message: result.message });
    }
};

const markAsRead = async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;
    const result = await notificationsService.markAsRead(notificationId, userId);
    if (result.success) {
        res.status(200).json({ message: "Notification marked as read" });
    } else if (result.notFound) {
        res.status(404).json({ message: result.message });
    } else if (result.unauthorized) {
        res.status(403).json({ message: result.message });
    } else {
        res.status(500).json({ message: result.message });
    }
};

const markAllAsRead = async (req, res) => {
    const userId = req.user.id;
    const result = await notificationsService.markAllAsRead(userId);
    if (result.success) {
        res.status(200).json({ message: "All notifications marked as read" });
    } else {
        res.status(500).json({ message: result.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
