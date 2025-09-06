const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');
const {
    getNotifications,
    markAsRead,
    deleteNotification
} = require('../controllers/notificationController');

// All routes require authentication
router.use(authenticateUser);

// Get all notifications for the logged-in user
router.get('/', getNotifications);

// Mark a notification as read
router.patch('/:notificationId/read', markAsRead);

// Delete a notification
router.delete('/:notificationId', deleteNotification);

module.exports = router;
