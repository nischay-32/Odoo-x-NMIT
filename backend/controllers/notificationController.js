const Notification = require('../models/Notification');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { sendEmail } = require('../utils/emailService');


const getNotifications = async (req, res) => {
    const { unread } = req.query;
    const userId = req.user.userId;

    const query = { user: userId };
    if (unread === 'true') {
        query.isRead = false;
    }

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .populate([
            { path: 'project', select: 'name' },
            { path: 'task', select: 'title' },
            { path: 'comment', select: 'body' }
        ]);

    res.status(StatusCodes.OK).json({ notifications });
};


const markAsRead = async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
        { new: true, runValidators: true }
    );

    if (!notification) {
        throw new CustomError.NotFoundError('Notification not found');
    }

    res.status(StatusCodes.OK).json({ notification });
};

const deleteNotification = async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: userId
    });

    if (!notification) {
        throw new CustomError.NotFoundError('Notification not found');
    }

    res.status(StatusCodes.OK).json({ msg: 'Notification deleted' });
};


const createAndSendNotification = async (notificationData) => {
    try {
        const notification = await Notification.createNotification(notificationData);
        
        // Send email notification
        if (notification.user.email) {
            const emailData = {
                to: notification.user.email,
                subject: 'New Notification',
                text: notification.message,
                html: <p>${notification.message}</p>
            };
            await sendEmail(emailData);
        }

        return notification;
    } catch (error) {
        console.error('Error creating/sending notification:', error);
        return null;
    }
};


const notificationTriggers = {

    onTaskAssignment: async (task, assigneeId) => {
        const message = You have been assigned to the task: ${task.title};
        return createAndSendNotification({
            user: assigneeId,
            type: 'task_assignment',
            message,
            project: task.project,
            task: task._id
        });
    },


    onDueDateReminder: async (task, userId, isOverdue = false) => {
        const status = isOverdue ? 'overdue' : 'due soon';
        const message = Task "${task.title}" is ${status};
        return createAndSendNotification({
            user: userId,
            type: 'due_date',
            message,
            project: task.project,
            task: task._id
        });
    },

    onUserMention: async (mentionedUserId, comment, task) => {
        const message = You were mentioned in a comment on task: ${task.title};
        return createAndSendNotification({
            user: mentionedUserId,
            type: 'mention',
            message,
            project: task.project,
            task: task._id,
            comment: comment._id
        });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    deleteNotification,
    ...notificationTriggers
};