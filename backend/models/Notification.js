const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['task_assignment', 'due_date', 'mention'],
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// Static method to create a notification
notificationSchema.statics.createNotification = async function(notificationData) {
    const notification = await this.create(notificationData);
    return notification.populate([
        { path: 'user', select: 'name email' },
        { path: 'project', select: 'name' },
        { path: 'task', select: 'title' },
        { path: 'comment', select: 'body' }
    ]);
};

module.exports = mongoose.model('Notification', notificationSchema);