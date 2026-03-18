const notificationsController = require('../../controllers/notifications/notifications.controller');
const auth = require('../../middleware/auth');
const router = require('express').Router();

router.get('/', auth, notificationsController.getNotifications);
router.patch('/read-all', auth, notificationsController.markAllAsRead);
router.patch('/:notificationId/read', auth, notificationsController.markAsRead);

module.exports = router;
